from routes.auth import auth_bp
from routes.protected import protected_bp
from routes.dashboard import dashboard_bp  # Thêm route dashboard nếu có
from routes.admin import admin_bp

# Hàm đăng ký routes
def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(protected_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(admin_bp, url_prefix='/admin')
