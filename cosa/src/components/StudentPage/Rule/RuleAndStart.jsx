import React, { useState, useEffect } from "react";
import Rules from "../../LoginPage/Rule";
import styles from "../TestPage.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RuleAndStart() {
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        const fetchUserInfoAndExam = async () => {
            try {
                const token = localStorage.getItem("token");

                const examResponse = await axios.get(
                    "http://127.0.0.1:5000/student/ongoing-exam",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setExam(examResponse.data);

                const startTime = new Date(examResponse.data.start_time);
                const endTime = new Date(examResponse.data.end_time);
                const totalSeconds = Math.max((endTime - startTime) / 1000, 0);

                setRemainingTime(totalSeconds);
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

        navigate(`exam/${exam.id}/questions`, {
            state: { remainingTime }, // Truyền thời gian qua state
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
