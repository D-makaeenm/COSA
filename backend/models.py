from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# 📌 Bảng `users` (Người dùng)
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'teacher', 'admin'), default='student')
    name = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(15), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    delete_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


# 📌 Bảng `exams` (Cuộc thi)
class Exam(db.Model):
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum('scheduled', 'ongoing', 'completed'), default='scheduled')
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())


# 📌 Bảng `exam_tasks` (Bài toán)
class ExamTask(db.Model):
    __tablename__ = 'exam_tasks'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    task_title = db.Column(db.String(255), nullable=False)
    task_description = db.Column(db.Text, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    execution_time_limit = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    delete_at = db.Column(db.DateTime, default=db.func.now())
    penalty_per_time_over = db.Column(db.Float, nullable=False)


# 📌 Bảng `grading_criteria` (Tiêu chí chấm điểm)
class GradingCriteria(db.Model):
    __tablename__ = 'grading_criteria'

    id = db.Column(db.Integer, primary_key=True)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id', ondelete='CASCADE'), nullable=False)
    criteria_name = db.Column(db.String(255), nullable=False)
    penalty = db.Column(db.Float, default=0.0)  # Điểm trừ nếu vi phạm


# 📌 Bảng `exam_participants` (Danh sách thí sinh)
class ExamParticipant(db.Model):
    __tablename__ = 'exam_participants'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    delete_at = db.Column(db.DateTime)

# 📌 Bảng `testcases` (Bộ test case)
class Testcase(db.Model):
    __tablename__ = 'testcases'

    id = db.Column(db.Integer, primary_key=True)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id', ondelete='CASCADE'), nullable=False)
    input = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    time_limit = db.Column(db.Float, nullable=False)  # Đổi từ `execution_time` để rõ nghĩa hơn
    created_at = db.Column(db.DateTime, default=db.func.now())


# 📌 Bảng `submissions` (Bài nộp của thí sinh)
class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id', ondelete='CASCADE'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    submitted_at = db.Column(db.DateTime, default=db.func.now())
    execution_time = db.Column(db.Float, nullable=True)
    is_graded = db.Column(db.Boolean, default=False)


# 📌 Bảng `grading_results` (Kết quả chấm điểm theo từng tiêu chí)
class GradingResult(db.Model):
    __tablename__ = 'grading_results'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    criteria_id = db.Column(db.Integer, db.ForeignKey('grading_criteria.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Float, nullable=False)


# 📌 Bảng `scores` (Tổng điểm)
class Score(db.Model):
    __tablename__ = 'scores'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    total_score = db.Column(db.Float, nullable=False)
    graded_at = db.Column(db.DateTime, default=db.func.now())


# 📌 Bảng `notifications` (Thông báo)
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())


# 📌 Bảng `error_logs` (Lỗi khi chấm bài)
class ErrorLog(db.Model):
    __tablename__ = 'error_logs'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    line_number = db.Column(db.Integer, nullable=True)
    error_message = db.Column(db.Text, nullable=False)
    error_time = db.Column(db.DateTime, default=db.func.now())
