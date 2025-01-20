import React, { useState } from "react";
import styles from "./Login.module.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import pythonlogo from "../../assets/images/logopython.png";
import logo from "../../assets/images/logo.png";

function LoginPage() {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            // Gửi yêu cầu đăng nhập
            const response = await axios.post("http://127.0.0.1:5000/auth/login", {
                username,
                password,
            });

            const token = response.data.access_token;
            const role = response.data.role;
            const id = response.data.id;

            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("role", role);
            localStorage.setItem("id", id);

            setLoginError("");

            if (role === "admin") {
                navigate("/admin");
            } else if (role === "student") {
                navigate("/student");
            } else if (role === "teacher") {
                navigate("/teacher");
            }
        } catch (error) {
            setLoginError(error.response?.data?.error || "Sai tài khoản hoặc mật khẩu");
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.login_area}>
                <div className={styles.card}>
                    <div className={styles.trai}>
                        <div className={styles.title}>
                            <p className={styles.p1}>Olympic Tin học</p>
                            <p className={styles.p2}>khối không chuyên</p>
                            <p className={styles.p3}>sử dụng ngôn ngữ</p>
                        </div>
                        <div className={styles.logo}>
                            <img src={pythonlogo} alt="logo.jpg" />
                            <p>python</p>
                        </div>
                    </div>
                    <div className={styles.phai}>
                        <form className={styles.login_form} onSubmit={handleLogin}>
                            <div className={styles.header_form}>
                                <img src={logo} alt="logo" />
                                <p>TNUT</p>
                            </div>
                            <p className={styles.lg_form_title}>Đăng nhập</p>
                            <div className={styles.lg_form_input_container}>
                                <input type="text" name="username" placeholder="Tài Khoản" />
                                <input type="password" name="password" placeholder="Mật Khẩu" />
                            </div>
                            <button type="submit" className={styles.lg_form_submit}>
                                Sign in
                            </button>
                            <div className={styles.statusLogin}>
                                <span style={{ display: loginError ? "block" : "none", color: "red" }}>
                                    {loginError}
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LoginPage;
