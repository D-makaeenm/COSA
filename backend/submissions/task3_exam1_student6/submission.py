# ✅ Đọc dữ liệu từ file FIBO.INP
with open("FIBO.INP", "r") as f:
    n = int(f.readline().strip())
    fib_numbers = list(map(int, f.readline().split()))

# ✅ Kiểm tra tính chất Fibonacci
is_fibo = all(fib_numbers[i] == fib_numbers[i - 1] + fib_numbers[i - 2] for i in range(2, n))

# ✅ Ghi kết quả ra file FIBO.OUT
with open("FIBO.OUT", "w") as f:
    f.write("1\n" if is_fibo else "0\n")
