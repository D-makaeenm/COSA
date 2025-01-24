from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Notification

notification_bp = Blueprint("notification", __name__)

@notification_bp.route('/get_notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Lấy danh sách thông báo cho thí sinh.
    """
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).all()
    if not notifications:
        return jsonify({"message": "Không có thông báo nào."}), 200

    result = [{"id": n.id, "message": n.message, "created_at": n.created_at} for n in notifications]
    return jsonify(result), 200
