import React, { useState, useEffect } from "react";
import Rules from "../../LoginPage/Rule";
import styles from "../TestPage.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config"

function RuleAndStart() {
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [remainingTime, setRemainingTime] = useState(
        parseInt(localStorage.getItem("remainingTime")) || 0
    );
    

    useEffect(() => {
        const fetchUserInfoAndExam = async () => {
            try {
                const token = localStorage.getItem("token");

                const examResponse = await axios.get(
                    `${config.apiBaseUrl}/student/ongoing-exam`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setExam(examResponse.data);

                if (!localStorage.getItem("remainingTime")) {
                    const durationInMinutes = examResponse.data.duration; // API trả về phút
                    const totalSeconds = durationInMinutes * 60; // Chuyển phút sang giây
                    setRemainingTime(totalSeconds);
                    localStorage.setItem("remainingTime", totalSeconds); // ✅ Lưu vào localStorage
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setExam(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfoAndExam();
    }, []);

    const handleStartExam = () => {
        if (!exam) {
            alert("Không có cuộc thi nào đang diễn ra!");
            return;
        }
    
        const startTimestamp = Date.now(); // ✅ Lưu timestamp khi bắt đầu
        localStorage.setItem("startTimestamp", startTimestamp);
    
        navigate(`exam/${exam.id}/questions`, {
            state: { remainingTime, startTimestamp }, // ✅ Truyền timestamp qua state
        });
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div>
            <Rules />
            <div className={styles.btnstart}>
                <div onClick={handleStartExam}>Bắt đầu</div>
            </div>
        </div>
    );
}

export default RuleAndStart;
