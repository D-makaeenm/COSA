import re
import subprocess
import time
import json
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

# Chấm điểm bài nộp
def grade_task_submission(submission_id):
    submission = Submission.query.get(submission_id)
    if not submission:
        raise ValueError("Submission không tồn tại.")

    task = ExamTask.query.get(submission.exam_task_id)
    if not task:
        raise ValueError("Không tìm thấy bài tập.")

    # Lấy tất cả test case cho bài tập
    testcases = Testcase.query.filter_by(exam_task_id=submission.exam_task_id).all()
    if not testcases:
        raise ValueError("Không tìm thấy test case cho bài nộp.")

    passed_test_cases = 0
    total_execution_time = 0
    penalty = 0  # Khởi tạo điểm trừ do vượt quá thời gian
    total_score = 0  # Tổng điểm cho bài này

    try:
        for testcase in testcases:
            start_time = time.time()

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

            output = normalize_output(result.stdout)
            expected_output = normalize_output(testcase.expected_output)

            # Log các thông tin quan trọng để debug
            print(f"Testcase: {testcase.id}, Execution Time: {execution_time:.4f}, Expected: {expected_output}, Got: {output}")
            
            if result.stderr.strip():
                log_error(submission.id, "Runtime Error", result.stderr.strip())
                submission.is_graded = True
                db.session.commit()
                return

            if compare_outputs(expected_output, output):
                passed_test_cases += 1
            else:
                log_error(submission.id, "Wrong Output", f"Expected: {expected_output}, Got: {output}")

            # Tính điểm trừ nếu vượt quá thời gian
            if execution_time > testcase.time_limit:
                penalty += task.penalty_per_time_over  # Trừ thêm điểm nếu vượt quá thời gian

        # Tính điểm cuối cùng cho từng bài
        task_max_score = task.max_score  # Điểm tối đa cho bài này
        task_score = (passed_test_cases / len(testcases)) * task_max_score  # Chấm điểm theo số test case đúng
        final_score = max(task_score - penalty, 0)  # Điểm cuối cùng sau khi trừ điểm

        total_score += final_score  # Cộng điểm cho bài này

        # Log điểm cuối cùng của bài
        print(f"Final score for task {task.id}: {final_score}, Total penalty: {penalty}")

        submission.execution_time = total_execution_time
        submission.is_graded = True
        db.session.commit()

        # Lưu kết quả vào bảng grading_results cho từng tiêu chí
        grading_criteria = GradingCriteria.query.filter_by(exam_task_id=task.id).all()
        for criteria in grading_criteria:
            grading_result = GradingResult(
                submission_id=submission.id,
                criteria_id=criteria.id,
                score=final_score if criteria.criteria_name == "Kết quả đúng" else 0  # Cập nhật điểm cho "Kết quả đúng"
            )
            db.session.add(grading_result)

        # Cập nhật điểm tổng cho thí sinh vào bảng scores
        save_score(submission.user_id, submission.exam_id, total_score)

        # Gửi thông báo
        send_notification(submission.user_id, f"Điểm: {final_score:.2f}, Thời gian: {total_execution_time:.2f}s")

    except Exception as e:
        log_error(submission.id, "Grading Error", str(e))
    finally:
        db.session.commit()

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

# Lưu điểm cuối cùng của kỳ thi
def save_score(user_id, exam_id, total_score):
    score_entry = Score.query.filter_by(user_id=user_id, exam_id=exam_id).first()
    if not score_entry:
        # Khi không tìm thấy điểm của thí sinh trong bảng, tạo mới
        score_entry = Score(user_id=user_id, exam_id=exam_id, total_score=total_score, graded_at=db.func.now())
    else:
        # Cập nhật điểm tổng cho thí sinh
        score_entry.total_score = total_score
        score_entry.graded_at = db.func.now()

    db.session.add(score_entry)
    db.session.commit()


# Gửi thông báo cho thí sinh
def send_notification(user_id, message):
    db.session.add(Notification(user_id=user_id, message=message, created_at=db.func.now()))
    db.session.commit()

# Tính điểm tổng cuối cùng của thí sinh
def calculate_final_score_service(exam_id, student_id):
    # Lấy tất cả bài nộp đã được chấm điểm
    submissions = Submission.query.filter_by(exam_id=exam_id, user_id=student_id, is_graded=True).all()
    total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()

    if len(submissions) < total_tasks:
        return {"status": "pending", "score": None}

    total_score = 0

    # Duyệt qua tất cả các bài nộp và tính tổng điểm từ bảng GradingResult
    for submission in submissions:
        grading_results = GradingResult.query.filter_by(submission_id=submission.id).all()
        task_score = 0
        for grading_result in grading_results:
            task_score += grading_result.score  # Cộng điểm theo từng tiêu chí
        total_score += task_score

        # Log tổng điểm của bài nộp
        print(f"Submission {submission.id} - Total Task Score: {task_score}, Accumulated Total Score: {total_score}")

    # Cập nhật điểm tổng cho thí sinh vào bảng Score
    save_score(student_id, exam_id, total_score)

    return {"status": "completed", "score": total_score}




# Kiểm tra xem thí sinh đã nộp đủ bài chưa
def check_all_submitted_service(exam_id, student_id):
    total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()
    return Submission.query.filter_by(exam_id=exam_id, user_id=student_id).count() >= total_tasks
