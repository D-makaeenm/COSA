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
