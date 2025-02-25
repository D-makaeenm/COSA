def dao_nguoc_chuoi(s):
    return s[::-1]
# Đọc input từ test case
chuoi_dau_vao = input()
# Đảo ngược chuỗi
chuoi_dao_nguoc = dao_nguoc_chuoi(chuoi_dau_vao)
# In kết quả
print(chuoi_dao_nguoc)