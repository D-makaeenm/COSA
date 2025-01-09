import React from "react";
import styles from "./Form.module.css"
import axios from "axios";

function Student() {

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

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
            alert(response.data.message || "Admin account created successfully!");
            e.target.reset();
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
                        </div>

                        <div className={styles.form_right}>
                            <label htmlFor="name">Họ và tên</label>
                            <input id="name" name="name" type="text" placeholder="Nhập Họ tên" required />

                            <label htmlFor="phone">Khoa</label>
                            <input
                                id="department"
                                name="department"
                                type="text"
                                placeholder="Nhập tên Khoa"
                                required
                            />

                            <label htmlFor="class">Lớp</label>
                            <input
                                id="student_class"
                                name="student_class"
                                type="text"
                                placeholder="Nhập tên Lớp"
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

export default Student;