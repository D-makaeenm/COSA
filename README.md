# 🌟 COSA Project 🚀 (Contest Online Scoring & Automation)

## 📖 Giới thiệu
Hệ thống tự động hóa chấm điểm cuộc thi **Olympic Tin học khối không chuyên**.

COSA gồm:
- **Backend:** Python Flask
- **Frontend:** ReactJS
- **Database:** MySQL

✅ Được Docker hóa giúp dễ dàng **deploy và chạy trên bất kỳ máy nào**.

---

## 🛠 Công nghệ sử dụng
- **Backend:** Python + Flask + SQLAlchemy
- **Frontend:** ReactJS + Nginx
- **Database:** MySQL
- **Docker & Docker Compose**

---

## 🚀 Hướng dẫn chạy dự án

### 🔥 **Bước 1:** Clone project
bash
git clone https://github.com/your-username/COSA.git
cd COSA
### 🔥 **Bước 2:** Build và chạy bằng Docker Compose
⚠️ Trước khi chạy, đặt biến môi trường HOST_IP (dùng PowerShell trên Windows):
$env:HOST_IP="192.168.1.3"
Sau đó chạy:
docker-compose up --build
💻 Một số lệnh Docker tham khảo
docker ps -a	Liệt kê tất cả các container
docker exec -it cosa_db mysql -u root -p	Truy cập vào container MySQL
docker-compose up -d	Khởi động container (không build lại, code giữ nguyên)
docker-compose up --build	Build lại từ Dockerfile rồi chạy (áp dụng khi thay đổi code hoặc Dockerfile)
💾 Database
User: root
Password: makaeenm1
Database: cosa
📌 Import database (nếu cần):

bash
Sao chép
Chỉnh sửa
docker exec -it cosa_db mysql -u root -p
mysql> source /path/to/database.sql;
💡 Ghi chú
Docker volume lưu database => Không mất dữ liệu khi stop container.
Frontend tự động kết nối API theo biến môi trường REACT_APP_API_BASE_URL.
🤝 Đóng góp
Mọi đóng góp hoặc ý kiến xây dựng vui lòng tạo Issue hoặc Pull Request!