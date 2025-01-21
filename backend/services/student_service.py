from models import User, Exam, ExamParticipant, ExamTask, Submission, db
from sqlalchemy import and_, func
from datetime import datetime, timedelta

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
