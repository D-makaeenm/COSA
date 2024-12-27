import React from "react";
import axios from "axios";
import styles from "./Login.module.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Rule from "./Rule";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await axios.post("http://127.0.0.1:5000/auth/login", {
                username,
                password,
            });
            const token = response.data.access_token; // Lấy token từ phản hồi
            localStorage.setItem("token", token); // Lưu token vào localStorage
            alert("Login successful");
            navigate("/test");
        } catch (error) {
            alert(error.response?.data?.error || "Invalid credentials");
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.body_lg}>
                <div className={styles.bd_inf}>
                    <div className={styles.bd_inf_slg}>
                        <p>Cuộc thi Olympic Tin học</p>
                    </div>
                    <Rule />
                </div>
                <div className={styles.bd_lg_form}>
                    <form className={styles.login_form} onSubmit={handleLogin}>
                        <p className={styles.lg_form_title}>Đăng nhập tài khoản</p>
                        <div className={styles.lg_form_input_container}>
                            <input type="text" name="username" placeholder="Tài Khoản" />
                        </div>
                        <div className={styles.lg_form_input_container}>
                            <input type="password" name="password" placeholder="Mật Khẩu" />
                        </div>
                        <button type="submit" className={styles.lg_form_submit}>
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LoginPage;
