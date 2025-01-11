import React from "react";
import styles from "./Form.module.css";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

function Teacher() {
    const { fetchAccountCounts } = useOutletContext(); // Lấy context từ Outlet

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await axios.post(
                "http://localhost:5000/auth/register-teacher", // Địa chỉ endpoint backend
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            // Xử lý thành công
            alert(response.data.message || "Teacher account created successfully!");
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
            <h3>Cấp phát tài khoản giáo viên</h3>
            <div className={styles.divform}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_container}>
                        <div className={styles.form_left}>
                            <label htmlFor="username">Username</label>
                            <input id="username" name="username" type="text" placeholder="Username" required />

                            <label htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" placeholder="Password" required />
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
                                required
                            />

                            <label htmlFor="department">Khoa</label>
                            <input
                                id="department"
                                name="department"
                                type="text"
                                placeholder="Nhập tên Khoa"
                                required
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

export default Teacher;
