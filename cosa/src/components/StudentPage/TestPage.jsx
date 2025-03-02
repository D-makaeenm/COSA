import React, { useState, useEffect } from "react";
import Navbar from "../LoginPage/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./TestPage.module.css";
import axios from "axios";
import Swal from "sweetalert2";

function TestPage() {
    const [userInfo, setUserInfo] = useState({ username: "", name: "" });
    const [currentScore, setCurrentScore] = useState(
        localStorage.getItem("currentScore") !== null
            ? parseInt(localStorage.getItem("currentScore"))
            : null
    );
    const [isLoadingScore, setIsLoadingScore] = useState(false);

    const [remainingTime, setRemainingTime] = useState(
        parseInt(localStorage.getItem("remainingTime")) || 0
    );

    const updateScore = (score) => {
        setCurrentScore(score);
        localStorage.setItem("currentScore", score);
        showAlert(score);
        setIsLoadingScore(false);
    };

    const setLoadingScore = (loading) => {
        setIsLoadingScore(loading);
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                const username = localStorage.getItem("username");

                if (!username) {
                    throw new Error("Username is not found in localStorage");
                }

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

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("remainingTime");
        localStorage.removeItem("currentScore");
        window.location.href = "/login";
    };

    const location = useLocation();

    useEffect(() => {
        if (location.state?.remainingTime) {
            setRemainingTime(location.state.remainingTime);
            localStorage.setItem("remainingTime", location.state.remainingTime);
        }
    }, [location.state?.remainingTime]);

    useEffect(() => {
        if (remainingTime > 0 && currentScore === null) {
            const timer = setInterval(() => {
                setRemainingTime((prev) => {
                    const newTime = prev - 1;
                    localStorage.setItem("remainingTime", newTime);
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [remainingTime, currentScore]);

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes} phút ${seconds < 10 ? `0${seconds}` : seconds} giây`;
    };

    const showAlert = (score) => {
        Swal.fire({
            title: "Thông báo!",
            text: `Bạn đã hoàn thành bài thi với ${score} điểm`,
            icon: "success",
            confirmButtonText: "OK",
        });
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.test}>
                <div className={styles.bd_exam}>
                    <Outlet
                        context={{
                            remainingTime,
                            updateScore,
                            setLoadingScore,
                        }}
                    />
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
                        <div className={styles.timeout}>
                            <p>Thời gian còn lại</p>
                            <p>{formatTime(remainingTime)}</p>
                        </div>
                        <div className={styles.score}>
                            {isLoadingScore ? (
                                <p>Đang chấm...</p>
                            ) : (
                                <p>Điểm hiện tại: {currentScore !== null ? currentScore : "Chưa có"}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestPage;
