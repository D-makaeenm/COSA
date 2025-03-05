# Contest Online Scoring & Automation
Hệ thống tự động hóa cuộc thi Olympic Tin học trong khối không chuyên

## Để sử dụng database hãy chạy lệnh sau
mysql -u root -p -e "CREATE DATABASE cosa;"
### Đối với cmd
mysql -u root -p cosa < database.sql
### Đối với powershell
Get-Content database.sql | mysql -u root -p cosa
### Thay thông tin về chuỗi kết nối
## Cài đặt
- Chuyển đến file backend -> pip install requirements.txt
- Chuyển đến file cosa -> npm install