from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.submission_service import save_task_submission, grade_task_submission, calculate_final_score_service, check_all_submitted_service
from urllib.parse import unquote

submission_bp = Blueprint('submission', __name__)

@submission_bp.route('/submit', methods=['POST'])
def submit_task():
    try:
        data = request.json
        data["code"] = unquote(data.get("code", ""))  # Decode code trước khi lưu
        
        submission_id = save_task_submission(data)  # Lưu bài làm
        grade_task_submission(submission_id)       # Chấm điểm
        return jsonify({"message": "Task submitted successfully.", "submission_id": submission_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@submission_bp.route('/final_score/<int:exam_id>/<int:student_id>', methods=['GET'])
@jwt_required()
def final_score(exam_id, student_id):
    try:
        result = calculate_final_score_service(exam_id, student_id)
        if result["status"] == "pending":
            return jsonify({"message": "Not all tasks have been graded yet.", "score": None}), 400
        return jsonify({"message": "Final score calculated.", "score": result["score"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@submission_bp.route('/check_all_submitted/<int:exam_id>/<int:student_id>', methods=['GET'])
@jwt_required()
def check_all_submitted(exam_id, student_id):
    try:
        all_submitted = check_all_submitted_service(exam_id, student_id)
        return jsonify({"all_submitted": all_submitted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
