from flask import Flask
from config import Config
from flask_cors import CORS
from models import db
from flask_jwt_extended import JWTManager
from routes import register_routes

app = Flask(__name__)
app.config.from_object(Config)

# Kích hoạt CORS
CORS(app)

# Khởi tạo cơ sở dữ liệu và JWT
db.init_app(app)
jwt = JWTManager(app)

# Đăng ký routes
register_routes(app)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Tạo bảng nếu chưa tồn tại
    app.run(host='0.0.0.0', port=5000, debug=True)
