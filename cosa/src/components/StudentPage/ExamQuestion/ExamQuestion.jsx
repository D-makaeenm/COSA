import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import styles from "./ExamQuestion.module.css";
import Swal from "sweetalert2";

function ExamQuestion() {
    const { examId, questionId } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [code, setCode] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { updateScore, setLoadingScore } = useOutletContext();

    const backendUrl = "http://localhost:5000";

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${backendUrl}/student/exam/${examId}/question/${questionId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setQuestion(response.data);
                setCode(response.data.submitted_code || "");
                setIsSubmitted(response.data.is_submitted);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching question:", err);
                setError("Không thể tải câu hỏi.");
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [examId, questionId, backendUrl]);

    const handleCodeSubmit = async () => {
        if (isSubmitting) return; // Nếu đang gửi bài, không cho phép gửi tiếp

        setIsSubmitting(true); // Đánh dấu đang gửi bài
        try {
            const token = localStorage.getItem("token");
            const studentId = localStorage.getItem("id");

            const payload = {
                contest_id: examId,
                student_id: studentId,
                problem_id: questionId,
                code: encodeURIComponent(code),
            };

            const response = await axios.post(`${backendUrl}/submission/submit`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status !== 200 || !response.data || !response.data.submission_id) {
                throw new Error("Bài làm không được lưu. Vui lòng thử lại.");
            }

            const submissionId = response.data.submission_id;
            console.log(`✅ Bài đã lưu: Submission ID = ${submissionId}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));
            let graded = false;

            for (let i = 0; i < 5; i++) {  // Thử kiểm tra tối đa 5 lần (15 giây)
                const checkResponse = await axios.get(
                    `${backendUrl}/submission/status/${submissionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (checkResponse.data.is_graded) {
                    graded = true;
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 3000)); // Chờ tiếp 3 giây
            }

            if (!graded) {
                console.warn("⚠️ Bài đã lưu nhưng chưa chấm điểm. Có thể backend xử lý chậm.");
            }

            showAlert();
            setIsSubmitted(true);

            // Kiểm tra xem thí sinh đã nộp hết bài chưa
            const submissionCheck = await axios.get(
                `${backendUrl}/submission/check_all_submitted/${examId}/${studentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (submissionCheck.data.all_submitted) {
                setLoadingScore(true);
                const interval = setInterval(async () => {
                    try {
                        const result = await axios.get(
                            `${backendUrl}/submission/final_score/${examId}/${studentId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (result.data.score !== null) {
                            clearInterval(interval);
                            updateScore(result.data.score);
                        }
                    } catch (error) {
                        console.error("Lỗi khi lấy điểm tổng:", error);
                        clearInterval(interval);
                        alert("Có lỗi xảy ra khi lấy điểm tổng.");
                    }
                }, 3000);
            }

            navigate(`/student/start/exam/${examId}/questions`);
        } catch (err) {
            console.error("Error submitting code:", err);
            alert("Có lỗi xảy ra khi nộp bài. Bài làm không được lưu.");
        } finally {
            setIsSubmitting(false); // Cho phép nộp bài lại nếu cần
        }
    };

    const showAlert = () => {
        Swal.fire({
            title: "Thông báo!",
            text: "Nộp bài thành công!",
            icon: "success",
            confirmButtonText: "OK",
            timer: 1500,
        });
    };

    if (loading) {
        return <p>Đang tải câu hỏi...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className={styles.questions}>
            <div className={styles.container}>
                <div>
                    <h2>{question?.task_title}</h2>
                    {question?.image_url && (
                        <img
                            src={question.image_url}
                            alt="Hình minh họa"
                            className={styles.questionImage}
                        />
                    )}
                    {question?.testcases?.map((testcase, index) => (
                        <div key={index}>
                            <p><strong>Thời gian giới hạn:</strong> {testcase.time_limit}s</p>
                            <p>
                                <strong>Input:</strong>{" "}
                                <a href={testcase.input_path} download>
                                    Tải file input
                                </a>
                            </p>
                        </div>
                    ))}
                </div>
                <div>
                    <h4>Phần viết code</h4>
                    <CodeMirror
                        value={code}
                        height="500px"
                        extensions={[python()]}
                        onChange={(value) => setCode(value)}
                        readOnly={isSubmitted}
                    />
                </div>
                <div className={styles.btndiv}>
                    {!isSubmitted && (
                        <button
                            onClick={handleCodeSubmit}
                            className={styles.submitButton}
                            disabled={isSubmitting} // Vô hiệu hóa khi đang gửi bài
                        >
                            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
                        </button>
                    )}
                    {isSubmitted && <p className={styles.submittedMessage}>Bạn đã nộp bài này.</p>}
                </div>
            </div>
        </div>
    );
}

export default ExamQuestion;
