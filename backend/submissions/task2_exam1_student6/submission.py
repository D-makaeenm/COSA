# Hàm kiểm tra số hoàn hảo
def is_perfect_number(x):
    if x < 2:
        return False
    sum_divisors = sum(i for i in range(1, x) if x % i == 0)
    return sum_divisors == x

# Đọc dữ liệu từ file input
with open("HOANHAO.INP", "r") as f:
    n = int(f.readline().strip())
    a = list(map(int, f.readline().split()))

# Tính tổng các số hoàn hảo
perfect_sum = sum(x for x in a if is_perfect_number(x))

# Ghi kết quả ra file output
with open("HOANHAO.OUT", "w") as f:
    f.write(str(perfect_sum if perfect_sum > 0 else -1) + "\n")