from models import User, db, Exam, ExamParticipant
from werkzeug.security import generate_password_hash
from sqlalchemy import func, asc, text
from datetime import datetime
from flask_jwt_extended import get_jwt_identity


current_utc_time = datetime.utcnow()

# Hàm tạo tài khoản student
def create_student_account(username, password, name, phone, email, exam_id):
    """Tạo tài khoản student mới và gắn vào kỳ thi."""
    try:
        # Kiểm tra username đã tồn tại
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 400

        # Kiểm tra kỳ thi có tồn tại không
        exam = Exam.query.get(exam_id)
        if not exam:
            return {"error": "Exam not found"}, 404

        # Tạo tài khoản sinh viên mới
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            password=hashed_password,
            role="student",
            name=name,
            phone=phone,
            email=email,
        )
        db.session.add(new_user)
        db.session.flush()  # Đẩy dữ liệu vào session để lấy ID mà không commit

        # Gắn sinh viên vào kỳ thi
        exam_participant = ExamParticipant(
            exam_id=exam_id,
            user_id=new_user.id  # Sử dụng ID từ flush
        )
        db.session.add(exam_participant)

        # Commit toàn bộ dữ liệu
        db.session.commit()

        return {
            "message": "Student account created successfully",
            "user_id": new_user.id,
            "exam_id": exam_id,
        }, 201

    except Exception as e:
        db.session.rollback()  # Hoàn tác nếu có lỗi
        return {"error": str(e)}, 500


# Hàm tạo tài khoản teacher
def create_teacher_account(username, password, name, phone, email):
    """Tạo tài khoản teacher mới."""
    try:
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 400

        hashed_password = generate_password_hash(password)

        new_user = User(username=username, password=hashed_password, role="teacher", name=name, phone=phone, email=email)
        db.session.add(new_user)

        db.session.commit()

        return {"message": "Teacher account created successfully"}, 201

    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500

# Hàm tạo tài khoản admin
def create_admin_account(username, password, name, phone, email):
    """Tạo tài khoản admin mới."""
    try:
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 400

        hashed_password = generate_password_hash(password)

        new_user = User(username=username, password=hashed_password, role="admin", name=name, phone=phone, email=email)
        db.session.add(new_user)

        db.session.commit()

        return {"message": "Admin account created successfully"}, 201

    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500

def get_account_counts():
    """
    Lấy số lượng tài khoản theo từng loại role (student, teacher, admin) mà không bị xóa.
    """
    # Đếm số lượng account theo từng role, loại bỏ các tài khoản đã bị xóa
    counts = User.query.with_entities(
        User.role,
        func.count(User.id).label("count")
    ).filter(User.delete_at.is_(None)).group_by(User.role).all()

    # Chuyển đổi kết quả thành dictionary
    account_counts = {role: count for role, count in counts}
    
    # Bảo đảm trả về đủ các loại role, kể cả khi không có
    return {
        "admin": account_counts.get("admin", 0),
        "teacher": account_counts.get("teacher", 0),
        "student": account_counts.get("student", 0)
    }

def get_admins():
    """
    Lấy danh sách tất cả admin từ bảng `users`.
    """
    admins = (
        db.session.query(User)
        .filter(User.role == 'admin')  # Lọc các tài khoản có vai trò admin
        .filter(User.delete_at.is_(None))  # Chỉ lấy những tài khoản chưa bị xóa
        .order_by(asc(User.id))  # Sắp xếp theo ID tăng dần
        .all()
    )

    return [
        {
            "id": admin.id,
            "username": admin.username,
            "name": admin.name,
            "phone": admin.phone,
            "email": admin.email,
            "created_at": admin.created_at,
        }
        for admin in admins
    ]


def update_admin(username, name, phone, email, password=None):
    """
    Cập nhật thông tin admin (và mật khẩu nếu được cung cấp).
    """
    admin = User.query.filter_by(username=username, role='admin', delete_at=None).first()
    if not admin:
        return {"error": "Admin not found"}, 404

    # Cập nhật thông tin admin
    admin.name = name
    admin.phone = phone
    admin.email = email

    # Cập nhật mật khẩu nếu được cung cấp
    if password:
        admin.password = generate_password_hash(password)

    db.session.commit()

    return {"message": "Admin updated successfully!"}, 200


def delete_admin(username):
    """
    Gắn cờ xóa mềm cho tài khoản Admin bằng cách đặt giá trị delete_at.
    """
    admin = User.query.filter_by(username=username, role='admin').first()
    if not admin:
        return {"error": "Admin not found"}, 404

    admin.delete_at = db.func.now()
    db.session.commit()

    return {"message": "Admin account deleted successfully!"}, 200



def get_teachers():
    """
    Lấy danh sách tất cả giáo viên từ bảng users.
    """
    teachers = (
        User.query.filter_by(role='teacher', delete_at=None)
        .order_by(User.id)
        .all()
    )

    return [
        {
            "id": teacher.id,
            "username": teacher.username,
            "name": teacher.name,
            "phone": teacher.phone,
            "email": teacher.email,
            "created_at": teacher.created_at,
        }
        for teacher in teachers
    ]


def update_teacher(username, name, phone, email, password=None):
    """
    Cập nhật thông tin giáo viên (và mật khẩu nếu được cung cấp).
    """
    teacher = User.query.filter_by(username=username, role='teacher', delete_at=None).first()
    if not teacher:
        return {"error": "Teacher not found"}, 404

    # Cập nhật thông tin giáo viên
    teacher.name = name
    teacher.phone = phone
    teacher.email = email

    # Cập nhật mật khẩu nếu được cung cấp
    if password:
        teacher.password = generate_password_hash(password)

    db.session.commit()

    return {"message": "Teacher updated successfully!"}, 200


def delete_teacher(username):
    """
    Gắn cờ xóa mềm cho tài khoản giáo viên bằng cách đặt giá trị delete_at.
    """
    teacher = User.query.filter_by(username=username, role='teacher').first()
    if not teacher:
        return {"error": "Teacher not found"}, 404

    teacher.delete_at = db.func.now()
    db.session.commit()

    return {"message": "Teacher account deleted successfully!"}, 200


def get_students():
    """
    Lấy danh sách tất cả sinh viên từ bảng users.
    """
    students = (
        User.query.filter_by(role='student', delete_at=None)
        .order_by(User.id)
        .all()
    )

    return [
        {
            "id": student.id,
            "username": student.username,
            "name": student.name,
            "phone": student.phone,
            "email": student.email,
            "created_at": student.created_at,
        }
        for student in students
    ]


def update_student(username, name, phone, email, password=None, exam_id=None):
    """
    Cập nhật thông tin sinh viên (và mật khẩu nếu được cung cấp).
    """
    try:
        # Lấy thông tin sinh viên từ bảng User
        student = User.query.filter_by(username=username, role='student', delete_at=None).first()
        if not student:
            return {"error": "Student not found"}, 404

        # Cập nhật thông tin sinh viên
        student.name = name
        student.phone = phone
        student.email = email

        # Cập nhật mật khẩu nếu được cung cấp
        if password:
            student.password = generate_password_hash(password)

        # Nếu có exam_id, cập nhật kỳ thi cho sinh viên
        if exam_id:
            # Kiểm tra kỳ thi có tồn tại không
            exam = Exam.query.get(exam_id)
            if not exam:
                return {"error": "Exam not found"}, 404

            # Kiểm tra xem sinh viên đã tham gia kỳ thi này chưa
            participant = ExamParticipant.query.filter_by(user_id=student.id, exam_id=exam_id).first()

            if participant:
                # Nếu đã có và không bị xóa mềm, không cần thêm mới
                if participant.delete_at is None:
                    return {"message": "Student is already participating in this exam!"}, 200
                else:
                    # Nếu đã bị xóa mềm, cập nhật lại
                    participant.delete_at = None
            else:
                # Thêm bản ghi mới vào bảng ExamParticipant
                new_participation = ExamParticipant(exam_id=exam_id, user_id=student.id)
                db.session.add(new_participation)

        # Lưu các thay đổi vào database
        db.session.commit()

        return {"message": "Student updated successfully!"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


def delete_student(username):
    """
    Gắn cờ xóa mềm cho tài khoản sinh viên bằng cách đặt giá trị delete_at.
    """
    student = User.query.filter_by(username=username, role='student').first()
    if not student:
        return {"error": "Student not found"}, 404

    student.delete_at = db.func.now()
    db.session.commit()

    return {"message": "Student account deleted successfully!"}, 200


def get_account_name(username):
    """
    Lấy tên đầy đủ (name) từ username hiện tại.
    """
    user = User.query.filter_by(username=username).first()  # Truy vấn user theo username
    if not user:
        return None  # Không tìm thấy user

    # Trả về thông tin user dưới dạng dictionary
    return {
        "username": user.username,
        "name": user.name
    }