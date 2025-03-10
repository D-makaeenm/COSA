from flask import Blueprint, jsonify, request, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from models import db, Submission
from services.student_service import (
    get_ongoing_exam_service,
    get_exam_questions_service,
    submit_exam_task_service,
    start_exam_service,
    get_question_details,
    submit_code_service
)
from datetime import datetime, timedelta

student_bp = Blueprint('student_bp', __name__)

def get_upload_folder_images():
    return os.path.join(current_app.root_path, "uploads", "images")

def get_upload_folder_testcases():
    return os.path.join(current_app.root_path, "uploads", "testcases")


@student_bp.route('/ongoing-exam', methods=['GET'])
@jwt_required()
def get_ongoing_exam():
    try:
        current_user_id = get_jwt_identity()
        result = get_ongoing_exam_service(current_user_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@student_bp.route('/exam/<int:exam_id>/questions', methods=['GET'])
@jwt_required()
def get_exam_questions(exam_id):
    try:
        user_id = get_jwt_identity()
        result = get_exam_questions_service(exam_id, user_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@student_bp.route('/exam/<int:exam_id>/submit', methods=['POST'])
@jwt_required()
def submit_exam_task(exam_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        result = submit_exam_task_service(current_user_id, exam_id, data)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@student_bp.route('/start-exam', methods=['POST'])
@jwt_required()
def start_exam():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        exam_id = data.get("exam_id")
        result = start_exam_service(current_user_id, exam_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@student_bp.route('/exam/<int:exam_id>/question/<int:question_id>', methods=['GET'])
@jwt_required()
def get_question(exam_id, question_id):
    """
    API để lấy chi tiết câu hỏi cụ thể.
    """
    current_user_id = get_jwt_identity()
    try:
        question = get_question_details(current_user_id, exam_id, question_id)
        return jsonify(question), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@student_bp.route("/uploads/images/<path:filename>")
def get_uploaded_image(filename):
    file_path = os.path.join(get_upload_folder_images(), filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File không tồn tại"}), 404
    return send_from_directory(get_upload_folder_images(), filename)

@student_bp.route("/uploads/testcases/<path:filename>")
def get_uploaded_testcase(filename):
    file_path = os.path.join(get_upload_folder_testcases(), filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File không tồn tại"}), 404
    return send_from_directory(get_upload_folder_testcases(), filename)

@student_bp.route('/exam/<int:exam_id>/question/<int:question_id>/submit', methods=['POST'])
@jwt_required()
def submit_code(exam_id, question_id):
    """
    API để nộp bài làm và chấm điểm.
    """
    try:
        current_user_id = get_jwt_identity()  # Lấy ID thí sinh từ JWT
        data = request.get_json()
        code = data.get("code", "")

        if code is None:
            return jsonify({"error": "Code không được để trống"}), 400

        # 📌 Gọi `submit_code_service()` từ student_service
        result = submit_code_service(current_user_id, exam_id, question_id, code)

        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@student_bp.route('/exam/<int:exam_id>/submitted-tasks/<int:user_id>', methods=['GET'])
@jwt_required()
def get_submitted_tasks(exam_id, user_id):
    try:
        # ✅ Kiểm tra người dùng hiện tại có quyền truy vấn dữ liệu không
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({"error": "Bạn không có quyền truy cập dữ liệu này."}), 403

        # ✅ Truy vấn danh sách các bài tập đã nộp của thí sinh
        submissions = Submission.query.filter_by(exam_id=exam_id, user_id=user_id).all()
        
        # ✅ Chuyển kết quả thành danh sách JSON
        submitted_tasks = [{"task_id": sub.exam_task_id} for sub in submissions]

        return jsonify(submitted_tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        