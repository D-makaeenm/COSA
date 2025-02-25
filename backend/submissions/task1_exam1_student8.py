def tinh_tong(a, b):
    return a + b
# Đọc input từ test case
so_1, so_2 = map(int, input().split(","))
tong = tinh_tong(so_1, so_2)
# In kết quả
print(tong)