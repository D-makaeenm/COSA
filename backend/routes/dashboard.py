from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Exam  # Bổ sung Exam
from services.exam_service import get_latest_contest_summary, get_latest_exams

dashboard_bp = Blueprint('dashboard', __name__)

#Trong này là tất cả xử lý liên quan tới JWT role và gọi hàm thông qua services

def check_access(required_roles):
    """
    Kiểm tra xem user có quyền truy cập theo vai trò được yêu cầu.
    """
    try:
        current_user_id = str(get_jwt_identity())

        current_user = User.query.get(current_user_id)

        if not current_user:
            print("❌ User không tồn tại trong DB!")
            return {"error": "User not found"}, 401

        if current_user.role not in required_roles:
            print(f"❌ User {current_user_id} không có quyền: {required_roles}")
            return {"error": f"Access denied. Required roles: {', '.join(required_roles)}"}, 403

        return current_user
    except Exception as e:
        print(f"🔥 Lỗi khi check access: {e}")
        return {"error": "Server Error"}, 500

@dashboard_bp.route('/latest-contest-summary', methods=['GET'])
@jwt_required()
def latest_contest_summary():
    # Kiểm tra quyền admin
    access_check = check_access(["admin", "teacher"])
    if isinstance(access_check, tuple):  # Nếu có lỗi
        return jsonify(access_check[0]), access_check[1]
    current_user = access_check  # Nếu hợp lệ

    #Lấy dữ liệu từ service
    contest_summary = get_latest_contest_summary()
    if not contest_summary:
        return jsonify({'error': 'No contests found'}), 404

    return jsonify(contest_summary), 200

# API: Thống kê tổng quan
@dashboard_bp.route('/statistics', methods=['GET'])
@jwt_required()
def statistics():
    # Kiểm tra quyền admin
    access_check = check_access(["admin", "teacher"])
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

@dashboard_bp.route('/get-latest-exams', methods=['GET'])
@jwt_required()
def latest_exams():
    """
    API để lấy 5 cuộc thi mới nhất.
    """
    try:
        exams = get_latest_exams()
        return jsonify(exams)
    except Exception as e:
        return jsonify({"error": str(e)}), 500