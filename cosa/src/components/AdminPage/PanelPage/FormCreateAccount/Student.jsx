import React, { useEffect, useState } from "react";
import styles from "./Form.module.css";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

function Student() {
    const { fetchAccountCounts } = useOutletContext(); // Lấy context từ Outlet
    const [contests, setContests] = useState([]); // Lưu danh sách cuộc thi
    const [examId, setExamId] = useState(""); // Lưu trạng thái lựa chọn cuộc thi

    // Fetch danh sách các cuộc thi
    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/management/exams", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContests(response.data.data); // Gán dữ liệu từ API
            } catch (error) {
                console.error("Lỗi khi lấy danh sách cuộc thi:", error);
            }
        };

        fetchContests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.exam_id = examId; // Gắn exam_id vào dữ liệu gửi đi

        try {
            const response = await axios.post(
                "http://localhost:5000/auth/register-student", // Địa chỉ endpoint backend
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            // Xử lý thành công
            alert(response.data.message || "Student account created successfully!");
            e.target.reset();

            // Gọi lại fetchAccountCounts để cập nhật số lượng tài khoản
            await fetchAccountCounts();
        } catch (error) {
            // Xử lý lỗi
            const errorMessage =
                error.response?.data?.error || "Something went wrong. Please try again.";
            alert(errorMessage);
        }
    };

    return (
        <div className={styles.div_create_account}>
            <h3>Cấp phát tài khoản thí sinh</h3>
            <div className={styles.divform}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_container}>
                        <div className={styles.form_left}>
                            <label htmlFor="username">Username</label>
                            <input id="username" name="username" type="text" placeholder="Username" required />

                            <label htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" placeholder="Password" required />

                            <label htmlFor="contest">Cuộc thi</label>
                            <select
                                id="contest"
                                name="exam_id"
                                value={examId}
                                onChange={(e) => setExamId(e.target.value)}
                                required
                            >
                                <option value="">Chọn cuộc thi</option>
                                {contests.map((contest) => (
                                    <option key={contest.id} value={contest.id}>
                                        {contest.title} ({contest.status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.form_right}>
                            <label htmlFor="name">Họ và tên</label>
                            <input id="name" name="name" type="text" placeholder="Nhập Họ tên" required />

                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                pattern="^\d{10,15}$"
                                placeholder="Nhập số điện thoại (10-15 số)"
                                
                            />

                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@domain.com"
                            
                            />
                        </div>
                    </div>
                    <div className={styles.button_container}>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Student;
