from flask import Blueprint, request, jsonify
from models import db, ExamTask, Testcase
from werkzeug.utils import secure_filename
import os
import datetime

exam_tasks_bp = Blueprint("exam_tasks", __name__)

UPLOAD_FOLDER = "uploads"
IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, "images")  
TESTCASE_FOLDER = os.path.join(UPLOAD_FOLDER, "testcases")

os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(TESTCASE_FOLDER, exist_ok=True)

def get_task_folder(task_id, task_title):
    """Tạo đường dẫn thư mục theo Task ID và Task Title"""
    task_folder = os.path.join(TESTCASE_FOLDER, f"Task{task_id}")
    os.makedirs(task_folder, exist_ok=True)
    return task_folder

# ✅ **Lấy danh sách bài tập**
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
            "task_image": f"/{task.image_path}" if task.image_path else None,
            "testcases": [
                {
                    "id": testcase.id,
                    "input_path": f"/{testcase.input_path}" if testcase.input_path else None,
                    "output_path": f"/{testcase.output_path}" if testcase.output_path else None,
                    "time_limit": testcase.time_limit
                }
                for testcase in Testcase.query.filter_by(exam_task_id=task.id).all()
            ]
        }
        for task in tasks
    ])

# ✅ **Thêm bài tập mới**
@exam_tasks_bp.route("/add-task", methods=["POST"])
def add_exam_task():
    form = request.form
    task_image = request.files.get("task_image")
    task_title = form["task_title"]

    # ✅ Lưu ảnh nếu có
    image_filename = None
    if task_image:
        image_filename = secure_filename(task_image.filename)
        task_image.save(os.path.join(IMAGE_FOLDER, image_filename))

    # ✅ Tạo bài tập mới
    new_task = ExamTask(
        exam_id=form["exam_id"],
        task_title=task_title,
        task_description=form["task_description"],
        max_score=form["max_score"],
        execution_time_limit=form["time_limit"],
        image_path=image_filename
    )
    db.session.add(new_task)
    db.session.flush()  # Lấy ID bài tập mới

    # ✅ Tạo thư mục riêng cho bài tập
    task_folder = get_task_folder(new_task.id, task_title)

    # ✅ Lưu test case nếu có
    input_file = request.files.get("input_file")
    output_file = request.files.get("output_file")

    if input_file and output_file:
        # Tạo thư mục Test1 nếu là test case đầu tiên
        testcase_folder = os.path.join(task_folder, "Test1")
        os.makedirs(testcase_folder, exist_ok=True)

        input_filename = secure_filename(input_file.filename)
        output_filename = secure_filename(output_file.filename)

        input_path = os.path.join(testcase_folder, input_filename)
        output_path = os.path.join(testcase_folder, output_filename)

        input_file.save(input_path)
        output_file.save(output_path)

        # ✅ Lưu đường dẫn tương đối
        new_testcase = Testcase(
            exam_task_id=new_task.id,
            input_path=os.path.relpath(input_path, TESTCASE_FOLDER),
            output_path=os.path.relpath(output_path, TESTCASE_FOLDER),
            time_limit=form["time_limit"]
        )
        db.session.add(new_testcase)

    db.session.commit()
    return jsonify({"message": "Task added successfully", "id": new_task.id}), 201

# ✅ **Cập nhật bài tập**
@exam_tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_exam_task(task_id):
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    form = request.form
    updated_fields = {}

    if "task_title" in form and form["task_title"] != task.task_title:
        updated_fields["task_title"] = form["task_title"]
    if "task_description" in form and form["task_description"] != task.task_description:
        updated_fields["task_description"] = form["task_description"]
    if "max_score" in form and form["max_score"] != str(task.max_score):  
        updated_fields["max_score"] = form["max_score"]
    if "time_limit" in form and form["time_limit"] != str(task.execution_time_limit):
        updated_fields["execution_time_limit"] = form["time_limit"]

    # Cập nhật ảnh nếu có
    task_image = request.files.get("task_image")
    if task_image:
        image_filename = secure_filename(task_image.filename)
        task_image.save(os.path.join(IMAGE_FOLDER, image_filename))
        if task.image_path != image_filename:
            updated_fields["image_path"] = image_filename

    # Nếu có thay đổi, mới cập nhật vào database
    if updated_fields:
        for key, value in updated_fields.items():
            setattr(task, key, value)
        db.session.commit()

    return jsonify({"message": "Task updated successfully", "updated_fields": updated_fields}), 200


# ✅ **Xóa mềm bài tập**
@exam_tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_exam_task(task_id):
    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    task.delete_at = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Task deleted successfully"}), 200

# ✅ Thêm test case mới
@exam_tasks_bp.route("/add-testcase", methods=["POST"])
def add_testcase():
    form = request.form
    task_id = form.get("task_id")
    time_limit = form.get("time_limit")
    input_file = request.files.get("input_file")
    output_file = request.files.get("output_file")

    if not task_id:
        return jsonify({"error": "Missing task_id"}), 400

    task = ExamTask.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    task_folder = get_task_folder(task.id, task.task_title)

    # ✅ Kiểm tra số test case đã có
    existing_testcases = Testcase.query.filter_by(exam_task_id=task.id).count()
    testcase_folder = os.path.join(task_folder, f"Test{existing_testcases+1}")
    os.makedirs(testcase_folder, exist_ok=True)

    # ✅ Lưu test case
    input_filename = secure_filename(input_file.filename)
    output_filename = secure_filename(output_file.filename)

    input_path = os.path.join(testcase_folder, input_filename)
    output_path = os.path.join(testcase_folder, output_filename)

    input_file.save(input_path)
    output_file.save(output_path)

    new_testcase = Testcase(
        exam_task_id=task.id,
        input_path=os.path.relpath(input_path, TESTCASE_FOLDER),
        output_path=os.path.relpath(output_path, TESTCASE_FOLDER),
        time_limit=time_limit
    )
    db.session.add(new_testcase)
    db.session.commit()

    return jsonify({"message": "Testcase added successfully", "id": new_testcase.id}), 201


@exam_tasks_bp.route("/testcase/<int:testcase_id>", methods=["PUT"])
def update_testcase(testcase_id):
    testcase = Testcase.query.get(testcase_id)
    if not testcase:
        return jsonify({"error": "Testcase not found"}), 404

    form = request.form
    updated_fields = {}

    if "time_limit" in form and form["time_limit"] != str(testcase.time_limit):
        updated_fields["time_limit"] = form["time_limit"]

    testcase_folder = os.path.join(TESTCASE_FOLDER, os.path.dirname(testcase.input_path))

    input_file = request.files.get("input_file")
    if input_file:
        input_filename = secure_filename(input_file.filename)
        input_path = os.path.join(testcase_folder, input_filename)
        input_file.save(input_path)
        updated_fields["input_path"] = os.path.relpath(input_path, TESTCASE_FOLDER)

    output_file = request.files.get("output_file")
    if output_file:
        output_filename = secure_filename(output_file.filename)
        output_path = os.path.join(testcase_folder, output_filename)
        output_file.save(output_path)
        updated_fields["output_path"] = os.path.relpath(output_path, TESTCASE_FOLDER)

    if updated_fields:
        for key, value in updated_fields.items():
            setattr(testcase, key, value)
        db.session.commit()

    return jsonify({"message": "Testcase updated successfully", "updated_fields": updated_fields}), 200
