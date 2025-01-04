from routes.auth import auth_bp
from routes.protected import protected_bp
from routes.dashboard import dashboard_bp  # Thêm route dashboard nếu có

# Hàm đăng ký routes
def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(protected_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')  # Đăng ký route dashboard nếu cần
