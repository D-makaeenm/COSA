from docx import Document
from bs4 import BeautifulSoup
import re

def convert_to_math_unicode(text):
    math_alphabet = {
        "a": "𝑎", "b": "𝑏", "c": "𝑐", "d": "𝑑", "e": "𝑒", "f": "𝑓",
        "g": "𝑔", "h": "ℎ", "i": "𝑖", "j": "𝑗", "k": "𝑘", "l": "𝑙",
        "m": "𝑚", "n": "𝑛", "o": "𝑜", "p": "𝑝", "q": "𝑞", "r": "𝑟",
        "s": "𝑠", "t": "𝑡", "u": "𝑢", "v": "𝑣", "w": "𝑤", "x": "𝑥",
        "y": "𝑦", "z": "𝑧"
    }
    
    subscripts = {
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        "n": "ₙ"
    }

    return re.sub(r'([a-z])_([0-9n])', lambda m: f"{math_alphabet.get(m.group(1), m.group(1))}{subscripts.get(m.group(2), m.group(2))}", text)

def extract_and_convert_docx(file_path):
    doc = Document(file_path)
    full_text = "\n".join([p.text for p in doc.paragraphs])
    
    # Chuyển đổi ký tự toán học
    converted_text = convert_to_math_unicode(full_text)

    # Đưa vào HTML để hiển thị trên web
    soup = BeautifulSoup(f"<p>{converted_text}</p>", "html.parser")
    return str(soup)

# Lưu HTML vào file để gửi đến React
output_html = extract_and_convert_docx("C:/Users/Admin/Downloads/Dethi_olimpic_SVLan1_Final.docx")
with open("output.html", "w", encoding="utf-8") as f:
    f.write(output_html)
