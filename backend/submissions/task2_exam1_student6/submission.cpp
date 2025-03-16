#include <iostream>
#include <fstream>
#include <vector>

using namespace std;

// Hàm kiểm tra số hoàn hảo
bool isPerfectNumber(int x) {
    if (x <= 1) return false;
    int sum = 1;
    for (int i = 2; i * i <= x; i++) { 
        if (x % i == 0) { 
            sum += i; 
            if (i != x / i) sum += x / i;
        }
    }
    return sum == x;
}

int main() {
    ifstream infile("HOANHAO.INP");
    ofstream outfile("HOANHAO.OUT");

    if (!infile || !outfile) return 1;

    vector<int> numbers;
    int num;
    while (infile >> num) {
        numbers.push_back(num);
    }

    infile.close();

    int sumPerfect = 0;
    for (int num : numbers) {
        if (isPerfectNumber(num)) {
            sumPerfect += num;
        }
    }

    // Chỉ ghi kết quả ra file, không ghi debug
    outfile << (sumPerfect > 0 ? sumPerfect : -1);
    outfile.close();

    return 0;
}
