import subprocess
import tempfile
import os
import shutil
import re

UPLOADS_FOLDER = os.path.abspath("uploads/testcases")

def extract_filenames_from_code(code):
    """Tìm tên file .INP và .OUT trong code thí sinh."""
    input_pattern = r'ifstream\s+\w+\("([^"]+\.INP)"\);'
    output_pattern = r'ofstream\s+\w+\("([^"]+\.OUT)"\);'

    input_files = re.findall(input_pattern, code)
    output_files = re.findall(output_pattern, code)

    return input_files, output_files

def find_test1_input_paths():
    """Tìm tất cả các file .INP nằm trong thư mục có 'Test1'."""
    test1_input_files = {}

    for root, _, files in os.walk(UPLOADS_FOLDER):
        if "Test1" in root:  # Chỉ lấy thư mục chứa "Test1"
            for file in files:
                if file.endswith(".INP"):
                    test1_input_files[file] = os.path.join(root, file)

    return test1_input_files

def compile_and_run_cpp(code):
    if not code.strip():
        return {"error": "Code không được để trống", "output": None}

    temp_work_dir = None  

    try:
        # ✅ Tạo thư mục làm việc tạm thời
        temp_work_dir = tempfile.mkdtemp()

        # ✅ Tìm các file input và output trong code thí sinh
        input_files, output_files = extract_filenames_from_code(code)

        if not input_files:
            return {"error": "Không tìm thấy file input (.INP) trong code", "output": None}

        # ✅ Tìm các đường dẫn của file input trong thư mục "Test1"
        test1_input_paths = find_test1_input_paths()

        # ✅ Copy từng file input vào thư mục tạm
        for inp_file in input_files:
            if inp_file in test1_input_paths:
                source_path = test1_input_paths[inp_file]
                temp_input_path = os.path.join(temp_work_dir, inp_file)
                shutil.copy(source_path, temp_input_path)
            else:
                return {"error": f"File input '{inp_file}' không tồn tại trong thư mục Test1.", "output": None}

        # ✅ Lưu code thí sinh vào file trong thư mục tạm
        temp_cpp_path = os.path.join(temp_work_dir, "solution.cpp")
        with open(temp_cpp_path, "w", encoding="utf-8") as temp_cpp:
            temp_cpp.write(code)

        executable_path = os.path.join(temp_work_dir, "solution")

        # ✅ Biên dịch code C++
        compile_result = subprocess.run(
            ["g++", "-o", executable_path, temp_cpp_path],
            capture_output=True,
            text=True,
            cwd=temp_work_dir
        )

        if compile_result.returncode != 0:
            return {"error": compile_result.stderr.strip(), "output": None}

        # ✅ Chạy chương trình với thư mục làm việc tạm thời
        run_result = subprocess.run(
            [executable_path],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=temp_work_dir
        )

        error = run_result.stderr.strip()

        # ✅ Đọc output từ các file .OUT
        output_data = {}

        if not output_files:
            output_files = [f for f in os.listdir(temp_work_dir) if f.endswith(".OUT")]

        for out_file in output_files:
            temp_output_path = os.path.join(temp_work_dir, out_file)
            if os.path.exists(temp_output_path):
                with open(temp_output_path, "r") as fout:
                    output_data[out_file] = fout.read().strip()
            else:
                output_data[out_file] = "Không có output"

        return {
            "error": error if error else None,
            "output": output_data
        }

    except subprocess.TimeoutExpired:
        return {"error": "Chương trình chạy quá lâu và bị dừng.", "output": None}

    except Exception as e:
        return {"error": f"Lỗi hệ thống: {str(e)}", "output": None}

    finally:
        # ✅ Dọn dẹp thư mục làm việc tạm
        if temp_work_dir:
            try:
                shutil.rmtree(temp_work_dir)
            except Exception as cleanup_error:
                print(f"Lỗi khi xóa thư mục tạm: {cleanup_error}")  
