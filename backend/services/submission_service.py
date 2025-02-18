import re
import subprocess
import time
import ast
from datetime import datetime
from models import db, Submission, Testcase, ErrorLog, Score, Notification, ExamTask, GradingCriteria, GradingResult

# Lưu bài làm cho một bài tập
def save_task_submission(data):
    user_id = data["student_id"]
    exam_id = data["contest_id"]
    problem_id = data["problem_id"]
    code = data["code"]
    
    # 🔍 Xác định `exam_task_id` từ bảng `exam_tasks`
    exam_task = ExamTask.query.filter(
        ExamTask.exam_id == exam_id,
        ExamTask.task_title.like(f'Bài {problem_id}%')
    ).first()

    if not exam_task:
        raise ValueError(f"Không tìm thấy bài tập số {problem_id} trong kỳ thi {exam_id}")

    exam_task_id = exam_task.id

    # Lưu mã vào file
    file_path = f"submissions/task{exam_task_id}_exam{exam_id}_student{user_id}.py"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    # ✅ Lưu bài nộp vào database
    submission = Submission(
        user_id=user_id,
        exam_id=exam_id,
        exam_task_id=exam_task_id,  # ✅ Lưu đúng `exam_task_id`
        file_path=file_path,
        submitted_at=datetime.now(),
    )

    try:
        db.session.add(submission)
        db.session.commit()
        return submission.id  # ✅ Trả về submission_id sau khi lưu
    except Exception as e:
        raise ValueError(f"Lỗi khi lưu submission: {str(e)}")

# Chuẩn hóa đầu ra để so sánh chính xác
def normalize_output(output):
    output = output.strip()

    if re.match(r'^[\d\s,-]+$', output):
        return re.sub(r'[^0-9,-]', '', output)

    elif re.search(r'\d+,\d+', output):  
        numbers = re.findall(r'\d+', output)
        return ",".join(numbers)

    elif re.search(r"'(.*?)'", output):
        match = re.search(r"'(.*?)'", output)
        return match.group(1)

    return output

# So sánh output để debug nếu có sai khác
def compare_outputs(expected_output, actual_output):
    expected_output = normalize_output(expected_output)
    actual_output = normalize_output(actual_output)

    if expected_output == actual_output:
        return True
    else:
        print(f"❌ Debug Expected: {repr(expected_output)}")
        print(f"❌ Debug Got: {repr(actual_output)}")
        return False


def grade_task_submission(submission_id):
    submission = Submission.query.get(submission_id)
    if not submission:
        raise ValueError("Submission không tồn tại.")

    task = ExamTask.query.get(submission.exam_task_id)
    if not task:
        raise ValueError("Không tìm thấy bài tập.")

    # Lấy tất cả test cases
    testcases = Testcase.query.filter_by(exam_task_id=submission.exam_task_id).all()
    if not testcases:
        raise ValueError("Không tìm thấy test case cho bài nộp.")

    # Lấy tiêu chí chấm điểm
    grading_criteria_dict = {crit.criteria_name: crit.penalty for crit in GradingCriteria.query.filter_by(exam_task_id=task.id).all()}

    # Xác định điểm tối đa và điểm trừ
    correct_score = grading_criteria_dict.get("Điểm nếu đúng", task.max_score)  # Điểm nếu đúng
    penalty_time = grading_criteria_dict.get("Điểm trừ nếu vượt quá thời gian", 0.5)  # Điểm trừ nếu vượt quá thời gian

    total_execution_time = 0
    total_penalty = 0
    final_score = correct_score  # Ban đầu, giả định bài đúng
    all_correct = True  # Kiểm tra xem tất cả testcase có đúng không

    try:
        for testcase in testcases:
            start_time = time.time()
            execution_time = None

            try:
                result = subprocess.run(
                    ["python", "-X", "utf8", submission.file_path],
                    input=testcase.input,
                    capture_output=True,
                    text=True,
                    timeout=testcase.time_limit,
                    encoding="utf-8",
                    errors="replace"
                )
                execution_time = time.time() - start_time
                total_execution_time += execution_time

            except subprocess.TimeoutExpired:
                execution_time = testcase.time_limit * 1.5  # Giả định bài chạy quá lâu
                total_execution_time += execution_time
                total_penalty += penalty_time  # Trừ điểm do vượt thời gian
                log_error(submission.id, "Timeout Error", f"Thời gian chạy vượt {testcase.time_limit}s")
                continue

            output = normalize_output(result.stdout)
            expected_output = normalize_output(testcase.expected_output)

            # Xử lý lỗi runtime
            if result.stderr.strip():
                log_error(submission.id, "Runtime Error", result.stderr.strip())
                final_score = 0  # Nếu có lỗi runtime, mất toàn bộ điểm
                all_correct = False
                break

            # Nếu sai kết quả → Mất toàn bộ điểm
            if not compare_outputs(expected_output, output):
                final_score = 0
                all_correct = False
                log_error(submission.id, "Wrong Output", f"Expected: {expected_output}, Got: {output}")
                break

            # Nếu đúng nhưng vượt thời gian → Trừ điểm
            if execution_time > testcase.time_limit:
                total_penalty += penalty_time

        # Tính điểm cuối cùng
        final_score = max(final_score - total_penalty, 0)

        # ✅ Cập nhật Submission
        submission.execution_time = total_execution_time
        submission.is_graded = True
        submission.total_score = final_score
        db.session.commit()

        # ✅ Lưu vào bảng grading_results
        # Lưu điểm nếu đúng
        correct_criteria = GradingCriteria.query.filter_by(exam_task_id=task.id, criteria_name="Điểm nếu đúng").first()
        if correct_criteria:
            grading_result = GradingResult(
                submission_id=submission.id,
                criteria_id=correct_criteria.id,
                score=correct_score if all_correct else 0  # Nếu bài sai, điểm là 0
            )
            db.session.add(grading_result)

        # Lưu điểm trừ nếu vượt quá thời gian
        penalty_criteria = GradingCriteria.query.filter_by(exam_task_id=task.id, criteria_name="Điểm trừ nếu vượt quá thời gian").first()
        if penalty_criteria and total_penalty > 0:
            grading_result = GradingResult(
                submission_id=submission.id,
                criteria_id=penalty_criteria.id,
                score=-total_penalty  # Điểm trừ nếu vượt quá thời gian
            )
            db.session.add(grading_result)

        # ✅ Cập nhật điểm tổng vào bảng scores
        save_score(submission.user_id, submission.exam_id)

        # ✅ Gửi thông báo cho thí sinh
        send_notification(submission.user_id, f"Điểm: {final_score:.2f}, Thời gian: {total_execution_time:.2f}s")

    except Exception as e:
        log_error(submission.id, "Grading Error", str(e))
    finally:
        db.session.commit()

# Lưu điểm cuối cùng của kỳ thi
def save_score(user_id, exam_id):
    """
    Cập nhật tổng điểm của thí sinh từ grading_results
    """
    # ✅ Lấy tổng điểm từ tiêu chí "Điểm nếu đúng"
    total_correct_score = db.session.query(db.func.sum(GradingResult.score)).join(GradingCriteria).join(Submission).filter(
        Submission.user_id == user_id,
        Submission.exam_id == exam_id,
        GradingCriteria.criteria_name == "Điểm nếu đúng"
    ).scalar() or 0  # Nếu không có, mặc định là 0

    # ✅ Lấy tổng điểm trừ do tiêu chí "Điểm trừ nếu vượt quá thời gian"
    total_penalty = db.session.query(db.func.sum(GradingResult.score)).join(GradingCriteria).join(Submission).filter(
        Submission.user_id == user_id,
        Submission.exam_id == exam_id,
        GradingCriteria.criteria_name == "Điểm trừ nếu vượt quá thời gian"
    ).scalar() or 0  # Nếu không có, mặc định là 0

    # ✅ Tính điểm tổng từ grading_results
    final_score = max(total_correct_score + total_penalty, 0)

    score_entry = Score.query.filter_by(user_id=user_id, exam_id=exam_id).first()

    if not score_entry:
        score_entry = Score(user_id=user_id, exam_id=exam_id, total_score=final_score, graded_at=db.func.now())
    else:
        score_entry.total_score = final_score
        score_entry.graded_at = db.func.now()

    print(f"📌 Cập nhật điểm tổng: User {user_id}, Exam {exam_id}, Total Score: {final_score}")

    db.session.add(score_entry)
    db.session.commit()


def calculate_final_score_service(exam_id, student_id):
    """
    Tính tổng điểm cho một thí sinh dựa trên `grading_results`
    """
    submissions = Submission.query.filter_by(exam_id=exam_id, user_id=student_id, is_graded=True).all()
    total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()

    # Nếu thí sinh chưa hoàn thành tất cả bài thi
    if len(submissions) < total_tasks:
        return {"status": "pending", "score": None}

    total_score = 0

    for submission in submissions:
        # ✅ Lấy điểm nếu bài đúng
        task_score = db.session.query(db.func.sum(GradingResult.score)).join(GradingCriteria).filter(
            GradingResult.submission_id == submission.id,
            GradingCriteria.criteria_name == "Điểm nếu đúng"
        ).scalar() or 0

        # ✅ Lấy điểm trừ nếu vượt quá thời gian
        penalty = db.session.query(db.func.sum(GradingResult.score)).join(GradingCriteria).filter(
            GradingResult.submission_id == submission.id,
            GradingCriteria.criteria_name == "Điểm trừ nếu vượt quá thời gian"
        ).scalar() or 0

        # ✅ Tổng điểm từng task
        final_task_score = max(task_score + penalty, 0)  # Đảm bảo không âm
        total_score += final_task_score

        print(f"✅ Submission {submission.id} - Score: {final_task_score} (Task: {task_score}, Penalty: {penalty})")

    # ✅ Cập nhật tổng điểm vào bảng Score, TRUYỀN final_score vào
    save_score(student_id, exam_id, total_score)

    return {"status": "completed", "score": total_score}

# Ghi lỗi vào cơ sở dữ liệu với dòng lỗi nếu có
def log_error(submission_id, error_type, message, line_number=None):
    safe_message = message.encode("utf-8", "replace").decode("utf-8")  # Xử lý Unicode
    db.session.add(
        ErrorLog(
            submission_id=submission_id,
            line_number=line_number,
            error_message=f"{error_type}: {safe_message}"
        )
    )
    db.session.commit()

# Gửi thông báo cho thí sinh
def send_notification(user_id, message):
    db.session.add(Notification(user_id=user_id, message=message, created_at=db.func.now()))
    db.session.commit()

# Kiểm tra xem thí sinh đã nộp đủ bài chưa
def check_all_submitted_service(exam_id, student_id):
    total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()
    return Submission.query.filter_by(exam_id=exam_id, user_id=student_id).count() >= total_tasks
