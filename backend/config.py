import os

class Config:
    # Đọc URL từ biến môi trường, nếu không có thì mặc định localhost
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://root:makaeenm1@localhost:3306/cosa'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'DEVDUY'  # Đổi thành khóa bí mật của bạn
