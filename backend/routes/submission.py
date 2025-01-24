from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.submission_service import save_task_submission, grade_task_submission, calculate_final_score_service, check_all_submitted_service, grade_task_service

submission_bp = Blueprint('submission', __name__)

@submission_bp.route('/submit', methods=['POST'])
def submit_task():
    try:
        data = request.json
        submission_id = save_task_submission(data)  # Lưu bài làm
        grade_task_submission(submission_id)       # Chấm điểm
        return jsonify({"message": "Task submitted successfully.", "submission_id": submission_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@submission_bp.route('/final_score/<int:exam_id>/<int:student_id>', methods=['GET'])
@jwt_required()
def final_score(exam_id, student_id):
    """
    Lấy điểm tổng của thí sinh trong kỳ thi.
    """
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
    """
    Kiểm tra xem tất cả các bài trong kỳ thi đã được nộp hay chưa.
    """
    try:
        all_submitted = check_all_submitted_service(exam_id, student_id)
        return jsonify({"all_submitted": all_submitted}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@submission_bp.route('/grade_task/<int:submission_id>', methods=['POST'])
@jwt_required()
def grade_task(submission_id):
    """
    Chấm điểm bài nộp.
    """
    try:
        grade_task_service(submission_id)
        return jsonify({"message": "Chấm điểm thành công."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500