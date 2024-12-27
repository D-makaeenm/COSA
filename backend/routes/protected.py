from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

protected_bp = Blueprint('protected', __name__)

@protected_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    if not users:
        return jsonify({'message': 'No users found'}), 404
    return jsonify([user.to_dict() for user in users])

@protected_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({'message': f'Welcome {user.username}!'}), 200
