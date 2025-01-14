from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Bảng `users`
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'teacher', 'admin'), default=None)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now(), nullable=True)
    delete_at = db.Column(db.DateTime, nullable=True)
    name = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(15), nullable=True)
    email = db.Column(db.String(255), nullable=True, unique=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

# Bảng `exams`
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

    creator = db.relationship('User', backref=db.backref('created_exams', lazy=True))

# Bảng `exam_tasks`
class ExamTask(db.Model):
    __tablename__ = 'exam_tasks'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    task_title = db.Column(db.String(255), nullable=False)
    task_description = db.Column(db.Text, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    execution_time_limit = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    exam = db.relationship('Exam', backref=db.backref('tasks', cascade='all, delete-orphan'))

# Bảng `exam_participants`
class ExamParticipant(db.Model):
    __tablename__ = 'exam_participants'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    delete_at = db.Column(db.DateTime, default=db.func.now())

    exam = db.relationship('Exam', backref=db.backref('participants', cascade='all, delete-orphan'))
    user = db.relationship('User', backref=db.backref('participations', cascade='all, delete-orphan'))

# Bảng `grading_criteria`
class GradingCriteria(db.Model):
    __tablename__ = 'grading_criteria'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    criteria_name = db.Column(db.String(255), nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)

    exam = db.relationship('Exam', backref=db.backref('grading_criteria', cascade='all, delete-orphan'))

# Bảng `submissions`
class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    exam_task_id = db.Column(db.Integer, db.ForeignKey('exam_tasks.id', ondelete='CASCADE'), nullable=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    submitted_at = db.Column(db.DateTime, default=db.func.now())
    execution_time = db.Column(db.Float, nullable=True)
    score = db.Column(db.Float, nullable=True)
    is_graded = db.Column(db.Boolean, default=False)

# Bảng `scores`
class Score(db.Model):
    __tablename__ = 'scores'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    scores = db.Column(db.Float, nullable=True)
    graded_at = db.Column(db.DateTime, nullable=True)

# Bảng `testcases`
class Testcase(db.Model):
    __tablename__ = 'testcases'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    input = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    execution_time = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    exam = db.relationship('Exam', backref=db.backref('testcases', cascade='all, delete-orphan'))

# Bảng `error_logs`
class ErrorLog(db.Model):
    __tablename__ = 'error_logs'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    line_number = db.Column(db.Integer, nullable=True)
    error_message = db.Column(db.Text, nullable=False)

    submission = db.relationship('Submission', backref=db.backref('error_logs', cascade='all, delete-orphan'))

# Bảng `notifications`
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    user = db.relationship('User', backref=db.backref('notifications', cascade='all, delete-orphan'))
