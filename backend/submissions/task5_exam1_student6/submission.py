import re

def extract_clusters(expression):
    stack = []
    clusters = []
    for i, char in enumerate(expression):
        if char == "(":
            stack.append(i)
        elif char == ")":
            if stack:
                start = stack.pop()
                clusters.append(expression[start:i+1])
            else:
                return -1
    if stack:
        return -1
    return clusters

with open("CUM.INP", "r", encoding="utf-8") as f:
    lines = f.readlines()

num_testcases = int(lines[0].strip())
testcases = [line.strip() for line in lines[1:num_testcases+1]]

with open("CUM.OUT", "w", encoding="utf-8") as f:
    f.write(str(num_testcases) + "\n")
    for testcase in testcases:
        clusters = extract_clusters(testcase)
        if clusters == -1:
            f.write("-1\n")
        else:
            f.write(str(len(clusters)) + "\n")
            for cluster in clusters:
                f.write(cluster + "\n")