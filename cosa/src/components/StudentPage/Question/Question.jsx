import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Questions.module.css";
import config from "../../../config";

function Questions() {
    const { examId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [examInfo, setExamInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestionsWithSubmissionStatus = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch danh sách câu hỏi
                const response = await axios.get(
                    `${config.apiBaseUrl}/student/exam/${examId}/questions`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const examData = response.data.exam || {};
                const tasks = response.data.tasks || [];

                // Gọi API từng câu hỏi để lấy is_submitted
                const tasksWithSubmission = await Promise.all(
                    tasks.map(async (task) => {
                        try {
                            const questionRes = await axios.get(
                                `${config.apiBaseUrl}/student/exam/${examId}/question/${task.id}`,
                                {
                                    headers: { Authorization: `Bearer ${token}` },
                                }
                            );
                            return {
                                ...task,
                                is_submitted: questionRes.data.is_submitted,
                            };
                        } catch (err) {
                            console.error(`Error fetching question ${task.id}:`, err);
                            return { ...task, is_submitted: false }; // fallback nếu lỗi
                        }
                    })
                );

                setExamInfo(examData);
                setQuestions(tasksWithSubmission);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Không thể tải danh sách câu hỏi.");
                setLoading(false);
            }
        };

        fetchQuestionsWithSubmissionStatus();
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
                            {calculateTotalMinutes(examInfo.start_time, examInfo.end_time)} phút
                        </p>
                    </div>
                )}

                {/* Đánh dấu câu nào đã nộp */}
                {questions.map((question) => (
                    <div
                        key={question.id}
                        className={`${styles.questionsItem} ${question.is_submitted ? styles.done : ''}`}
                        onClick={() => handleSelectQuestion(question.id)}
                    >
                        <div className={styles.truoc}>
                            <h3>{question.task_title}</h3>
                            <p>{question.task_description}</p>
                        </div>
                        <div className={styles.sau}>
                            <p>Điểm tối đa: {question.max_score}</p>
                            <p>Giới hạn thời gian chạy: {question.execution_time_limit}s</p>
                            {question.is_submitted && <p className={styles.submitted}>Đã nộp</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Questions;
