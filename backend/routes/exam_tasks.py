from flask import Blueprint, request, jsonify
from models import db, ExamTask, Testcase
from werkzeug.utils import secure_filename
import os

exam_tasks_bp = Blueprint("exam_tasks", __name__)


UPLOAD_FOLDER = "uploads"  # Thư mục gốc lưu file
IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, "images")  # Lưu ảnh đề bài
TESTCASE_FOLDER = os.path.join(UPLOAD_FOLDER, "testcases")  # Lưu file input/output

# Tạo thư mục
os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(TESTCASE_FOLDER, exist_ok=True)

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
            "task_image": f"{task.image_path}" if task.image_path else None,
            "testcases": [
                {
                    "input_path": f"{testcase.input_path}" if testcase.input_path else None,
                    "output_path": f"{testcase.output_path}" if testcase.output_path else None,
                    "time_limit": testcase.time_limit
                }
                for testcase in Testcase.query.filter_by(exam_task_id=task.id).all()
            ]
        }
        for task in tasks
    ])

# ✅ Thêm bài tập mới (Xử lý lưu file)
@exam_tasks_bp.route("/add-task", methods=["POST"])
def add_exam_task():
    if "task_image" in request.files:
        image_file = request.files["task_image"]
        if image_file.filename:
            image_filename = secure_filename(image_file.filename)
            image_path = os.path.join(IMAGE_FOLDER, image_filename)
            image_file.save(image_path)  # Lưu ảnh vào thư mục

    if "input_file" in request.files and "output_file" in request.files:
        input_file = request.files["input_file"]
        output_file = request.files["output_file"]

        input_filename = secure_filename(input_file.filename)
        output_filename = secure_filename(output_file.filename)

        input_path = os.path.join(TESTCASE_FOLDER, input_filename)
        output_path = os.path.join(TESTCASE_FOLDER, output_filename)

        input_file.save(input_path)  # Lưu file input
        output_file.save(output_path)  # Lưu file output

    # Lấy dữ liệu từ form
    task = ExamTask(
        exam_id=request.form["exam_id"],
        task_title=request.form["task_title"],
        task_description=request.form["task_description"],
        max_score=request.form["max_score"],
        execution_time_limit=request.form["time_limit"],
        image_path=image_filename if "task_image" in request.files else None,  # Lưu đường dẫn ảnh
    )

    db.session.add(task)
    db.session.flush()  # Lấy ID bài tập mới

    testcase = Testcase(
        exam_task_id=task.id,
        input_path=input_filename if "input_file" in request.files else None,
        output_path=output_filename if "output_file" in request.files else None,
        time_limit=request.form["time_limit"],
    )

    db.session.add(testcase)
    db.session.commit()

    return jsonify({"message": "Task added successfully", "id": task.id}), 201


@exam_tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_exam_task(task_id):
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    if "task_image" in request.files:
        image_file = request.files["task_image"]
        if image_file.filename:
            image_filename = secure_filename(image_file.filename)
            image_path = os.path.join(IMAGE_FOLDER, image_filename)
            image_file.save(image_path)
            task.image_path = image_filename  # Cập nhật đường dẫn ảnh

    if "input_file" in request.files and "output_file" in request.files:
        input_file = request.files["input_file"]
        output_file = request.files["output_file"]

        input_filename = secure_filename(input_file.filename)
        output_filename = secure_filename(output_file.filename)

        input_path = os.path.join(TESTCASE_FOLDER, input_filename)
        output_path = os.path.join(TESTCASE_FOLDER, output_filename)

        input_file.save(input_path)
        output_file.save(output_path)

        # Cập nhật test case
        testcase = Testcase.query.filter_by(exam_task_id=task_id).first()
        if testcase:
            testcase.input_path = input_filename
            testcase.output_path = output_filename
            testcase.time_limit = request.form["time_limit"]
        else:
            new_testcase = Testcase(
                exam_task_id=task_id,
                input_path=input_filename,
                output_path=output_filename,
                time_limit=request.form["time_limit"]
            )
            db.session.add(new_testcase)

    task.task_title = request.form["task_title"]
    task.task_description = request.form["task_description"]
    task.max_score = request.form["max_score"]
    task.execution_time_limit = request.form["time_limit"]

    db.session.commit()

    return jsonify({"message": "Task updated successfully"}), 200


# ✅ **Xóa mềm bài tập**
@exam_tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_exam_task(task_id):
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    Testcase.query.filter_by(exam_task_id=task_id).delete()
    db.session.delete(task)

    db.session.commit()

    return jsonify({"message": "Task deleted successfully"}), 200
