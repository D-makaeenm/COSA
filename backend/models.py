from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'teacher', 'admin'), default='student')
    created_at = db.Column(db.DateTime, default=db.func.now())  # Đúng kiểu DateTime
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    delete_at = db.Column(db.DateTime, nullable=True)  # Sửa thành DateTime và cho phép NULL

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'delete_at': self.delete_at
        }
# Bảng `exams`: Quản lý đề thi
class Exam(db.Model):
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Liên kết với `users`

# Bảng `grading_criteria`: Tiêu chí chấm điểm
class GradingCriteria(db.Model):
    __tablename__ = 'grading_criteria'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)  # Liên kết với `exams`
    criteria_name = db.Column(db.String(255), nullable=False)
    weight = db.Column(db.Float, nullable=False)

# Bảng `submissions`: Quản lý bài nộp
class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Liên kết với `users`
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)  # Liên kết với `exams`
    file_path = db.Column(db.String(255), nullable=False)  # Đường dẫn file
    submitted_at = db.Column(db.DateTime, default=db.func.now())
    execution_time = db.Column(db.Float, nullable=True)  # Thời gian thực thi

# Bảng `scores`: Quản lý điểm số
class Score(db.Model):
    __tablename__ = 'scores'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Liên kết với `users`
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)  # Liên kết với `exams`
    scores = db.Column(db.String(255), nullable=False)  # Điểm dạng JSON/văn bản
    graded_at = db.Column(db.DateTime, default=db.func.now())

# Bảng `error_logs`: Chi tiết lỗi trong bài nộp
class ErrorLog(db.Model):
    __tablename__ = 'error_logs'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=False)  # Liên kết với `submissions`
    line_number = db.Column(db.Integer, nullable=True)  # Dòng bị lỗi
    error_message = db.Column(db.Text, nullable=False)  # Thông báo lỗi

# Bảng `notifications`: Thông báo cho thí sinh
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Liên kết với `users`
    message = db.Column(db.Text, nullable=False)  # Nội dung thông báo
    created_at = db.Column(db.DateTime, default=db.func.now())