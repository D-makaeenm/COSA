from routes.auth import auth_bp
from routes.protected import protected_bp
from routes.dashboard import dashboard_bp  # Thêm route dashboard nếu có
from routes.admin import admin_bp
from routes.exam import exam_bp
from routes.user import user_bp
from routes.student import student_bp


# Hàm đăng ký routes
def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(protected_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(exam_bp, url_prefix='/management')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(student_bp, url_prefix='/student')

