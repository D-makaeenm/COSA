import React, { useState, useEffect } from "react";
import Navbar from "../LoginPage/Navbar";
import Footer from "../LoginPage/Footer";
import styles from "./TestPage.module.css";

function TestPage() {
    const [username, setUsername] = useState(""); // State để lưu username

    // Lấy username từ localStorage khi component được render
    useEffect(() => {
        const storedUsername = localStorage.getItem("username"); // Lấy từ localStorage
        if (storedUsername) {
            setUsername(storedUsername); // Cập nhật state username
        }
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("username"); // Xóa username khỏi localStorage
        localStorage.removeItem("token"); // Xóa token nếu có
        window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.test}>
                <div className={styles.bd_exam}>
                    exam here
                </div>
                <div className={styles.bd_inf_user}>
                    <div className={styles.bd_inf_user_card}>
                        <p className={styles.p}>Thông tin tài khoản</p>
                        <div className={styles.username}>
                            <p>Xin chào {username}</p>
                        </div>
                        <button onClick={handleLogout} className={styles.logout}>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default TestPage;
