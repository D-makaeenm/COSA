def la_so_nguyen_to(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
def liet_ke_so_nguyen_to(upper_limit):
    return [n for n in range(2, upper_limit) if la_so_nguyen_to(n)]
# Đọc input từ test case
gioi_han = int(input())
# Tính toán danh sách số nguyên tố
mang_nguyen_to = liet_ke_so_nguyen_to(gioi_han)
# In kết quả
print(",".join(map(str, mang_nguyen_to)))