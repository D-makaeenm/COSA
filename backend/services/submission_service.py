import os
import subprocess
from models import db, Submission, Testcase, GradingCriteria, ErrorLog, Score, Notification, ExamTask
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.exc import SQLAlchemyError
import time

# Lưu bài làm cho một bài tập
def save_task_submission(data):
    # Tạo file path cho bài làm
    file_path = f"submissions/task{data['problem_id']}_exam{data['contest_id']}_student{data['student_id']}.py"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)  # Tạo thư mục nếu chưa tồn tại

    # Lưu mã nguồn vào file
    with open(file_path, 'w') as f:
        f.write(data['code'])

    # Lưu vào bảng `submissions`
    submission = Submission(
        user_id=data['student_id'],
        exam_task_id=data['problem_id'],
        exam_id=data['contest_id'],
        file_path=file_path,
        submitted_at=datetime.now(),
        is_graded=False
    )
    db.session.add(submission)
    db.session.commit()
    return submission.id

# Chấm điểm bài nộp cho một bài tập
def grade_task_submission(submission_id):
    """
    Hàm chấm bài nộp theo các tiêu chí và test case.
    """
    submission = Submission.query.get(submission_id)
    if not submission:
        raise ValueError("Submission không tồn tại.")

    # Lấy test cases cho bài nộp
    test_cases = Testcase.query.filter_by(exam_id=submission.exam_id).all()
    if not test_cases:
        raise ValueError("Không có test case nào cho bài nộp này.")

    # Lấy tiêu chí chấm điểm cho kỳ thi
    grading_criteria = GradingCriteria.query.filter_by(exam_id=submission.exam_id).all()
    if not grading_criteria:
        raise ValueError("Không có tiêu chí chấm điểm nào cho kỳ thi này.")

    task_score = 0  # Điểm của bài tập nhỏ này
    passed_test_cases = 0  # Đếm số test case đúng
    total_execution_time = 0  # Tổng thời gian chạy

    try:
        for test_case in test_cases:
            try:
                # Đo thời gian bắt đầu
                start_time = time.time()

                # Chạy bài nộp với test case
                result = subprocess.run(
                    ["python", submission.file_path],
                    input=test_case.input,
                    capture_output=True,
                    text=True,
                    timeout=test_case.execution_time
                )

                # Đo thời gian kết thúc
                execution_time = time.time() - start_time
                total_execution_time += execution_time

                # Kiểm tra đầu ra
                if result.stdout.strip() == test_case.expected_output.strip():
                    passed_test_cases += 1

            except subprocess.TimeoutExpired:
                log_error(submission_id, "Timeout", "Bài nộp vượt quá thời gian cho phép.")
            except Exception as e:
                log_error(submission_id, "Runtime Error", str(e))

        # Áp dụng tiêu chí chấm điểm
        if passed_test_cases == len(test_cases):  # Đúng tất cả test cases
            task_score += grading_criteria[0].max_score
        elif passed_test_cases >= 1:  # Đúng ít nhất 1 test case
            task_score += grading_criteria[2].max_score
        else:  # Sai toàn bộ test case
            task_score += grading_criteria[3].max_score  # Có thể là 0 điểm

        # Thêm điểm cho thời gian chạy tốt (nếu thời gian thực thi thấp hơn mức cho phép)
        if all(tc.execution_time >= total_execution_time for tc in test_cases):
            task_score += grading_criteria[1].max_score

        # Lưu điểm và thời gian chạy vào bảng submissions
        submission.score = task_score
        submission.execution_time = total_execution_time
        submission.is_graded = 1

        # Gửi thông báo điểm cho bài tập nhỏ
        message = f"Bài tập của bạn đã được chấm. Điểm: {task_score}. Thời gian chạy: {total_execution_time:.2f} giây."
        send_notification(submission.user_id, message)

    except Exception as e:
        log_error(submission_id, "Grading Error", f"Lỗi khi chấm bài: {str(e)}")
    finally:
        db.session.commit()


def log_error(submission_id, error_type, message):
    """
    Lưu lỗi vào bảng error_logs.
    """
    error_log = ErrorLog(
        submission_id=submission_id,
        line_number=None,
        error_message=f"{error_type}: {message}"
    )
    db.session.add(error_log)


def save_score(user_id, exam_id, score):
    """
    Lưu điểm vào bảng scores.
    """
    score_entry = Score(
        user_id=user_id,
        exam_id=exam_id,
        scores=score,
        graded_at=datetime.now()
    )
    db.session.add(score_entry)


def send_notification(user_id, message):
    """
    Gửi thông báo tới bảng notifications.
    """
    notification = Notification(
        user_id=user_id,
        message=message,
        created_at=datetime.now()
    )
    db.session.add(notification)



# Tính điểm tổng khi tất cả các bài tập đã chấm xong
def calculate_final_score_service(exam_id, student_id):
    """
    Tính điểm tổng của thí sinh trong kỳ thi.
    """
    # Lấy tất cả bài nộp đã được chấm trong kỳ thi
    submissions = Submission.query.filter_by(exam_id=exam_id, user_id=student_id, is_graded=True).all()

    # Kiểm tra nếu còn bài chưa được chấm
    total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()
    if len(submissions) < total_tasks:
        return {"status": "pending", "score": None, "details": "Not all tasks have been graded yet."}

    # Tính tổng điểm từ bảng submissions
    total_score = sum(submission.score for submission in submissions if submission.score is not None)

    # Lưu điểm tổng vào bảng scores
    save_total_score_service(student_id, exam_id, total_score)

    return {"status": "completed", "score": total_score}


def save_total_score_service(user_id, exam_id, total_score):
    """
    Lưu điểm tổng vào bảng scores.
    """
    score_entry = Score.query.filter_by(user_id=user_id, exam_id=exam_id).first()
    if not score_entry:
        score_entry = Score(
            user_id=user_id,
            exam_id=exam_id,
            scores=total_score,
            graded_at=datetime.now()
        )
    else:
        score_entry.scores = total_score
        score_entry.graded_at = datetime.now()

    db.session.add(score_entry)
    db.session.commit()


def check_all_submitted_service(exam_id, student_id):
    """
    Kiểm tra xem tất cả các bài trong kỳ thi đã được nộp hay chưa.
    """
    try:
        # Lấy tất cả bài nộp của thí sinh
        submissions = Submission.query.filter_by(exam_id=exam_id, user_id=student_id).all()
        # Lấy tất cả các bài tập trong kỳ thi
        exam_tasks = ExamTask.query.filter_by(exam_id=exam_id).all()

        # So sánh số lượng bài nộp và bài tập
        return len(submissions) >= len(exam_tasks)
    except SQLAlchemyError as e:
        raise ValueError(f"Lỗi cơ sở dữ liệu: {str(e)}")


def grade_task_service(submission_id):
    """
    Chấm điểm bài nộp cụ thể.
    """
    from services.grading_service import grade_task_submission

    try:
        grade_task_submission(submission_id)
    except Exception as e:
        raise ValueError(f"Lỗi khi chấm điểm bài nộp: {str(e)}")