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


# 📌 Bảng `exams` (Kỳ thi)
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

    created_by_user = db.relationship('User', backref='exams')


# 📌 Bảng `exam_tasks` (Bài tập trong kỳ thi)
class ExamTask(db.Model):
    __tablename__ = 'exam_tasks'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    task_title = db.Column(db.String(255), nullable=False)
    task_description = db.Column(db.Text, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    execution_time_limit = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(255), nullable=False)  # Đường dẫn ảnh minh họa
    delete_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    exam = db.relationship('Exam', backref='tasks')

# 📌 Bảng `exam_participants` (Danh sách người tham gia kỳ thi)
class ExamParticipant(db.Model):
    __tablename__ = 'exam_participants'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    delete_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref='participations')
    exam = db.relationship('Exam', backref='participants')

# 📌 Bảng `testcases` (Bộ Test Case)
class Testcase(db.Model):
    __tablename__ = 'testcases'

    id = db.Column(db.Integer, primary_key=True)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id', ondelete='CASCADE'), nullable=False)
    input_path = db.Column(db.String(255), nullable=False)  # Đường dẫn file input
    output_path = db.Column(db.String(255), nullable=False)  # Đường dẫn file output
    time_limit = db.Column(db.Float, nullable=False)  # Giới hạn thời gian thực thi
    created_at = db.Column(db.DateTime, default=db.func.now())

    task = db.relationship('ExamTask', backref='testcases')


# 📌 Bảng `submissions` (Bài nộp của thí sinh)
class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id', ondelete='CASCADE'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    file_path_code = db.Column(db.String(255), nullable=False)  # Đường dẫn đến file code bài nộp
    submitted_at = db.Column(db.DateTime, default=db.func.now())
    execution_time = db.Column(db.Float, nullable=True)  # Thời gian thực thi code
    is_graded = db.Column(db.Boolean, default=False)  # Đã chấm điểm hay chưa
    score = db.Column(db.Float, default=0)  # Điểm số của bài nộp
    output = db.Column(db.Text, nullable=False)  # Kết quả chạy của bài nộp

    user = db.relationship('User', backref='submissions')
    task = db.relationship('ExamTask', backref='submissions')
    exam = db.relationship('Exam', backref='submissions')


# 📌 Bảng `scores` (Tổng điểm của thí sinh cho mỗi kỳ thi)
class Score(db.Model):
    __tablename__ = 'scores'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    total_score = db.Column(db.Float, default=0)  # Tổng điểm sau khi chấm
    graded_at = db.Column(db.DateTime, default=db.func.now())

    user = db.relationship('User', backref='scores')
    exam = db.relationship('Exam', backref='scores')


# 📌 Bảng `error_logs` (Lưu lỗi khi nộp bài)
class ErrorLog(db.Model):
    __tablename__ = 'error_logs'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    line_number = db.Column(db.Integer, nullable=True)  # Dòng lỗi nếu có
    error_message = db.Column(db.Text, nullable=False)  # Mô tả lỗi
    error_time = db.Column(db.DateTime, default=db.func.now())

    submission = db.relationship('Submission', backref='error_logs')
