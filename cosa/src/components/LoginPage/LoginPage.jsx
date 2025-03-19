import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import pythonlogo from "../../assets/images/logopython.png";
import logo from "../../assets/images/logo.png";
import config from "../../config.js";

function LoginPage() {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState("");

    // 🛑 Chặn quay lại màn hình đăng nhập nếu đã đăng nhập
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token) {
            // Nếu đã đăng nhập, điều hướng đến trang phù hợp
            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else if (role === "student") {
                navigate("/student", { replace: true });
            } else if (role === "teacher") {
                navigate("/teacher", { replace: true });
            }
        }

        // 🛑 Chặn quay lại trang đăng nhập
        window.history.replaceState(null, "", window.location.href);
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await axios.post(`${config.apiBaseUrl}/auth/login`, { username, password });

            const token = response.data.access_token;
            const role = response.data.role;
            const id = response.data.id;

            // Lưu thông tin đăng nhập vào localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("role", role);
            localStorage.setItem("id", id);

            console.log(token, username, role, id);
            setLoginError("");

            // Chuyển hướng dựa vào vai trò của người dùng
            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else if (role === "student") {
                navigate("/student", { replace: true });
            } else if (role === "teacher") {
                navigate("/teacher", { replace: true });
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
                                <input type="text" name="username" placeholder="Tài Khoản" required />
                                <input type="password" name="password" placeholder="Mật Khẩu" required />
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
