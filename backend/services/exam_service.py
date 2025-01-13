from models import Exam, Submission, User, db, Admin, Teacher, Score, Student
from sqlalchemy import func

def get_latest_contest():
    """Lấy thông tin cuộc thi gần nhất."""
    return Exam.query.order_by(Exam.start_time.desc()).first()

def get_contest_summary(contest):
    """Tổng hợp thông tin tổng quan về cuộc thi."""

    total_students = db.session.query(User).join(
        Submission, Submission.user_id == User.id  # Liên kết bảng User và Submission
    ).filter(
        Submission.exam_id == contest.id,  # Lọc theo exam_id
        User.role == 'student',            # Lọc chỉ sinh viên
        User.delete_at.is_(None)          # Lọc sinh viên chưa bị xóa
    ).distinct().count()
    
    # total_submissions = Submission.query.filter_by(exam_id=contest.id).count()
    total_submissions = db.session.query(Submission).join(
        Exam, Submission.exam_id == Exam.id  # Join giữa Submission và Exam
    ).filter(
        Exam.id == contest.id  # Lọc theo contest.id
    ).count()
    print("contest id là: ", contest.id)

    
    graded_submissions = Submission.query.filter(
        Submission.exam_id == contest.id, 
        Submission.is_graded == 1
    ).count()
    creator = User.query.filter(User.id == contest.created_by, User.delete_at.is_(None)).first()

    return {
        "title": contest.title,
        "status": contest.status,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "creator": creator.username if creator else "Unknown"
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

from sqlalchemy import func, case

def get_exams(page=1, per_page=10, sort_by='start_time', order='desc', status=None):
    """
    Truy vấn danh sách các cuộc thi từ database với các tùy chọn lọc, phân trang và sắp xếp.
    Bao gồm thông tin:
    - Tình trạng cuộc thi
    - Số lượng thí sinh của từng cuộc thi
    - Người tạo kỳ thi (từ bảng admins hoặc teachers)
    """
    query = Exam.query

    # Lọc theo trạng thái (nếu có)
    if status:
        query = query.filter(Exam.status == status)

    # Join với Submission, Admins và Teachers
    query = query.outerjoin(Submission, Submission.exam_id == Exam.id) \
             .outerjoin(User, User.id == Exam.created_by) \
             .outerjoin(Admin, Admin.username == User.username) \
             .outerjoin(Teacher, Teacher.username == User.username) \
             .add_columns(
                 Exam.id,
                 Exam.title,
                 Exam.status,
                 func.count(Submission.user_id.distinct()).label("total_students"),  # Số lượng thí sinh
                 func.count(Submission.id).label("total_submissions"),  # Số bài nộp
                 func.sum(func.if_(Submission.is_graded == 1, 1, 0)).label("graded_submissions"),  # Số bài đã chấm
                 func.coalesce(Admin.name, Teacher.name).label("creator_name")  # Lấy tên từ Admin hoặc Teacher
             ).group_by(Exam.id, Admin.name, Teacher.name)


    # Sắp xếp
    if order == 'asc':
        query = query.order_by(getattr(Exam, sort_by).asc())
    else:
        query = query.order_by(getattr(Exam, sort_by).desc())

    # Phân trang
    exams = query.paginate(page=page, per_page=per_page, error_out=False)

    return exams

def get_exam_details(exam_id):
    """
    Lấy thông tin kỳ thi và danh sách thí sinh.
    """
    # Lấy thông tin kỳ thi
    exam = Exam.query.get(exam_id)
    if not exam:
        return None

    # Lấy tên người tạo
    creator = (
        db.session.query(User.username, Admin.name, Teacher.name)
        .outerjoin(Admin, Admin.username == User.username)
        .outerjoin(Teacher, Teacher.username == User.username)
        .filter(User.id == exam.created_by)
        .first()
    )
    creator_name = creator[1] or creator[2] or "Không rõ"

    # Lấy danh sách thí sinh, điểm và xếp hạng
    scores = (
        db.session.query(
            User.username,
            Student.name,
            Student.student_class,
            Student.department,
            Score.scores,
            func.rank().over(order_by=Score.scores.desc()).label("rank")
        )
        .join(Score, Score.user_id == User.id)
        .join(Student, Student.username == User.username)
        .filter(Score.exam_id == exam_id, Score.scores.isnot(None))
        .order_by(Score.scores.desc())
        .all()
    )

    # Định dạng kết quả
    return {
        "title": exam.title,
        "creator_name": creator_name,
        "participants": [
            {
                "username": score.username,
                "name": score.name,
                "student_class": score.student_class,
                "department": score.department,
                "score": score.scores,
                "rank": score.rank,
            }
            for score in scores
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
