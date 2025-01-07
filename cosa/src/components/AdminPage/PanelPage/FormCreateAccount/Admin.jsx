import React from "react";
import styles from "./Form.module.css";

function Admin() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Lấy dữ liệu từ form
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Xử lý hoặc gửi dữ liệu đến server
        console.log("Form Data:", data);
    };

    return (
        <div className={styles.div_create_account}>
            <h3>Cấp phát tài khoản admin</h3>
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
                            <input id="name" name="name" type="text" required />

                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                pattern="^\d{10,15}$"
                                placeholder="Nhập số điện thoại (10-15 số)"
                                required
                            />

                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@domain.com"
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

export default Admin;
