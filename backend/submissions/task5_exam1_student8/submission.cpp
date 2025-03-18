#include <iostream>
#include <fstream>
#include <stack>
#include <vector>

using namespace std;

// Hàm tách các cụm trong biểu thức
vector<string> extractGroups(const string &expr) {
    vector<string> groups;
    stack<int> stk;
    vector<pair<int, int>> positions;

    for (int i = 0; i < expr.size(); i++) {
        if (expr[i] == '(') {
            stk.push(i);
        } else if (expr[i] == ')') {
            if (stk.empty()) {
                return {"-1"}; // Lỗi cú pháp
            }
            int start = stk.top();
            stk.pop();
            positions.push_back({start, i});
        }
    }

    if (!stk.empty()) return {"-1"}; // Lỗi cú pháp

    for (auto p : positions) {
        groups.push_back(expr.substr(p.first, p.second - p.first + 1));
    }

    return groups;
}

int main() {
    ifstream infile("CUM.INP");
    ofstream outfile("CUM.OUT");

    if (!infile || !outfile) {
        return 1; // Lỗi mở file
    }

    string line;
    getline(infile, line);
    infile.close();

    vector<string> groups = extractGroups(line);

    if (groups[0] == "-1") {
        outfile << "-1" << endl; // Lỗi cú pháp
    } else {
        outfile << groups.size() << endl;
        for (const auto &g : groups) {
            outfile << g << endl;
        }
    }

    outfile.close();
    return 0;
}