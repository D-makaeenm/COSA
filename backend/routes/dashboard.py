from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Exam  # Bổ sung Exam
from services.exam_service import get_latest_contest_summary

dashboard_bp = Blueprint('dashboard', __name__)

#Trong này là tất cả xử lý liên quan tới JWT role và gọi hàm thông qua services

def check_admin_access():
    """Kiểm tra xem user có quyền admin không."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return {"error": "User not found"}, 401

    if current_user.role != 'admin':
        return {"error": "Admin access only"}, 403

    return current_user

@dashboard_bp.route('/latest-contest-summary', methods=['GET'])
@jwt_required()
def latest_contest_summary():
    # Kiểm tra quyền admin
    access_check = check_admin_access()
    if isinstance(access_check, tuple):  # Nếu có lỗi
        return jsonify(access_check[0]), access_check[1]
    current_user = access_check  # Nếu hợp lệ

    # Lấy dữ liệu từ service
    contest_summary = get_latest_contest_summary()
    if not contest_summary:
        return jsonify({'error': 'No contests found'}), 404

    return jsonify(contest_summary), 200

# API: Thống kê tổng quan
@dashboard_bp.route('/statistics', methods=['GET'])
@jwt_required()
def statistics():
    # Kiểm tra quyền admin
    access_check = check_admin_access()
    if isinstance(access_check, tuple):  # Nếu có lỗi
        return jsonify(access_check[0]), access_check[1]
    current_user = access_check  # Nếu hợp lệ

    # Truy vấn thống kê
    total_contests = Exam.query.count()
    total_students = User.query.filter(User.role == 'student', User.delete_at.is_(None)).count()
    total_teachers = User.query.filter(User.role == 'teacher', User.delete_at.is_(None)).count()

    return jsonify({
        "totalContests": total_contests,
        "totalStudents": total_students,
        "totalTeachers": total_teachers
    }), 200