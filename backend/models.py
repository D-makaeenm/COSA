from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Trong này là tất cả các bảng được ánh xạ trong database ra
# Bảng `users`
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'teacher', 'admin'), default='student')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())  # Mặc định giá trị là thời gian hiện tại
    updated_at = db.Column(db.DateTime, nullable=True, onupdate=db.func.now())
    delete_at = db.Column(db.DateTime, nullable=True, default=None)

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

# Bảng `students`
class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), db.ForeignKey('users.username'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    student_class = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

# Bảng `exams`
class Exam(db.Model):
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum('scheduled', 'ongoing', 'completed'), default='scheduled')
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'status': self.status,
            'start_time': self.start_time,
            'end_time': self.end_time,
        }

# Bảng `exam_tasks`
class ExamTask(db.Model):
    __tablename__ = 'exam_tasks'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    task_title = db.Column(db.String(255), nullable=False)
    task_description = db.Column(db.Text, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    execution_time_limit = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

# Bảng `grading_criteria`
class GradingCriteria(db.Model):
    __tablename__ = 'grading_criteria'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    criteria_name = db.Column(db.String(255), nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)

# Bảng `submissions`
class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id'), nullable=False)  # Bắt buộc
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    submitted_at = db.Column(db.DateTime, default=db.func.now())
    execution_time = db.Column(db.Float, nullable=True)
    score = db.Column(db.Float, nullable=True)
    is_graded = db.Column(db.Boolean, default=False)


# Bảng `scores`
class Score(db.Model):
    __tablename__ = 'scores'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    scores = db.Column(db.Float, nullable=False)  # Đổi thành Float
    graded_at = db.Column(db.DateTime, nullable=True)


# Bảng `testcases`
class Testcase(db.Model):
    __tablename__ = 'testcases'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    input = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    execution_time = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

# Bảng `error_logs`
class ErrorLog(db.Model):
    __tablename__ = 'error_logs'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'), nullable=False)
    line_number = db.Column(db.Integer, nullable=True)
    error_message = db.Column(db.Text, nullable=False)

# Bảng `notifications`
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=True)

class Teacher(db.Model):
    __tablename__ = 'teachers'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), db.ForeignKey('users.username'), nullable=False, unique=True)  # Khóa ngoại tham chiếu tới bảng users
    name = db.Column(db.String(100), nullable=False)  # Tên đầy đủ của giáo viên
    department = db.Column(db.String(100), nullable=True)  # Bộ môn hoặc khoa (có thể NULL)
    created_at = db.Column(db.DateTime, default=db.func.now())  # Thời điểm tạo

class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), db.ForeignKey('users.username'), nullable=False, unique=True)  # Khóa ngoại tham chiếu tới bảng users
    name = db.Column(db.String(100), nullable=False)  # Tên của admin
    phone = db.Column(db.String(15), nullable=True)  # Số điện thoại (có thể NULL)
    email = db.Column(db.String(255), nullable=True, unique=True)  # Email (có thể NULL, đảm bảo unique)
    created_at = db.Column(db.DateTime, default=db.func.now())  # Thời điểm tạo