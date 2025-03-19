# Sử dụng Python 3.10 làm base image
FROM python:3.10

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép toàn bộ mã nguồn của backend vào container
COPY . /app

# Cài đặt thư viện cần thiết
RUN pip install --no-cache-dir -r requirements.txt

# Expose cổng 5000 để truy cập Flask
EXPOSE 5000

# Chạy ứng dụng Flask
CMD ["python", "app.py"]
