from flask import Blueprint, request, jsonify
from models import db, ExamTask, GradingCriteria, Testcase

exam_tasks_bp = Blueprint("exam_tasks", __name__)

# Lấy danh sách bài tập của kỳ thi
@exam_tasks_bp.route("/<int:exam_id>", methods=["GET"])
def get_exam_tasks(exam_id):
    tasks = ExamTask.query.filter(ExamTask.exam_id == exam_id, ExamTask.delete_at == None).all()
    
    return jsonify([
        {
            "id": task.id,
            "task_title": task.task_title,
            "task_description": task.task_description,
            "max_score": task.max_score,
            "execution_time_limit": task.execution_time_limit,
            "grading_criteria": [
                {
                    "criteria_name": criteria.criteria_name,
                    "penalty": criteria.penalty  # Trả về điểm trừ từ GradingCriteria
                }
                for criteria in GradingCriteria.query.filter_by(exam_task_id=task.id).all()
            ],
            "testcases": [
                {
                    "input": testcase.input,
                    "expected_output": testcase.expected_output,
                    "time_limit": testcase.time_limit
                }
                for testcase in Testcase.query.filter_by(exam_task_id=task.id).all()
            ]
        }
        for task in tasks
    ])


# Thêm bài tập mới
@exam_tasks_bp.route("/add-task", methods=["POST"])
def add_exam_task():
    data = request.get_json()  # Lấy dữ liệu từ FE gửi lên

    # Kiểm tra xem tất cả thông tin cần thiết có trong data không
    if not all(key in data for key in ("exam_id", "task_title", "task_description", "max_score", "execution_time_limit", "penalty_time_exceeded")):
        return jsonify({"error": "Missing required fields"}), 400

    # Tạo một bài tập mới
    new_task = ExamTask(
        exam_id=data["exam_id"],
        task_title=data["task_title"],
        task_description=data["task_description"],
        max_score=data["max_score"],
        execution_time_limit=data["execution_time_limit"]
    )
    db.session.add(new_task)
    db.session.flush()  # Flush để đẩy dữ liệu vào cơ sở dữ liệu mà không commit

    # Lưu thông tin penalty vào bảng GradingCriteria (2 tiêu chí)
    criteria = [
        {"criteria_name": "Kết quả đúng", "penalty": 0},
        {"criteria_name": "Chạy vượt thời gian", "penalty": data["penalty_time_exceeded"]}  # Dùng penalty_time_exceeded từ FE
    ]
    
    for crit in criteria:
        new_criteria = GradingCriteria(
            exam_task_id=new_task.id,  # Lấy ID bài tập vừa tạo
            criteria_name=crit["criteria_name"],
            penalty=crit["penalty"]
        )
        db.session.add(new_criteria)
    
    db.session.commit()  # Commit một lần khi tất cả thay đổi đã được thực hiện

    return jsonify({"message": "Task added successfully"}), 201

# Sửa bài tập
@exam_tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_exam_task(task_id):
    data = request.get_json()
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    # Cập nhật thông tin bài tập
    task.task_title = data["task_title"]
    task.task_description = data["task_description"]
    task.max_score = data["max_score"]
    task.execution_time_limit = data["execution_time_limit"]
    
    # Cập nhật các tiêu chí chấm điểm (nếu có thay đổi)
    criteria = GradingCriteria.query.filter_by(exam_task_id=task_id).all()
    for crit in criteria:
        if crit.criteria_name == "Chạy vượt thời gian":
            crit.penalty = data["penalty_time_exceeded"]
    
    db.session.commit()
    return jsonify({"message": "Task updated successfully"}), 200

# Xóa mềm bài tập
@exam_tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_exam_task(task_id):
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    task.delete_at = db.func.now()
    db.session.commit()
    return jsonify({"message": "Task soft deleted successfully"}), 200
