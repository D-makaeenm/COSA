from flask import Blueprint, jsonify, request
from services.grading_service import GradingCriteriaService

grading_criteria_bp = Blueprint('grading_criteria', __name__)
grading_service = GradingCriteriaService()

# Lấy danh sách tất cả tiêu chí theo exam_id
@grading_criteria_bp.route('/<int:exam_id>', methods=['GET'])
def get_grading_criteria(exam_id):
    criteria = grading_service.get_all_criteria(exam_id)
    return jsonify(criteria), 200

# Thêm mới một tiêu chí
@grading_criteria_bp.route('/<int:exam_id>', methods=['POST'])
def add_grading_criteria(exam_id):
    data = request.get_json()
    try:
        grading_service.add_criteria(exam_id, data)
        return jsonify({'message': 'Grading criteria added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Sửa một tiêu chí
@grading_criteria_bp.route('/<int:criteria_id>', methods=['PUT'])
def update_grading_criteria(criteria_id):
    data = request.get_json()
    try:
        grading_service.update_criteria(criteria_id, data)
        return jsonify({'message': 'Grading criteria updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Xóa một tiêu chí
@grading_criteria_bp.route('/<int:criteria_id>', methods=['DELETE'])
def delete_grading_criteria(criteria_id):
    try:
        grading_service.delete_criteria(criteria_id)
        return jsonify({'message': 'Grading criteria deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
