from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.compile_service import compile_and_run_cpp
from services.submission_service import save_task_submission, grade_task_submission, check_all_submitted_service
from urllib.parse import unquote
from models import Submission, ExamTask, Score

submission_bp = Blueprint('submission', __name__)

# ✅ Route: Nộp bài tập (Lưu + Chấm điểm ngay)
@submission_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_task():
    """
    1. Nhận code của thí sinh và lưu vào hệ thống.
    2. Chạy code với file input từ giáo viên và tạo file output.
    3. So sánh output với file output gốc.
    4. Chấm điểm từng test case và cập nhật tổng điểm.
    """
    try:
        data = request.json
        data["code"] = unquote(data.get("code", ""))  # Decode code trước khi lưu
        
        # ✅ 1. Lưu bài nộp
        submission_id = save_task_submission(data)
        if not submission_id:
            return jsonify({"error": "Failed to save submission"}), 500

        # ✅ 2. Chấm điểm ngay sau khi nộp
        grade_task_submission(submission_id)

        return jsonify({
            "message": "Task submitted and graded successfully.",
            "submission_id": submission_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Route: Lấy tổng điểm của thí sinh trong kỳ thi
@submission_bp.route('/final_score/<int:exam_id>/<int:student_id>', methods=['GET'])
@jwt_required()
def final_score(exam_id, student_id):
    """
    1. Kiểm tra xem tất cả bài tập trong kỳ thi đã được chấm chưa.
    2. Nếu chưa chấm hết, báo lỗi.
    3. Nếu đã chấm, trả về tổng điểm của thí sinh.
    """
    try:
        total_tasks = ExamTask.query.filter_by(exam_id=exam_id).count()
        graded_tasks = Submission.query.filter_by(exam_id=exam_id, user_id=student_id, is_graded=True).count()

        if total_tasks == 0:
            return jsonify({"message": "No tasks found in this exam.", "score": None}), 404

        if graded_tasks < total_tasks:
            return jsonify({"message": "Not all tasks have been graded yet.", "score": None}), 400

        # ✅ Lấy tổng điểm từ bảng scores
        score_entry = Score.query.filter_by(user_id=student_id, exam_id=exam_id).first()
        total_score = score_entry.total_score if score_entry else 0

        return jsonify({
            "message": "Final score calculated.",
            "score": total_score
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Route: Kiểm tra xem thí sinh đã nộp đủ tất cả bài tập chưa
@submission_bp.route('/check_all_submitted/<int:exam_id>/<int:student_id>', methods=['GET'])
@jwt_required()
def check_all_submitted(exam_id, student_id):
    """
    1. Kiểm tra xem số bài nộp của thí sinh có bằng số bài tập trong kỳ thi không.
    2. Trả về kết quả True/False.
    """
    try:
        all_submitted = check_all_submitted_service(exam_id, student_id)
        return jsonify({"all_submitted": all_submitted}), 200
    except Exception as e:
        return jsonify({"error": f"Lỗi kiểm tra bài nộp: {str(e)}"}), 500

@submission_bp.route('/status/<int:submission_id>', methods=['GET'])
@jwt_required()
def check_submission_status(submission_id):
    print(f"📌 Kiểm tra bài nộp với ID: {submission_id}")  # In ra ID được nhận

    submission = Submission.query.get(submission_id)
    
    if not submission:
        print("❌ Không tìm thấy submission!")  # Debug lỗi
        return jsonify({"error": "Submission không tồn tại"}), 404

    print(f"✅ Submission tìm thấy: {submission}")  # Nếu tìm thấy submission
    return jsonify({"is_graded": submission.is_graded}), 200

@submission_bp.route('/compile', methods=['POST'])
@jwt_required()
def compile_code():
    try:
        data = request.json
        code = unquote(data.get("code", ""))  # Decode code
        response = compile_and_run_cpp(code)

        # ✅ Đảm bảo response luôn có cả "error" và "output"
        return jsonify({
            "error": response.get("error"),
            "output": response.get("output")
        }), 200

    except Exception as e:
        return jsonify({"error": f"Lỗi khi compile: {str(e)}", "output": None}), 500