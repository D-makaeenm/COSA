class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:makaeenm1@localhost/cosa'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'DEVDUY'  # Đổi thành khóa bí mật của bạn
