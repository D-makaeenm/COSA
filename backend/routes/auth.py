from flask import Blueprint, request, jsonify
from models import db, User
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@jwt_required()  # Yêu cầu JWT token
def register():
    # Lấy ID người dùng từ JWT token
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    # Kiểm tra quyền hạn (chỉ admin mới được phép tạo tài khoản)
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Only admin can create new accounts!'}), 403

    # Lấy thông tin từ yêu cầu
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student')  # Mặc định role là 'student'

    if not username or not password or not role:
        return jsonify({'error': 'Username, password, and role are required!'}), 400

    # Kiểm tra username đã tồn tại
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists!'}), 400

    # Mã hóa mật khẩu và tạo người dùng
    new_user = User(username=username, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password!'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token, 'role': user.role}), 200
