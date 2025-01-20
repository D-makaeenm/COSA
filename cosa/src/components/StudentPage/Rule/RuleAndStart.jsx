import React, { useState, useEffect } from "react";
import Rules from "../../LoginPage/Rule";
import styles from "../TestPage.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RuleAndStart() {
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const fetchUserInfoAndExam = async () => {
            try {
                const token = localStorage.getItem("token");

                // Lấy thông tin cuộc thi đang diễn ra
                const examResponse = await axios.get(
                    "http://127.0.0.1:5000/student/ongoing-exam",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setExam(examResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setExam(null); // Không có cuộc thi nào đang diễn ra
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
        navigate(`exam/${exam.id}/questions`);
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