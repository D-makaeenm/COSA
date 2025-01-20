from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from services.user_service import get_account_name

user_bp = Blueprint('user', __name__)


@user_bp.route('/get_username', methods=['POST'])
@jwt_required()
def get_username():
    """
    API: Lấy thông tin username và tên đầy đủ từ request body.
    """
    data = request.get_json()
    username = data.get('username')  # Lấy username từ request body
    if not username:
        return jsonify({"error": "Username is required"}), 400

    user_info = get_account_name(username)  # Gọi service để xử lý
    if not user_info:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user_info), 200

