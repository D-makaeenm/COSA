from models import User, Exam, ExamParticipant, ExamTask, Submission, db
from sqlalchemy import and_, func
from datetime import datetime, timedelta
import subprocess
import os

def get_ongoing_exam_service(user_id):
    """
    Lấy thông tin cuộc thi đang diễn ra cho thí sinh.
    """
    user = User.query.get(user_id)
    if user.role != 'student':
        raise ValueError("Only students can access this resource")

    ongoing_exam = (
        db.session.query(Exam)
        .join(ExamParticipant, and_(ExamParticipant.exam_id == Exam.id, ExamParticipant.user_id == user_id))
        .filter(
            Exam.status == "ongoing",
            ExamParticipant.delete_at.is_(None)
        )
        .first()
    )

    if not ongoing_exam:
        raise ValueError("No ongoing exam found")

    return {
        "id": ongoing_exam.id,
        "title": ongoing_exam.title,
        "start_time": ongoing_exam.start_time,
        "end_time": ongoing_exam.end_time
    }


def get_exam_questions_service(exam_id, user_id):
    # Kiểm tra nếu người dùng tham gia kỳ thi
    exam_participant = ExamParticipant.query.filter_by(
        exam_id=exam_id, user_id=user_id, delete_at=None
    ).first()
    if not exam_participant:
        raise ValueError("User is not assigned to this exam.")

    # Lấy thông tin kỳ thi
    exam = Exam.query.get(exam_id)
    if not exam:
        raise ValueError("Exam not found.")

    # Lấy danh sách câu hỏi
    tasks = ExamTask.query.filter_by(exam_id=exam_id).all()

    return {
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "start_time": exam.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": exam.end_time.strftime("%Y-%m-%d %H:%M:%S"),
        },
        "tasks": [
            {
                "id": task.id,
                "task_title": task.task_title,
                "task_description": task.task_description,
                "max_score": task.max_score,
                "execution_time_limit": task.execution_time_limit,
            }
            for task in tasks
        ],
    }



def submit_exam_task_service(user_id, exam_id, data):
    """
    Xử lý nộp bài thi.
    """
    user = User.query.get(user_id)
    if user.role != 'student':
        raise ValueError("Only students can submit tasks")

    exam_task_id = data.get("exam_task_id")
    code = data.get("code")

    if not exam_task_id or not code:
        raise ValueError("Missing required fields")

    participation = ExamParticipant.query.filter_by(exam_id=exam_id, user_id=user_id, delete_at=None).first()
    if not participation:
        raise ValueError("You are not assigned to this exam")

    exam_task = ExamTask.query.filter_by(id=exam_task_id, exam_id=exam_id).first()
    if not exam_task:
        raise ValueError("Invalid exam task")

    score, execution_time, error_message = grade_submission(code, exam_task)

    new_submission = Submission(
        user_id=user_id,
        exam_task_id=exam_task_id,
        exam_id=exam_id,
        file_path="submissions/...",  # Đường dẫn file lưu trữ (giả định)
        execution_time=execution_time,
        score=score,
        is_graded=1 if error_message is None else 0
    )
    db.session.add(new_submission)
    db.session.commit()

    if error_message:
        return {"error": error_message}

    return {"message": "Submission graded successfully", "score": score}


def grade_submission(code, exam_task):
    """
    Chấm điểm tự động bài nộp.
    """
    try:
        execution_time = 0.5  # Giả định thời gian thực thi
        score = 10.0  # Giả định điểm tối đa
        return score, execution_time, None
    except Exception as e:
        return 0, None, str(e)


def start_exam_service(user_id, exam_id):
    participation = ExamParticipant.query.filter_by(
        user_id=user_id, exam_id=exam_id, delete_at=None
    ).first()
    if not participation:
        raise ValueError("You are not registered for this exam")

    exam = Exam.query.get(exam_id)
    if not exam:
        raise ValueError("Exam not found")

    if not participation.start_time:
        participation.start_time = datetime.utcnow()
        db.session.commit()

    # Tính thời gian đếm ngược (giây)
    exam_duration_seconds = (exam.end_time - exam.start_time).total_seconds()

    return {
        "remaining_time_seconds": max(
            exam_duration_seconds - (datetime.utcnow() - participation.start_time).total_seconds(),
            0,
        ),
        "exam_duration_seconds": exam_duration_seconds,
    }

def get_question_details(user_id, exam_id, question_id):
    """
    Lấy chi tiết câu hỏi cho thí sinh, bao gồm nội dung bài làm nếu đã nộp.
    """
    # Tìm câu hỏi trong kỳ thi
    question = ExamTask.query.filter_by(id=question_id, exam_id=exam_id).first()
    if not question:
        raise ValueError("Câu hỏi không tồn tại hoặc không thuộc kỳ thi này.")

    # Kiểm tra xem thí sinh đã nộp bài chưa
    submission = Submission.query.filter_by(exam_task_id=question_id, user_id=user_id).first()
    is_submitted = submission is not None

    # Đọc nội dung file nếu bài đã nộp
    submitted_code = None
    if is_submitted and submission.file_path:
        try:
            with open(submission.file_path, 'r', encoding='utf-8') as f:
                submitted_code = f.read()
        except FileNotFoundError:
            submitted_code = "File không tồn tại hoặc đã bị xóa."

    # Trả thông tin câu hỏi và nội dung bài nộp
    return {
        "task_title": question.task_title,
        "task_description": question.task_description,
        "max_score": question.max_score,
        "execution_time_limit": question.execution_time_limit,
        "is_submitted": is_submitted,
        "submitted_code": submitted_code
    }


def submit_code_service(user_id, exam_id, question_id, code):
    """
    Lưu bài làm, thực thi mã nguồn và chấm điểm.
    """
    # Tạo đường dẫn file để lưu mã nguồn
    file_path = f"submissions/task_{question_id}_exam_{exam_id}_student_{user_id}.py"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(code)

    # Thực thi mã nguồn và chấm điểm
    score, execution_time, details = grade_code(file_path, question_id)

    # Lưu kết quả vào bảng submissions
    submission = Submission(
        user_id=user_id,
        exam_task_id=question_id,
        file_path=file_path,
        exam_id=exam_id,
        submitted_at=datetime.utcnow(),
        execution_time=execution_time,
        score=score,
        is_graded=True,
    )
    db.session.add(submission)
    db.session.commit()

    return {
        "message": "Bài làm đã được chấm.",
        "score": score,
        "details": details,
    }


def grade_code(file_path, question_id):
    """
    Thực thi mã nguồn và so sánh với các test case.
    """
    from models import TestCase  # Import trong service để tránh circular import

    test_cases = TestCase.query.filter_by(exam_task_id=question_id).all()
    total_score = 0
    execution_time = 0
    details = []

    for test_case in test_cases:
        try:
            start_time = datetime.now()
            process = subprocess.run(
                ["python3", file_path],
                input=test_case.input_data.encode(),
                capture_output=True,
                text=True,
                timeout=5,
            )
            end_time = datetime.now()
            execution_time += (end_time - start_time).total_seconds()

            if process.stdout.strip() == test_case.expected_output.strip():
                total_score += test_case.score
                details.append({"input": test_case.input_data, "status": "Passed"})
            else:
                details.append({
                    "input": test_case.input_data,
                    "expected": test_case.expected_output,
                    "received": process.stdout.strip(),
                    "status": "Failed",
                })

        except subprocess.TimeoutExpired:
            details.append({
                "input": test_case.input_data,
                "status": "Timeout",
            })

    return total_score, execution_time, details