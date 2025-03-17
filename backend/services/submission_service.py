import re
import subprocess
import time
import os
import shutil
from datetime import datetime
from models import db, Submission, Testcase, ErrorLog, Score, ExamTask

UPLOADS_FOLDER = os.path.abspath("uploads/testcases")
SUBMISSIONS_FOLDER = os.path.abspath("submissions")

# 📌 Lưu bài làm cho một bài tập
def save_task_submission(data):
    user_id = data["student_id"]
    exam_id = data["contest_id"]
    exam_task_id = data["problem_id"]
    code = data["code"]
    
    # ✅ Đảm bảo thư mục tồn tại
    task_folder = os.path.join(SUBMISSIONS_FOLDER, f"task{exam_task_id}_exam{exam_id}_student{user_id}")
    os.makedirs(task_folder, exist_ok=True)

    # ✅ Lưu file code của thí sinh vào đúng thư mục
    file_path = os.path.join(task_folder, "submission.cpp")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    # ✅ Lưu vào CSDL
    submission = Submission(
        user_id=user_id,
        exam_id=exam_id,
        exam_task_id=exam_task_id,
        file_path_code=file_path,
        submitted_at=datetime.now(),
        execution_time=None,
        is_graded=False,
        score=0,
        output=""
    )

    try:
        db.session.add(submission)
        db.session.commit()
        return submission.id
    except Exception as e:
        db.session.rollback()
        raise ValueError(f"Lỗi khi lưu submission: {str(e)}")

# 📌 Chuẩn hóa output
def normalize_output(output):
    output = output.strip()
    output = re.sub(r'\s+', ' ', output)  # Loại bỏ khoảng trắng thừa
    numbers = re.findall(r'\d+', output)
    return ",".join(numbers) if numbers else output

# 📌 So sánh output thí sinh với output chuẩn
def compare_outputs(expected_output, actual_output):
    return normalize_output(expected_output) == normalize_output(actual_output)

# 📌 Chấm điểm bài nộp của thí sinh
def grade_task_submission(submission_id): #c++
    submission = Submission.query.get(submission_id)
    if not submission:
        raise ValueError("Submission không tồn tại.")

    task = ExamTask.query.get(submission.exam_task_id)
    if not task:
        raise ValueError("Không tìm thấy bài tập.")

    # 📌 Tìm tất cả test case thuộc bài tập
    task_folder = os.path.join(UPLOADS_FOLDER, f"Task{task.id}")
    
    if not os.path.exists(task_folder):
        raise ValueError(f"Không tìm thấy thư mục test case: {task_folder}")
    
    testcases = []
    for test_dir in sorted(os.listdir(task_folder)):  # Duyệt từng thư mục test case
        test_path = os.path.join(task_folder, test_dir)
        if os.path.isdir(test_path):  # Chỉ xét thư mục con (Test1, Test2, ...)
            inp_file = None
            out_file = None
            for filename in os.listdir(test_path):
                if filename.endswith(".INP"):
                    inp_file = os.path.join(test_path, filename)
                elif filename.endswith(".OUT"):
                    out_file = os.path.join(test_path, filename)
            
            if inp_file and out_file:
                testcases.append((inp_file, out_file))

    if not testcases:
        print(f"❌ Lỗi: Không tìm thấy test case hợp lệ cho bài tập {task.id}")
        return
    
    # Tạo thư mục chứa bài nộp của thí sinh
    submission_dir = os.path.abspath(f"submissions/task{task.id}_exam{submission.exam_id}_student{submission.user_id}")
    os.makedirs(submission_dir, exist_ok=True)

    correct_score = task.max_score
    penalty_time = 0.5
    total_execution_time = 0
    final_score = 0
    passed_testcases = 0
    total_testcases = len(testcases)
    submission_output = ""

    print(f"📌 Chấm điểm bài nộp {submission_id} - Task {task.id} - Max Score: {correct_score}")

    for idx, (input_file, expected_output_file) in enumerate(testcases, start=1):
        test_case_folder = os.path.join(submission_dir, f"Test{idx}")  # 📂 Tạo thư mục riêng
        os.makedirs(test_case_folder, exist_ok=True)

        local_input_file = os.path.join(test_case_folder, os.path.basename(input_file))
        local_output_file = os.path.join(test_case_folder, os.path.basename(expected_output_file))

        shutil.copy(input_file, local_input_file)
        shutil.copy(expected_output_file, local_output_file)

        print(f"🔹 Test case {idx}:")
        print(f"   📂 Thư mục test case: {test_case_folder}")
        print(f"   📂 File input sử dụng: {local_input_file}")
        print(f"   📂 File output chuẩn: {local_output_file}")

        start_time = time.time()

        try:
            result = subprocess.run(
                ["g++", submission.file_path_code, "-o", os.path.join(submission_dir, "submission")],
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                print(f"⚠️ Lỗi biên dịch: {result.stderr.strip()}")
                raise RuntimeError(f"Lỗi biên dịch: {result.stderr.strip()}")
            
            
            with open(local_output_file, "w", encoding="utf-8") as output_file:  
                    execution_result = subprocess.run(
                        [os.path.join(submission_dir, "submission")],  # Chạy chương trình đã biên dịch
                        stdin=open(local_input_file, "r"),
                        stdout=output_file,  # Ghi output vào file đúng cách
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=task.execution_time_limit,
                        cwd=test_case_folder  # 📌 Đảm bảo chạy trong thư mục của test case
                    )

            execution_time = time.time() - start_time
            total_execution_time += execution_time

            if os.path.exists(local_output_file):
                with open(local_output_file, "r", encoding="utf-8") as f:
                    output = f.read().strip()
            else:
                output = ""

            submission_output += output + "\n"

        except subprocess.TimeoutExpired:
            log_error(submission.id, "Timeout Error", f"Thời gian chạy vượt {task.execution_time_limit}s")
            continue

        except RuntimeError as e:
            log_error(submission.id, "Compilation Error", str(e))
            continue

        with open(expected_output_file, "r", encoding="utf-8") as f:
            expected_output = f.read().strip()

        if output == expected_output:
            passed_testcases += 1

    if total_testcases > 0:
        final_score = (passed_testcases / total_testcases) * correct_score

    print(f"📌 Điểm số tính được: {final_score}/{correct_score} - Đúng {passed_testcases}/{total_testcases} test case")

    if total_execution_time > task.execution_time_limit:
        final_score = max(final_score - penalty_time, 0)

    submission.execution_time = total_execution_time
    submission.is_graded = True
    submission.score = final_score
    submission.output = submission_output.strip()
    db.session.commit()

    save_score(submission.user_id, submission.exam_id)

    print(f"📌 Chấm điểm xong: [User {submission.user_id}] [Exam {submission.exam_id}] [Task {task.id}] Điểm: {final_score}/{correct_score} | Đúng {passed_testcases}/{total_testcases} test cases | Thời gian chạy: {total_execution_time:.2f}s")


# 📌 Lưu tổng điểm vào bảng scores
def save_score(user_id, exam_id):
    total_score = db.session.query(db.func.sum(Submission.score)).filter_by(user_id=user_id, exam_id=exam_id, is_graded=True).scalar() or 0
    score_entry = Score.query.filter_by(user_id=user_id, exam_id=exam_id).first()
    if not score_entry:
        score_entry = Score(user_id=user_id, exam_id=exam_id, total_score=total_score, graded_at=db.func.now())
    else:
        score_entry.total_score = total_score
        score_entry.graded_at = db.func.now()

    db.session.add(score_entry)
    db.session.commit()


# 📌 Ghi log lỗi vào bảng ErrorLog
def log_error(submission_id, error_type, message, line_number=None):
    safe_message = message.encode("utf-8", "replace").decode("utf-8")
    db.session.add(
        ErrorLog(
            submission_id=submission_id,
            line_number=line_number,
            error_message=f"{error_type}: {safe_message}"
        )
    )
    db.session.commit()

def check_all_submitted_service(exam_id, student_id):
    """
    Kiểm tra xem thí sinh đã nộp đủ tất cả bài tập trong kỳ thi chưa.
    
    - Nếu số bài nộp = số task trong kỳ thi → Trả về True
    - Nếu số bài nộp < số task trong kỳ thi → Trả về False
    """
    try:
        # ✅ Đếm tổng số bài tập trong kỳ thi
        total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()

        # ✅ Đếm số bài đã nộp của thí sinh
        submitted_tasks = Submission.query.filter_by(exam_id=exam_id, user_id=student_id).count()

        return submitted_tasks >= total_tasks  # Trả về True nếu đã nộp đủ, False nếu chưa đủ

    except Exception as e:
        print(f"⚠️ Lỗi kiểm tra bài nộp: {str(e)}")
        return False