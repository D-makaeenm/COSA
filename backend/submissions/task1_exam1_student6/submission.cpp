#include <iostream>
#include <fstream>
#include <set>

using namespace std;

int main() {
    ifstream fin("SOLON2.INP"); // Mở file đầu vào
    ofstream fout("SOLON2.OUT"); // Mở file đầu ra

    int n;
    fin >> n; // Đọc số lượng phần tử

    set<int> unique_numbers; // Tập hợp để lưu các số duy nhất
    for (int i = 0; i < n; i++) {
        int x;
        fin >> x;
        unique_numbers.insert(x);
    }

    // Nếu không có đủ hai số khác nhau
    if (unique_numbers.size() < 2) {
        fout << "Không có số lớn thứ hai";
    } else {
        auto it = unique_numbers.rbegin(); // Lấy số lớn nhất
        ++it; // Lấy số lớn thứ hai
        fout << *it;
    }

    fin.close();
    fout.close();
    return 0;
}