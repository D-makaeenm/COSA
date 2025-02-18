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
            "time_limit": task.execution_time_limit,
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

# Thêm bài tập mới (bao gồm testcases và grading criteria)
@exam_tasks_bp.route("/add-task", methods=["POST"])
def add_exam_task():
    data = request.get_json()

    if not all(key in data for key in ("exam_id", "task_title", "task_description", "max_score", "time_limit", "penalty_time", "input", "output")):
        return jsonify({"error": "Missing required fields"}), 400

    # Tạo bài tập mới
    new_task = ExamTask(
        exam_id=data["exam_id"],
        task_title=data["task_title"],
        task_description=data["task_description"],
        max_score=data["max_score"],
        execution_time_limit=data["time_limit"]
    )
    db.session.add(new_task)
    db.session.flush()  # Flush để lấy ID của bài tập mới

    # Thêm tiêu chí chấm điểm '4', '2', 'Điểm trừ nếu vượt quá thời gian', '0.5'

    grading_criteria = [
        {"criteria_name": "Kết quả đúng", "penalty": 0},
        {"criteria_name": "Điểm trừ nếu vượt quá thời gian", "penalty": data["penalty_time"]},
    ]

    for criteria in grading_criteria:
        new_criteria = GradingCriteria(
            exam_task_id=new_task.id,
            criteria_name=criteria["criteria_name"],
            penalty=criteria["penalty"]
        )
        db.session.add(new_criteria)

    # Thêm test case mới
    new_testcase = Testcase(
        exam_task_id=new_task.id,
        input=data["input"],
        expected_output=data["output"],
        time_limit=data["time_limit"]
    )
    db.session.add(new_testcase)

    db.session.commit()

    return jsonify({"message": "Task added successfully", "id": new_task.id}), 201

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
    task.execution_time_limit = data["time_limit"]

    # Cập nhật tiêu chí chấm điểm
    existing_criteria = {crit.criteria_name: crit for crit in GradingCriteria.query.filter_by(exam_task_id=task_id).all()}
    
    # Danh sách tiêu chí cần có
    required_criteria = {
        "Điểm trừ nếu vượt quá thời gian": data["penalty_time"],
        "Điểm trừ nếu đúng": data.get("penalty_correct", 0)
    }

    for criteria_name, penalty in required_criteria.items():
        if criteria_name in existing_criteria:
            # Cập nhật tiêu chí nếu đã tồn tại
            existing_criteria[criteria_name].penalty = penalty
        else:
            # Nếu chưa có, tạo mới tiêu chí
            new_criteria = GradingCriteria(
                exam_task_id=task_id,
                criteria_name=criteria_name,
                penalty=penalty
            )
            db.session.add(new_criteria)

    # Cập nhật hoặc tạo mới testcase
    testcase = Testcase.query.filter_by(exam_task_id=task_id).first()
    if testcase:
        # Cập nhật testcase hiện tại
        testcase.input = data["input"]
        testcase.expected_output = data["output"]
        testcase.time_limit = data["time_limit"]
    else:
        # Nếu không có testcase, tạo mới
        new_testcase = Testcase(
            exam_task_id=task_id,
            input=data["input"],
            expected_output=data["output"],
            time_limit=data["time_limit"]
        )
        db.session.add(new_testcase)

    # Lưu thay đổi vào database
    db.session.commit()

    return jsonify({"message": "Task updated successfully"}), 200


# Xóa mềm bài tập
@exam_tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_exam_task(task_id):
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # Xóa bài tập
    db.session.delete(task)

    # Xóa luôn các tiêu chí chấm điểm liên quan đến bài tập này
    GradingCriteria.query.filter_by(exam_task_id=task_id).delete()

    # Xóa luôn các testcases liên quan đến bài tập này
    Testcase.query.filter_by(exam_task_id=task_id).delete()

    db.session.commit()

    return jsonify({"message": "deleted successfully"}), 200

