from models import User, Admin, Teacher, Student, db
from werkzeug.security import generate_password_hash
from sqlalchemy import func, asc, text
from datetime import datetime

current_utc_time = datetime.utcnow()

# Hàm tạo tài khoản student
def create_student_account(username, password, name, student_class, department):
    """Tạo tài khoản student mới."""
    try:
        # Kiểm tra username đã tồn tại
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 400

        hashed_password = generate_password_hash(password)

        new_user = User(username=username, password=hashed_password, role="student")
        db.session.add(new_user)

        db.session.flush()

        student = Student(username=username, name=name, student_class=student_class, department=department)
        db.session.add(student)

        db.session.commit()

        return {"message": "Student account created successfully"}, 201

    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


# Hàm tạo tài khoản teacher
def create_teacher_account(username, password, name, department, phone):
    """Tạo tài khoản teacher mới."""
    try:
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 400

        hashed_password = generate_password_hash(password)

        new_user = User(username=username, password=hashed_password, role="teacher")
        db.session.add(new_user)

        db.session.flush()

        teacher = Teacher(username=username, name=name, department=department, phone=phone)
        db.session.add(teacher)

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
        if Admin.query.filter_by(email=email).first():
            return {"error": "Email already exists"}, 400

        hashed_password = generate_password_hash(password)

        new_user = User(username=username, password=hashed_password, role="admin")
        db.session.add(new_user)

        db.session.flush()

        admin = Admin(username=username, name=name, phone=phone, email=email)
        db.session.add(admin)

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
    Lấy danh sách tất cả admin từ bảng admins và liên kết với thông tin từ bảng users.
    """
    admins = (
        db.session.query(Admin, User)
        .join(User, Admin.username == User.username)
        .filter(User.delete_at.is_(None))  # Chỉ lấy những tài khoản chưa bị xóa
        .order_by(asc(Admin.id))
        .all()
    )

    return [
        {
            "id": admin.id,
            "username": admin.username,
            "name": admin.name,
            "phone": admin.phone,
            "email": admin.email,
            "created_at": user.created_at,  # Thông tin từ bảng users
        }
        for admin, user in admins
    ]

def update_admin(username, name, phone, email, password=None):
    """
    Cập nhật thông tin admin (và mật khẩu nếu được cung cấp).
    """
    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return {"error": "Admin not found"}, 404

    # Cập nhật thông tin sinh viên
    admin.name = name
    admin.phone = phone
    admin.email = email

    # Cập nhật mật khẩu nếu được cung cấp
    if password:
        user = User.query.filter_by(username=username).first()
        if not user:
            return {"error": "User not found"}, 404
        user.password = generate_password_hash(password)

    db.session.commit()

    return {"message": "Admin updated successfully!"}, 200

def delete_admin(username):
    """
    Gắn cờ xóa mềm cho tài khoản Admin bằng cách đặt giá trị delete_at.
    """
    # Tìm sinh viên theo username
    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return {"error": "Admin not found"}, 404

    # Tìm tài khoản người dùng liên quan
    user = User.query.filter_by(username=username).first()
    if not user:
        return {"error": "User not found"}, 404

    # Đặt giá trị delete_at
    sql = text("UPDATE users SET delete_at = CURRENT_TIMESTAMP WHERE username = :username")
    db.session.execute(sql, {"username": username})
    db.session.commit()


    return {"message": "Admin account deleted successfully!"}, 200


def get_teachers():
    """
    Lấy danh sách tất cả giáo viên từ bảng teachers và liên kết với thông tin từ bảng users.
    """
    teachers = (
        db.session.query(Teacher, User)
        .join(User, Teacher.username == User.username)
        .filter(User.delete_at.is_(None))  # Chỉ lấy những tài khoản chưa bị xóa
        .order_by(asc(Teacher.id))
        .all()
    )

    return [
        {
            "id": teacher.id,
            "username": teacher.username,
            "name": teacher.name,
            "department": teacher.department,
            "phone": teacher.phone,
            "created_at": user.created_at,  # Thông tin từ bảng users
        }
        for teacher, user in teachers
    ]

def update_teacher(username, name, phone, department, password=None):
    """
    Cập nhật thông tin giáo viên (và mật khẩu nếu được cung cấp).
    """
    teacher = Teacher.query.filter_by(username=username).first()
    if not teacher:
        return {"error": "teacher not found"}, 404

    # Cập nhật thông tin sinh viên
    teacher.name = name
    teacher.phone = phone
    teacher.department = department

    # Cập nhật mật khẩu nếu được cung cấp
    if password:
        user = User.query.filter_by(username=username).first()
        if not user:
            return {"error": "User not found"}, 404
        user.password = generate_password_hash(password)

    db.session.commit()

    return {"message": "teacher updated successfully!"}, 200

def delete_teacher(username):
    """
    Gắn cờ xóa mềm cho tài khoản giaos vien bằng cách đặt giá trị delete_at.
    """
    # Tìm sinh viên theo username
    teacher = Teacher.query.filter_by(username=username).first()
    if not teacher:
        return {"error": "Teacher not found"}, 404

    # Tìm tài khoản người dùng liên quan
    user = User.query.filter_by(username=username).first()
    if not user:
        return {"error": "User not found"}, 404

    # Đặt giá trị delete_at
    sql = text("UPDATE users SET delete_at = CURRENT_TIMESTAMP WHERE username = :username")
    db.session.execute(sql, {"username": username})
    db.session.commit()

    return {"message": "Teacher account deleted successfully!"}, 200

def get_students():
    """
    Lấy danh sách tất cả thí sinh từ bảng students và liên kết với thông tin từ bảng users.
    """
    students = (
        db.session.query(Student, User)
        .join(User, Student.username == User.username)
        .filter(User.delete_at.is_(None))  # Chỉ lấy những tài khoản chưa bị xóa
        .order_by(asc(Student.id))
        .all()
    )

    return [
        {
            "id": student.id,
            "username": student.username,
            "name": student.name,
            "student_class": student.student_class,
            "department": student.department,
            "created_at": user.created_at,  # Thông tin từ bảng users
        }
        for student, user in students
    ]

def update_student(username, name, student_class, department, password=None):
    """
    Cập nhật thông tin sinh viên (và mật khẩu nếu được cung cấp).
    """
    student = Student.query.filter_by(username=username).first()
    if not student:
        return {"error": "Student not found"}, 404

    # Cập nhật thông tin sinh viên
    student.name = name
    student.student_class = student_class
    student.department = department

    # Cập nhật mật khẩu nếu được cung cấp
    if password:
        user = User.query.filter_by(username=username).first()
        if not user:
            return {"error": "User not found"}, 404
        user.password = generate_password_hash(password)

    db.session.commit()

    return {"message": "Student updated successfully!"}, 200

def delete_student(username):
    """
    Gắn cờ xóa mềm cho tài khoản thí sinh bằng cách đặt giá trị delete_at.
    """
    # Tìm sinh viên theo username
    student = Student.query.filter_by(username=username).first()
    if not student:
        return {"error": "Student not found"}, 404

    # Tìm tài khoản người dùng liên quan
    user = User.query.filter_by(username=username).first()
    if not user:
        return {"error": "User not found"}, 404

    # Đặt giá trị delete_at
    sql = text("UPDATE users SET delete_at = CURRENT_TIMESTAMP WHERE username = :username")
    db.session.execute(sql, {"username": username})
    db.session.commit()

    return {"message": "Student account deleted successfully!"}, 200