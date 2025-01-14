from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from services.exam_service import get_exams, get_exam_details, create_new_exam, remove_participant_from_exam
from models import User

exam_bp = Blueprint('exam_bp', __name__)

@exam_bp.route('/exams', methods=['GET'])
def list_exams():
    """
    Endpoint để lấy danh sách các cuộc thi từ hàm get_exams.
    """
    # Lấy tham số từ request
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'start_time', type=str)
    order = request.args.get('order', 'desc', type=str)
    status = request.args.get('status', None, type=str)

    # Gọi hàm get_exams để lấy dữ liệu
    exams = get_exams(page=page, per_page=per_page, sort_by=sort_by, order=order, status=status)

    # Chuyển đổi kết quả thành JSON
    result = [
        {
            "id": exam.id,
            "title": exam.title,
            "status": exam.status,
            "creator_name": exam.creator_name,
            "total_students": exam.total_students,
            "total_submissions": exam.total_submissions,
            "graded_submissions": exam.graded_submissions
        }
        for exam in exams.items
    ]

    # Trả về JSON
    return jsonify({
        "total": exams.total,
        "page": exams.page,
        "per_page": exams.per_page,
        "pages": exams.pages,
        "data": result,
    })

@exam_bp.route('/exams/<int:exam_id>', methods=['GET'])
def get_exam_info(exam_id):
    """
    API lấy thông tin kỳ thi và danh sách thí sinh dựa trên ID.
    """
    try:
        exam_data = get_exam_details(exam_id)
        if not exam_data:
            return jsonify({"error": "Exam not found"}), 404
        return jsonify(exam_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@exam_bp.route('/exams/create', methods=['POST'])
@jwt_required()
def create_exam():
    """
    Route để tạo một cuộc thi mới.
    """
    try:
        data = request.json

        # Lấy thông tin ID của người dùng từ request
        user_id = data.get("id")
        if not user_id:
            raise ValueError("User ID is required")

        # Tìm người dùng trong cơ sở dữ liệu
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")

        # Gọi service để xử lý logic tạo cuộc thi
        result = create_new_exam(data, user)

        # Trả về kết quả
        return jsonify(result), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@exam_bp.route('/exams/remove-participant', methods=['POST'])
@jwt_required()
def remove_participant():
    """
    API: Gắn cờ xóa thí sinh khỏi cuộc thi.
    """
    try:
        data = request.json
        exam_id = data.get("exam_id")
        username = data.get("username")

        if not exam_id or not username:
            return jsonify({"error": "Missing exam_id or user_id"}), 400

        # Gọi service để xử lý
        result, status_code = remove_participant_from_exam(exam_id, username)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500