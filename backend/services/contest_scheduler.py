import pymysql
import schedule
import time
from datetime import datetime
import pytz
from urllib.parse import urlparse
from config import Config

# Parse SQLALCHEMY_DATABASE_URI để lấy thông tin kết nối
db_url = urlparse(Config.SQLALCHEMY_DATABASE_URI.replace("mysql+pymysql://", "mysql://"))
DB_CONFIG = {
    "host": db_url.hostname,
    "user": db_url.username,
    "password": db_url.password,
    "database": db_url.path.lstrip("/"),
    "port": db_url.port if db_url.port else 3306
}

# Kết nối MySQL
def connect_db():
    return pymysql.connect(
        host=DB_CONFIG["host"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        database=DB_CONFIG["database"],
        port=DB_CONFIG["port"],
        cursorclass=pymysql.cursors.DictCursor
    )

# Hàm cập nhật trạng thái cuộc thi
def update_contest_status():
    vn_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    current_time = datetime.now(vn_tz).strftime('%Y-%m-%d %H:%M:%S')

    connection = connect_db()
    cursor = connection.cursor()

    # Cập nhật từ scheduled -> ongoing
    cursor.execute("""
        UPDATE exams 
        SET status = 'ongoing' 
        WHERE status = 'scheduled' 
        AND start_time <= %s;
    """, (current_time,))

    # Cập nhật từ ongoing -> completed
    cursor.execute("""
        UPDATE exams 
        SET status = 'completed' 
        WHERE status = 'ongoing' 
        AND end_time <= %s;
    """, (current_time,))

    connection.commit()
    cursor.close()
    connection.close()
    print(f"Đã cập nhật trạng thái cuộc thi vào {current_time}")

# Lên lịch kiểm tra trạng thái mỗi phút
schedule.every(1).minutes.do(update_contest_status)

# Chạy vòng lặp kiểm tra liên tục
def start_scheduler():
    print("Bắt đầu kiểm tra trạng thái cuộc thi...")
    while True:
        schedule.run_pending()
        time.sleep(1)
