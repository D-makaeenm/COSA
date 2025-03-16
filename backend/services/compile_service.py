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

def compile_and_run_cpp(code):
    if not code.strip():
        return {"error": "Code không được để trống", "output": None}

    try:
        # ✅ Tạo thư mục làm việc tạm thời
        temp_work_dir = tempfile.mkdtemp()

        # ✅ Tìm các file input và output trong code thí sinh
        input_files, output_files = extract_filenames_from_code(code)

        if not input_files:
            return {"error": "Không tìm thấy file input (.INP) trong code", "output": None}

        # ✅ Copy từng file input vào thư mục tạm
        for inp_file in input_files:
            source_path = os.path.join(UPLOADS_FOLDER, inp_file)
            temp_input_path = os.path.join(temp_work_dir, inp_file)

            if os.path.exists(source_path):
                shutil.copy(source_path, temp_input_path)
            else:
                return {"error": f"File input '{inp_file}' không tồn tại.", "output": None}

        # ✅ Lưu code thí sinh vào file trong thư mục tạm
        temp_cpp_path = os.path.join(temp_work_dir, "solution.cpp")
        with open(temp_cpp_path, "w", encoding="utf-8") as temp_cpp:
            temp_cpp.write(code)

        executable_path = os.path.join(temp_work_dir, "solution")

        # ✅ Biên dịch code C++ (chạy trong thư mục tạm)
        compile_result = subprocess.run(
            ["g++", "-o", executable_path, temp_cpp_path],
            capture_output=True,
            text=True,
            cwd=temp_work_dir  # Chạy trong thư mục tạm
        )

        if compile_result.returncode != 0:
            return {"error": compile_result.stderr.strip(), "output": None}

        # ✅ Chạy chương trình với thư mục làm việc tạm thời
        run_result = subprocess.run(
            [executable_path],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=temp_work_dir  # Đảm bảo chương trình tìm thấy file input
        )

        error = run_result.stderr.strip()

        # ✅ Đọc output từ các file .OUT nếu tồn tại
        output_data = {}
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
        try:
            shutil.rmtree(temp_work_dir)
        except Exception as cleanup_error:
            print(f"Lỗi khi xóa thư mục tạm: {cleanup_error}")  # Ghi log nếu cần
