from models import Exam, Submission, User, db, Score, ExamParticipant
from sqlalchemy import func, and_
from datetime import datetime

def get_latest_contest():
    """Lấy thông tin cuộc thi gần nhất."""
    return Exam.query.order_by(Exam.start_time.desc()).first()

def get_contest_summary(contest):
    """Tổng hợp thông tin tổng quan về cuộc thi."""

    total_students = (
        db.session.query(ExamParticipant)
        .join(User, ExamParticipant.user_id == User.id)  # Kết nối với bảng User
        .filter(
            ExamParticipant.exam_id == contest.id,  # Lọc theo contest ID
            ExamParticipant.delete_at.is_(None),    # Loại bỏ các bản ghi bị xóa mềm
            User.role == 'student',                 # Chỉ lấy thí sinh
            User.delete_at.is_(None)                # Bỏ qua tài khoản bị xóa mềm
        )
        .distinct()
        .count()
    )
    
    total_submissions = (
        db.session.query(Submission).filter(Submission.exam_id == contest.id).count()
    )

    graded_submissions = (
        db.session.query(Submission).filter(Submission.exam_id == contest.id,Submission.is_graded == 1).count()
    )
    
    creator = (
        db.session.query(User).filter(User.id == contest.created_by,User.delete_at.is_(None)).first()
    )
     

    return {
        "title": contest.title,
        "status": contest.status,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "creator": creator.name if creator else "Unknown"
    }

def get_submission_progress(contest):
    """Lấy tiến độ nộp bài theo giờ."""
    progress_data = Submission.query.with_entities(
        func.hour(Submission.submitted_at).label('hour'),
        func.count(Submission.id).label('total_submissions'),
        func.sum(func.if_(Submission.submitted_at <= contest.end_time, 1, 0)).label('before_deadline'),
        func.sum(func.if_(Submission.submitted_at > contest.end_time, 1, 0)).label('after_deadline'),
        func.sum(func.if_(Submission.is_graded == 0, 1, 0)).label('ungraded_submissions')
    ).filter(
        Submission.exam_id == contest.id
    ).group_by(
        func.hour(Submission.submitted_at)
    ).order_by('hour').all()

    return [
        {
            "time": f"{hour}:00",
            "total_submissions": total,
            "before_deadline": before,
            "after_deadline": after,
            "ungraded_submissions": ungraded
        }
        for hour, total, before, after, ungraded in progress_data
    ]

def get_latest_contest_summary():
    """Lấy thông tin cuộc thi gần nhất và tổng hợp dữ liệu."""
    latest_contest = get_latest_contest()
    if not latest_contest:
        return None

    contest_info = get_contest_summary(latest_contest)
    progress = get_submission_progress(latest_contest)

    return {
        "info": contest_info,
        "progress": progress
    }

def get_exams(page=1, per_page=10, sort_by='start_time', order='desc', status=None):
    """
    Truy vấn danh sách các cuộc thi từ database với các tùy chọn lọc, phân trang và sắp xếp.
    """
    query = (
        db.session.query(
            Exam.id,
            Exam.title,
            Exam.status,
            func.count(ExamParticipant.user_id.distinct()).label("total_students"),  # Số lượng thí sinh
            func.count(Submission.id).label("total_submissions"),  # Số bài nộp
            func.sum(
                func.if_(Submission.is_graded == 1, 1, 0)
            ).label("graded_submissions"),  # Số bài đã chấm
            User.name.label("creator_name")  # Tên người tạo kỳ thi
        )
        .outerjoin(Submission, Submission.exam_id == Exam.id)  # Kết nối với bảng Submission
        .outerjoin(
            ExamParticipant,
            and_(ExamParticipant.exam_id == Exam.id, ExamParticipant.delete_at.is_(None))
        )  # Kết nối với bảng ExamParticipant và bỏ qua các dòng bị xóa
        .join(User, User.id == Exam.created_by)  # Kết nối với bảng User để lấy thông tin người tạo
        .group_by(Exam.id, User.name)  # Nhóm theo ID kỳ thi và tên người tạo
    )

    # Lọc theo trạng thái (nếu có)
    if status:
        query = query.filter(Exam.status == status)

    # Sắp xếp
    sort_column = getattr(Exam, sort_by, None)
    if sort_column:
        query = query.order_by(sort_column.asc() if order == 'asc' else sort_column.desc())
    else:
        raise ValueError(f"Invalid sort column: {sort_by}")

    # Phân trang
    exams = query.paginate(page=page, per_page=per_page, error_out=False)

    return exams

def get_exam_details(exam_id):
    """
    Lấy thông tin kỳ thi và danh sách thí sinh (bao gồm cả những người chưa nộp bài).
    """
    # Lấy thông tin kỳ thi
    exam = Exam.query.get(exam_id)
    if not exam:
        return None

    # Lấy tên người tạo kỳ thi
    creator = (
        db.session.query(User.name)
        .filter(User.id == exam.created_by, User.delete_at.is_(None))
        .first()
    )
    creator_name = creator.name if creator else "Không rõ"

    # Lấy danh sách thí sinh từ bảng ExamParticipant
    participants = (
        db.session.query(
            User.username,
            User.name,
            User.email,
            User.phone,
            func.coalesce(Score.scores, 0).label("score"),  # Điểm, nếu chưa có sẽ là 0
            func.rank().over(order_by=Score.scores.desc()).label("rank")  # Xếp hạng dựa trên điểm
        )
        .join(ExamParticipant, ExamParticipant.user_id == User.id)  # Kết nối bảng ExamParticipant và User
        .outerjoin(Score, and_(Score.user_id == User.id, Score.exam_id == exam_id))  # Kết nối bảng Score (nếu có)
        .filter(
            ExamParticipant.exam_id == exam_id,  # Lọc theo exam_id
            User.role == 'student',             # Chỉ lấy thí sinh
            ExamParticipant.delete_at.is_(None)            # Bỏ qua tài khoản bị xóa
        )
        .order_by(Score.scores.desc())  # Sắp xếp theo điểm số giảm dần
        .all()
    )

    # Định dạng kết quả
    return {
        "title": exam.title,
        "status": exam.status,
        "creator_name": creator_name,
        "participants": [
            {
                "username": participant.username,
                "name": participant.name,
                "email": participant.email,
                "phone": participant.phone,
                "score": participant.score,
                "rank": participant.rank if participant.score > 0 else "Chưa thi",  # Xếp hạng hoặc trạng thái "Chưa thi"
            }
            for participant in participants
        ],
    }

def get_latest_exams(limit=5):
    """
    Lấy danh sách các cuộc thi mới nhất.
    """
    query = Exam.query.order_by(Exam.created_at.desc()).limit(limit)
    exams = query.all()
    return [
        {
            "title": exam.title,
            "status": exam.status,
            "created_at": exam.created_at,
            "end_time": exam.end_time
        }
        for exam in exams
    ]

def searh_user(id):
    """
    Tìm username
    """
    user_id = User.query.filter_by(id=id).first()
    return {"username": user_id}

def create_new_exam(data, user):
    """
    Xử lý logic tạo một cuộc thi mới.
    """
    # Kiểm tra quyền hạn (chỉ admin được tạo cuộc thi)
    if not user or user.role != 'admin':
        raise ValueError("Admin access required")

    # Lấy các trường cần thiết từ dữ liệu
    title = data.get('title')
    description = data.get('description')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    status = data.get('status', 'scheduled')  # Mặc định là "scheduled" nếu không cung cấp

    # Kiểm tra dữ liệu đầu vào
    if not title or not start_time or not end_time:
        raise ValueError("Missing required fields")

    # Chuyển đổi thời gian từ chuỗi sang datetime
    try:
        start_time = datetime.strptime(start_time, "%Y-%m-%dT%H:%M")
        end_time = datetime.strptime(end_time, "%Y-%m-%dT%H:%M")
    except ValueError:
        raise ValueError("Invalid datetime format. Expected 'YYYY-MM-DDTHH:MM'")

    # Kiểm tra logic thời gian
    if start_time >= end_time:
        raise ValueError("Start time must be before end time")

    # Tạo cuộc thi mới
    new_exam = Exam(
        title=title,
        description=description,
        start_time=start_time,
        end_time=end_time,
        status=status,
        created_by=user.id
    )

    # Lưu vào database
    db.session.add(new_exam)
    db.session.commit()

    # Trả về phản hồi thành công
    return {
        "message": "Exam created successfully",
        "exam_id": new_exam.id
    }

def remove_participant_from_exam(exam_id, username):
    try:
        # Tìm user_id từ username
        user = User.query.filter_by(username=username).first()
        if not user:
            return {"error": "User not found"}, 404

        # Tìm participant từ exam_id và user_id
        participant = ExamParticipant.query.filter_by(
            exam_id=exam_id,
            user_id=user.id,
            delete_at=None
        ).first()
        if not participant:
            return {"error": "Participant not found or already deleted"}, 404

        # Gắn cờ xóa
        participant.delete_at = db.func.now()
        db.session.commit()

        return {"message": "Participant removed successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500