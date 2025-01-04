from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Exam  # Import model User và Exam
from services import get_latest_contest_summary

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/latest-contest-summary', methods=['GET'])
@jwt_required()
def latest_contest_summary():
    # Lấy ID user từ token
    current_user_id = get_jwt_identity()

    # Truy vấn user từ database
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'User not found'}), 401

    if current_user.role != 'admin':  # Kiểm tra role
        return jsonify({'error': 'Admin access only'}), 403

    # Lấy dữ liệu từ service
    contest_summary = get_latest_contest_summary()
    if not contest_summary:
        return jsonify({'error': 'No contests found'}), 404

    return jsonify(contest_summary)


# API: Thống kê tổng quan
@dashboard_bp.route('/statistics', methods=['GET'])
@jwt_required()
def statistics():
    # Lấy ID user từ token
    current_user_id = get_jwt_identity()

    # Truy vấn user từ database
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'User not found'}), 401

    if current_user.role != 'admin':  # Kiểm tra role
        return jsonify({'error': 'Admin access only'}), 403

    # Truy vấn thống kê
    total_contests = Exam.query.count()
    total_students = User.query.filter(User.role == 'student', User.delete_at.is_(None)).count()
    total_teachers = User.query.filter(User.role == 'teacher', User.delete_at.is_(None)).count()

    return jsonify({
        "totalContests": total_contests,
        "totalStudents": total_students,
        "totalTeachers": total_teachers
    })
