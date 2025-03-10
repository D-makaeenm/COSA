with open("FIBO.INP", "r") as f:
    n = int(f.readline().strip())  # Đọc số lượng phần tử
    fib_numbers = list(map(int, f.readline().split()))  # Đọc dãy số
is_fibo = all(fib_numbers[i] == fib_numbers[i - 1] + fib_numbers[i - 2] for i in range(2, n))
with open("FIBO.OUT", "w") as f:
    f.write("1\n" if is_fibo else "0\n")