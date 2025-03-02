# Đọc dữ liệu từ file input
with open("SOLON2.INP", "r") as f:
    n = int(f.readline().strip())
    a = list(map(int, f.readline().split()))

# Xử lý tìm số lớn thứ hai
unique_numbers = sorted(set(a), reverse=True)

# Ghi kết quả ra file output
with open("SOLON2.OUT", "w") as f:
    f.write(str(unique_numbers[1]) + "\n")