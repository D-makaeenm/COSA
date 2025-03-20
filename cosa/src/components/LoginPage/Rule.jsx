import React from "react";
import styles from "./Rule.module.css";


function Rules() {
    return (
        <div className={styles.bd_inf_rules}>
            <h2>Thể lệ và quy định</h2>
            <div>
                <ul>
                    <p>Nội dung</p>
                    <ol>
                        <li>Hình thức thi: Cá nhân thực hiện lập trình trên máy tính với ngôn ngữ C++</li>
                        <li>Đề thi: Do Ban tổ chức cung cấp</li>
                    </ol>
                    <p>Quy định</p>
                    <ol>
                        <li>Về thiết bị và phần mềm:</li>
                        <ul>
                            <li>Ban tổ chức cung cấp máy tính cài đặt môi trường lập trình.</li>
                            <li>Thí sinh thi không được phép mang theo tài liệu, thiết bị hỗ trợ (điện thoại, máy tính bảng, USB, v.v.).</li>
                        </ul>
                        <li>Về bài thi</li>
                        <ul>
                            <li>Thí sinh thi phải nộp bài trực tiếp qua hệ thống chấm tự động của ban tổ chức.</li>
                            <li>Mỗi bài thi được chấm điểm theo số lượng test case đúng.</li>
                            <li>Kết quả cuối cùng được tính dựa trên tổng điểm và thời gian hoàn thành.</li>
                        </ul>
                        <li>Về hành vi ứng xử:</li>
                        <ul>
                            <li>Tuyệt đối tuân thủ hướng dẫn của ban tổ chức.</li>
                            <li>Không gian lận, sao chép bài làm của thí sinh khác.</li>
                            <li>Thí sinh vi phạm sẽ bị loại khỏi cuộc thi.</li>
                        </ul>
                    </ol>
                </ul>
            </div>
        </div>
    );
}

export default Rules;
