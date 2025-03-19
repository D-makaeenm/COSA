from flask import Flask
from config import Config
from flask_cors import CORS
from models import db
from flask_jwt_extended import JWTManager
from routes import register_routes
import threading
from services.contest_scheduler import start_scheduler
import os

app = Flask(__name__)
app.config.from_object(Config)

# Kích hoạt CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Khởi tạo cơ sở dữ liệu và JWT
db.init_app(app)
jwt = JWTManager(app)

# Đăng ký routes
register_routes(app)

scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
scheduler_thread.start()

print("Root path:", os.getcwd())

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Tạo bảng nếu chưa tồn tại
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", 5000))
    app.run(host=host, port=port, debug=True)

