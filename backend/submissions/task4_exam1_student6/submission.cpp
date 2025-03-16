#include <iostream>
#include <fstream>

using namespace std;

int main() {
    ifstream infile("MAHOA.INP");
    ofstream outfile("MAHOA.OUT");

    if (!infile || !outfile) return 1; // Kiểm tra nếu mở file thất bại

    int K, N, P, Q;
    infile >> K >> N >> P >> Q;
    infile.close(); // Đóng file sau khi đọc xong

    int count = 0;
    
    // Duyệt tất cả giá trị T trong khoảng [K, N]
    for (int T = K; T <= N; T++) {
        if ((P * T) % Q == 0) {
            count++;
        }
    }

    outfile << count;
    outfile.close(); // Đóng file sau khi ghi xong

    return 0;
}
