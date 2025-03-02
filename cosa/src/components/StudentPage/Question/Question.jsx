import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Questions.module.css";

function Questions() {
    const { examId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [examInfo, setExamInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:5000/student/exam/${examId}/questions`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setExamInfo(response.data.exam || {});
                setQuestions(response.data.tasks || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Không thể tải danh sách câu hỏi.");
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [examId]);

    const handleSelectQuestion = (questionId) => {
        navigate(`${questionId}`);
    };

    // Hàm xử lý thời gian
    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const calculateTotalMinutes = (start, end) => {
        const [hStart, mStart] = formatTime(start).split(":").map(Number);
        const [hEnd, mEnd] = formatTime(end).split(":").map(Number);

        return (hEnd - hStart) * 60 + (mEnd - mStart);
    };

    if (loading) {
        return (
            <div className={styles.questions}>
                <div>
                    <h1>Danh sách bài tập</h1>
                </div>
                <p>Đang tải danh sách câu hỏi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.questions}>
                <div>
                    <h1>Danh sách bài tập</h1>
                </div>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.questions}>
            <div className={styles.container}>
                <div>
                    <h1>Danh sách bài tập</h1>
                </div>
                {examInfo && (
                    <div className={styles.time}>
                        <p>Thời gian bắt đầu: {examInfo.start_time}</p>
                        <p>Thời gian kết thúc: {examInfo.end_time}</p>
                        <p>
                            Tổng thời gian:{" "}
                            {calculateTotalMinutes(
                                examInfo.start_time,
                                examInfo.end_time
                            )}{" "}
                            phút
                        </p>
                    </div>
                )}
                {questions.map((question) => (
                    <div
                        key={question.id}
                        className={styles.questionsItem}
                        onClick={() => handleSelectQuestion(question.id)}
                    >
                        <div className={styles.truoc}>
                            <h3>{question.task_title}</h3>
                            <p>{question.task_description}</p>
                        </div>
                        <div className={styles.sau}>
                            <p>Điểm tối đa: {question.max_score}</p>
                            <p>
                                Giới hạn thời gian chạy:{" "}
                                {question.execution_time_limit}s
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Questions;
