from models import Exam, Submission, User
from sqlalchemy import func

def get_latest_contest():
    """Lấy thông tin cuộc thi gần nhất."""
    return Exam.query.order_by(Exam.start_time.desc()).first()

def get_contest_summary(contest):
    """Tổng hợp thông tin tổng quan về cuộc thi."""
    total_students = User.query.filter_by(role='student').filter(User.delete_at.is_(None)).count()
    total_submissions = Submission.query.filter_by(exam_id=contest.id).count()
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
