import os

host_ip = os.getenv("HOST_IP", "127.0.0.1").split()[0]  # Chỉ lấy IP đầu tiên
print(f"HOST_IP sau khi xử lý: {host_ip}")  # Debug thử
