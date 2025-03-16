#include <iostream>
#include <fstream>
#include <vector>

using namespace std;

int main() {
    ifstream infile("FIBO.INP");
    ofstream outfile("FIBO.OUT");

    if (!infile || !outfile) return 1; // Kiểm tra file mở thành công

    int n;
    infile >> n;

    vector<int> fibo(n);
    for (int i = 0; i < n; i++) {
        infile >> fibo[i];
    }

    infile.close(); // Đóng file sau khi đọc xong

    bool isFibonacci = true;
    
    // Kiểm tra tính chất Fibonacci
    for (int i = 2; i < n; i++) {
        if (fibo[i] != fibo[i - 1] + fibo[i - 2]) {
            isFibonacci = false;
            break;
        }
    }

    outfile << (isFibonacci ? 1 : 0);
    outfile.close(); // Đóng file sau khi ghi xong

    return 0;
}
