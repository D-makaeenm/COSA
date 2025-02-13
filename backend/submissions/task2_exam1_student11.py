def la_so_nguyen_to(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
def liet_ke_so_nguyen_to(upper_limit):
    mang_so_nt = [n for n in range(2, upper_limit) if la_so_nguyen_to(n)]
    return mang_so_nt
# Test case
gioi_han = 50
mang_nguyen_to = liet_ke_so_nguyen_to(gioi_han)
print(",".join(map(str, mang_nguyen_to)))