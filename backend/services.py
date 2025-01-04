from models import Exam, Submission, User
from sqlalchemy import func

def get_latest_contest_summary():
    # Lấy cuộc thi gần nhất
    latest_contest = Exam.query.order_by(Exam.start_time.desc()).first()
    if not latest_contest:
        return None

    # Thông tin tổng quan về cuộc thi
    total_students = User.query.filter_by(role='student').filter(User.delete_at.is_(None)).count()
    total_submissions = Submission.query.filter_by(exam_id=latest_contest.id).count()
    graded_submissions = Submission.query.filter(Submission.exam_id == latest_contest.id,Submission.is_graded == 1).count()
    creator = User.query.filter(User.id == latest_contest.created_by, User.delete_at.is_(None)).first() 

    contest_info = {
        "title": latest_contest.title,
        "status": latest_contest.status,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "creator": creator.username if creator else "Unknown"
    }

    # Tiến độ nộp bài
    progress_data = Submission.query.with_entities(
        func.hour(Submission.submitted_at).label('hour'),
        func.count(Submission.id).label('total_submissions'),
        func.sum(func.if_(Submission.submitted_at <= latest_contest.end_time, 1, 0)).label('before_deadline'),
        func.sum(func.if_(Submission.submitted_at > latest_contest.end_time, 1, 0)).label('at_deadline'),
        func.sum(func.if_(Submission.is_graded == False, 1, 0)).label('ungraded_submissions')
    ).filter(
        Submission.exam_id == latest_contest.id
    ).group_by(
        func.hour(Submission.submitted_at)
    ).order_by('hour').all()

    progress = [
        {
            "time": f"{hour}:00",
            "total_submissions": total,
            "before_deadline": before,
            "at_deadline": at,
            "ungraded_submissions": ungraded
        }
        for hour, total, before, at, ungraded in progress_data
    ]

    return {
        "info": contest_info,
        "progress": progress
    }
