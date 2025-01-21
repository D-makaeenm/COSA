import React, { useState, useEffect } from "react";
import Navbar from "../LoginPage/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./TestPage.module.css";
import axios from "axios";

function TestPage() {
    const [userInfo, setUserInfo] = useState({ username: "", name: "" });

    useEffect(() => {
        const fetchUserInfoAndExam = async () => {
            try {
                const token = localStorage.getItem("token");
                const username = localStorage.getItem("username");

                if (!username) {
                    throw new Error("Username is not found in localStorage");
                }

                // Lấy thông tin người dùng
                const userResponse = await axios.post(
                    "http://127.0.0.1:5000/user/get_username",
                    { username },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setUserInfo(userResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchUserInfoAndExam();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const location = useLocation();
    const [remainingTime, setRemainingTime] = useState(
        location.state?.remainingTime || 0
    );

    useEffect(() => {
        // Khi `location.state.remainingTime` thay đổi, cập nhật ngay
        if (location.state?.remainingTime) {
            setRemainingTime(location.state.remainingTime);
        }
    }, [location.state?.remainingTime]);

    useEffect(() => {
        if (remainingTime > 0) {
            const timer = setInterval(() => {
                setRemainingTime((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [remainingTime]);

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes} phút ${seconds < 10 ? `0${seconds}` : seconds} giây`;
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.test}>
                <div className={styles.bd_exam}>
                    <Outlet context={{ remainingTime }} />
                </div>
                <div className={styles.bd_inf_user}>
                    <div className={styles.bd_inf_user_card}>
                        <p className={styles.p}>Thông tin tài khoản</p>
                        <div className={styles.username}>
                            <p>Xin chào {userInfo.name}</p>
                        </div>
                        <button onClick={handleLogout} className={styles.logout}>
                            Đăng xuất
                        </button>
                    </div>
                    <div className={styles.afterStart}>
                        <div className={styles.btnback}>Trở lại câu hỏi</div>
                        <div className={styles.timeout}>
                            <p>Thời gian còn lại</p>
                            <p>{formatTime(remainingTime)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestPage;
