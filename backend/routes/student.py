from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.student_service import (
    get_ongoing_exam_service,
    get_exam_questions_service,
    submit_exam_task_service
)

student_bp = Blueprint('student_bp', __name__)

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
