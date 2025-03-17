import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import styles from "./ExamQuestion.module.css";
import Swal from "sweetalert2";
import config from "../../../config";
import { ToastContainer, toast } from 'react-toastify';

function ExamQuestion() {
    const { examId, questionId } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [code, setCode] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [compileOutput, setCompileOutput] = useState(null);
    const { updateScore, setLoadingScore } = useOutletContext();

    const backendUrl = `${config.apiBaseUrl}`;

    const notify = (action) => {
        if (action === 'notok') {
            toast.warning("Compile lỗi!", {
                autoClose: 2000,
                closeOnClick: true,
            });
        } else if (action === 'ok') {
            toast.success("Compile thành công!", {
                autoClose: 2000,
                closeOnClick: true,
            });
        }
    };
    // 📌 Tải code từ localStorage nếu có
    useEffect(() => {
        const savedCode = localStorage.getItem(`task_${questionId}_code`);
        if (savedCode) {
            setCode(savedCode);
        }
    }, [questionId]);

    // 📌 Khi thí sinh gõ code, tự động lưu vào localStorage
    const handleCodeChange = (value) => {
        setCode(value);
        localStorage.setItem(`task_${questionId}_code`, value);
    };

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
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const studentId = localStorage.getItem("id");

            // ✅ Lưu examId vào localStorage sớm hơn
            localStorage.setItem("examId", examId);

            const payload = {
                contest_id: examId,
                student_id: studentId,
                problem_id: questionId,
                code: encodeURIComponent(code),
                language: "cpp",
            };

            const response = await axios.post(`${backendUrl}/submission/submit`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status !== 200 || !response.data?.submission_id) {
                throw new Error("Bài làm không được lưu. Vui lòng thử lại.");
            }

            const submissionId = response.data.submission_id;
            console.log(`✅ Bài đã lưu: Submission ID = ${submissionId}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            let graded = false;
            for (let i = 0; i < 5; i++) {
                const checkResponse = await axios.get(
                    `${backendUrl}/submission/status/${submissionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (checkResponse.data.is_graded) {
                    graded = true;
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            if (!graded) {
                console.warn("⚠️ Bài đã lưu nhưng chưa chấm điểm. Có thể backend xử lý chậm.");
            }

            showAlert();
            setIsSubmitted(true);
            localStorage.removeItem(`task_${questionId}_code`); // ✅ Xóa code đã lưu sau khi nộp

            // ✅ Kiểm tra nếu thí sinh đã nộp tất cả bài
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
            Swal.fire({
                title: "Lỗi!",
                text: "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            setIsSubmitting(false);
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

    const handleCodeCompile = async () => {
        setCompileOutput(null); // Xóa output cũ trước khi compile
        try {
            const token = localStorage.getItem("token");

            const payload = {
                code: encodeURIComponent(code),
                language: "cpp",
            };

            const response = await axios.post(`${backendUrl}/submission/compile`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                // Kiểm tra lỗi biên dịch hoặc runtime
                if (response.data.error) {
                    setCompileOutput(`Lỗi\n${response.data.error}`);
                    notify("notok");
                } else {
                    // Lấy kết quả từ output object (tên file có thể khác nhau)
                    const outputData = response.data.output;
                    const outputValues = outputData ? Object.values(outputData).join("\n") : "Không có output";

                    setCompileOutput(outputValues);
                    notify("ok");
                }
            } else {
                setCompileOutput("Lỗi không xác định khi compile.");
                notify("notok");
            }
        } catch (err) {
            console.error("Lỗi khi compile:", err);
            setCompileOutput("Lỗi hệ thống khi compile.");
            notify("notok");
        }
    };


    if (loading) return <p>Đang tải câu hỏi...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.questions}>
            <ToastContainer />
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
                    {question?.testcases?.length > 0 && (
                        <div>
                            <p><strong>Thời gian giới hạn:</strong> {question.testcases[0].time_limit}s</p>
                            <p>
                                <strong>Input:</strong>{" "}
                                <a href={question.testcases[0].input_path} download>
                                    Tải file input
                                </a>
                            </p>
                        </div>
                    )}
                </div>
                <div>
                    <h4>Phần viết code</h4>
                    <CodeMirror
                        value={code}
                        height="500px"
                        extensions={[cpp()]} // Đổi từ python() sang cpp()
                        onChange={handleCodeChange}
                        readOnly={isSubmitted}
                    />
                </div>
                <div className={styles.btndiv}>
                    {!isSubmitted && (
                        <button
                            onClick={handleCodeSubmit}
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
                        </button>
                    )}
                    <button
                        onClick={handleCodeCompile}
                        className={styles.submitButton}
                    >
                        Compile
                    </button>
                    {isSubmitted && <p className={styles.submittedMessage}>Bạn đã nộp bài này.</p>}
                </div>
                {compileOutput && (
                    <div className={styles.compileOutput}>
                        <h4 style={{ color: compileOutput.startsWith("Lỗi") ? "red" : "green" }}>
                            {compileOutput.startsWith("Lỗi") ? "Lỗi ❌:" : "Kết quả chạy ✅:"}
                        </h4>
                        <pre>{compileOutput}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExamQuestion;
