import React, { useState, useEffect } from "react";
import logos from "../../assets/images/logo.png";
import styles from "./AdminPage.module.css";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";

function AdminPage() {
    const [username, setUsername] = useState("");

    // Lấy username từ localStorage khi component được render
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Hàm xử lý logout
    const handleLogout = () => {
        localStorage.removeItem("username"); // Xóa username khỏi localStorage
        localStorage.removeItem("token"); // Xóa token nếu có
        window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainpage}>
                <SideBar/>
                <div className={styles.main}>
                    <nav className={styles.admin_navbar}>
                        <div className={styles.logo}>
                            <img src={logos} alt="logo.jpg" />
                        </div>
                        <div className={styles.slogan}>
                            <p>ĐẠI HỌC KỸ THUẬT CÔNG NGHIỆP THÁI NGUYÊN</p>
                        </div>
                        <div className={styles.username}>
                            <p>Xin chào {username}</p>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </nav>
                    <Outlet />
                </div>
                
            </div>
        </div>
    );
}

export default AdminPage;
