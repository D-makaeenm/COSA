import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../LoginPage/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./TestPage.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../../../src/config"

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

    const navigate = useNavigate();
    const location = useLocation();

    const updateScore = (score) => {
        setCurrentScore(score);
        localStorage.setItem("currentScore", score);
        console.log(score)
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
                    `${config.apiBaseUrl}/user/get_username`,
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
        localStorage.removeItem("examId"); // ✅ Xóa luôn examId khi đăng xuất
        window.location.href = "/login";
    };

    useEffect(() => {
        if (location.state?.remainingTime) {
            setRemainingTime(location.state.remainingTime);
            localStorage.setItem("remainingTime", location.state.remainingTime); // ✅ Giữ thời gian khi back lại
        }
    }, [location.state?.remainingTime]);

    const handleAutoSubmitExam = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const examId = localStorage.getItem("examId");
            const userId = localStorage.getItem("id");
    
            if (!examId || !token || !userId) {
                console.error("Exam ID, User ID hoặc Token bị thiếu.");
                return;
            }
    
            // ✅ Lấy danh sách tất cả task của kỳ thi
            const examTasksResponse = await axios.get(
                `${config.apiBaseUrl}/student/exam/${examId}/questions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            // console.log("examTasksResponse.data:", examTasksResponse.data);
    
            // ✅ Kiểm tra nếu API trả về object chứa danh sách tasks
            const examTasks = Array.isArray(examTasksResponse.data.tasks)
                ? examTasksResponse.data.tasks
                : [];
    
            // console.log("Danh sách bài tập:", examTasks);
    
            const submittedTasks = new Set();
    
            // ✅ Lấy danh sách bài đã nộp
            const submissionResponse = await axios.get(
                `${config.apiBaseUrl}/student/exam/${examId}/submitted-tasks/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            // console.log("submittedTasksResponse.data:", submissionResponse.data);
    
            submissionResponse.data.forEach((task) => {
                submittedTasks.add(task.task_id);
            });
    
            // ✅ Nộp các bài chưa nộp
            for (const task of examTasks) {
                if (!submittedTasks.has(task.id)) {
                    const savedCode = localStorage.getItem(`task_${task.id}_code`);
    
                    await axios.post(
                        `${config.apiBaseUrl}/student/exam/${examId}/question/${task.id}/submit`,
                        { user_id: userId, code: savedCode || "" },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
    
                    localStorage.removeItem(`task_${task.id}_code`);
                }
            }
    
            Swal.fire({
                title: "Hết thời gian!",
                text: "Bài thi đã được nộp tự động.",
                icon: "info",
                confirmButtonText: "OK"
            });
    
            navigate(`/student/start/exam/${examId}/questions`);
        } catch (error) {
            console.error("Lỗi khi nộp bài tự động:", error);
        }
    }, [navigate]);

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

        if (remainingTime === 0) {
            handleAutoSubmitExam();
        }
    }, [remainingTime, currentScore, handleAutoSubmitExam]);
    
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
                        {isLoadingScore ? <p>Đang cập nhật điểm...</p> : <p>Điểm của bạn là: {currentScore}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestPage;
