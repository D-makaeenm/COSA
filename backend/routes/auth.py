from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from services.user_service import (
    create_student_account,
    create_teacher_account,
    create_admin_account,
)
from models import User

auth_bp = Blueprint("auth", __name__)

# Login Endpoint
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # Truy vấn user
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password!"}), 401

    # Tạo access token
    access_token = create_access_token(identity=str(user.id), expires_delta=False)
    return jsonify({"access_token": access_token, "role": user.role, "id": user.id}), 200


# Endpoint: Tạo tài khoản student
@auth_bp.route("/register-student", methods=["POST"])
@jwt_required()
def register_student():
    current_user_id = str(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    # Chỉ admin mới được phép tạo tài khoản
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Admin access only"}), 403

    # Lấy dữ liệu từ request
    data = request.json
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    exam_id = data.get("exam_id")

    # Gọi service
    result, status_code = create_student_account(username, password, name, phone, email, exam_id)
    return jsonify(result), status_code

@auth_bp.route("/register-teacher", methods=["POST"])
@jwt_required()
def register_teacher():
    current_user_id = str(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    # Chỉ admin mới được phép tạo tài khoản
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Admin access only"}), 403

    # Lấy dữ liệu từ request
    data = request.json
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")

    # Gọi service
    result, status_code = create_teacher_account(username, password, name, phone, email)
    return jsonify(result), status_code

# Endpoint: Tạo tài khoản admin
@auth_bp.route("/register-admin", methods=["POST"])
@jwt_required()
def register_admin():
    current_user_id = str(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    # Chỉ admin mới được phép tạo tài khoản
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Admin access only"}), 403

    # Lấy dữ liệu từ request
    data = request.json
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")

    # Gọi service
    result, status_code = create_admin_account(username, password, name, phone, email)
    return jsonify(result), status_code

