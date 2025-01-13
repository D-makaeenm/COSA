from flask import Blueprint, jsonify, request
from services.exam_service import get_exams, get_exam_details

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
    
