import os

class Config:
    password = 'makaeenm1'
    database = 'cosa'
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f'mysql+pymysql://root:{password}@localhost:3306/{database}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'DEVDUY'
