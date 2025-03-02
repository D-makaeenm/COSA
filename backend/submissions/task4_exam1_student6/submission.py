with open("MAHOA.INP", "r") as f:
    K, N, P, Q = map(int, f.readline().split())

count = sum(1 for T in range(K, N + 1) if (P * T) % Q == 0)

with open("MAHOA.OUT", "w") as f:
    f.write(str(count) + "\n")
