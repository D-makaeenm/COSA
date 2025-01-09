from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from services.user_service import get_account_counts, get_admins, get_teachers, get_students, update_student, delete_student, delete_teacher, update_teacher, delete_admin, update_admin
from models import Admin, Teacher, Student


admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/account-counts', methods=['GET'])
@jwt_required()
def account_counts():
    """
    API: Lấy số lượng tài khoản theo từng loại role.
    """
    # Lấy số lượng tài khoản từ service
    account_data = get_account_counts()
    return jsonify(account_data), 200

@admin_bp.route('/list-admins', methods=['GET'])
@jwt_required()
def list_admins():
    """
    API: Lấy danh sách admin.
    """
    admin_list = get_admins()
    return jsonify(admin_list), 200

@admin_bp.route('/delete-admin', methods=['DELETE'])
@jwt_required()
def delete_admin_endpoint():
    """
    API: Xóa mềm tài khoản admin
    """
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    # Gọi service để xử lý xóa mềm
    result, status_code = delete_admin(username)
    return jsonify(result), status_code

@admin_bp.route('/edit-admin', methods=['POST'])
@jwt_required()
def edit_admin():
    """
    API: Chỉnh sửa thông tin admin.
    """
    data = request.json
    username = data.get("username")
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")  # Lấy mật khẩu từ request (nếu có)

    # Gọi service để xử lý cập nhật
    result, status_code = update_admin(username, name, phone, email, password)
    return jsonify(result), status_code


@admin_bp.route('/list-teacher', methods=['GET'])
@jwt_required()
def list_teacher():
    """
    API: Lấy danh sách giáo viên.
    """
    teacher_list = get_teachers()
    return jsonify(teacher_list), 200

@admin_bp.route('/delete-teacher', methods=['DELETE'])
@jwt_required()
def delete_teacher_endpoint():
    """
    API: Xóa mềm tài khoản giáo viên
    """
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    # Gọi service để xử lý xóa mềm
    result, status_code = delete_teacher(username)
    return jsonify(result), status_code

@admin_bp.route('/edit-teacher', methods=['POST'])
@jwt_required()
def edit_teacher():
    """
    API: Chỉnh sửa thông tin giao vien.
    """
    data = request.json
    username = data.get("username")
    name = data.get("name")
    phone = data.get("phone")
    department = data.get("department")
    password = data.get("password")  # Lấy mật khẩu từ request (nếu có)

    # Gọi service để xử lý cập nhật
    result, status_code = update_teacher(username, name, phone, department, password)
    return jsonify(result), status_code

@admin_bp.route('/list-student', methods=['GET'])
@jwt_required()
def list_student():
    """
    API: Lấy danh sách thi sinh
    """
    student_list = get_students()
    return jsonify(student_list), 200

@admin_bp.route('/edit-student', methods=['POST'])
@jwt_required()
def edit_student():
    """
    API: Chỉnh sửa thông tin sinh viên.
    """
    data = request.json
    username = data.get("username")
    name = data.get("name")
    student_class = data.get("student_class")
    department = data.get("department")
    password = data.get("password")  # Lấy mật khẩu từ request (nếu có)

    # Gọi service để xử lý cập nhật
    result, status_code = update_student(username, name, student_class, department, password)
    return jsonify(result), status_code

@admin_bp.route('/delete-student', methods=['DELETE'])
@jwt_required()
def delete_student_endpoint():
    """
    API: Xóa mềm tài khoản sinh viên.
    """
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    # Gọi service để xử lý xóa mềm
    result, status_code = delete_student(username)
    return jsonify(result), status_code

