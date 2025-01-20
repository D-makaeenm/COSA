// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { python } from '@codemirror/lang-python';
// import axios from "axios";
// import styles from './ExamQuestion.module.css';

// function ExamQuestion() {
//     // const { examId, questionId } = useParams();
//     // const [question, setQuestion] = useState(null);
//     // const [code, setCode] = useState("");
//     // const [loading, setLoading] = useState(true);
//     // const [message, setMessage] = useState("");

//     // useEffect(() => {
//     //     const token = localStorage.getItem("token");

//     //     axios
//     //         .get(`http://localhost:5000/student/exam/${examId}/question/${questionId}`, {
//     //             headers: { Authorization: `Bearer ${token}` },
//     //         })
//     //         .then((response) => {
//     //             setQuestion(response.data);
//     //             setLoading(false);
//     //         })
//     //         .catch((err) => {
//     //             console.error(err);
//     //             setLoading(false);
//     //         });
//     // }, [examId, questionId]);

//     // const handleSubmit = async () => {
//     //     setMessage("");
//     //     try {
//     //         const token = localStorage.getItem("token");
//     //         const response = await axios.post(
//     //             `http://localhost:5000/student/exam/${examId}/question/${questionId}/submit`,
//     //             { code },
//     //             {
//     //                 headers: { Authorization: `Bearer ${token}` },
//     //             }
//     //         );
//     //         setMessage(response.data.message || "Bài làm của bạn đã được nộp!");
//     //     } catch (error) {
//     //         setMessage(error.response?.data?.error || "Có lỗi xảy ra khi nộp bài!");
//     //     }
//     // };

//     // if (loading) {
//     //     return <p>Đang tải câu hỏi...</p>;
//     // }

//     // if (!question) {
//     //     return <p>Không tìm thấy câu hỏi!</p>;
//     // }

//     return (
//         <div className={styles.questions}>
//             <div className={styles.container}>
//                 {/* Hiển thị câu hỏi
//                 <div className={styles.questionSection}>
//                     <h2>{question.task_title}</h2>
//                     <p>{question.task_description}</p>
//                     <p><strong>Điểm tối đa:</strong> {question.max_score}</p>
//                     <p><strong>Giới hạn thời gian chạy:</strong> {question.execution_time_limit} giây</p>
//                 </div> */}
//                 <div>
//                     <h2>Bài 1: Tính tổng</h2>
//                     <p>Viết chương trình tính tổng 2 số nguyên dương 33 và 99</p>
//                 </div>
//                 <div>
//                     <h3>Phần viết code</h3>
//                     <CodeMirror
//                         value="print('Hello, World!')"
//                         height="200px"
//                         extensions={[python()]}
//                     />;
//                 </div>
//                 <div>
//                     <button className={styles.submitButton}>
//                         Nộp bài
//                     </button>
//                 </div>
//                 {/* Phần viết code
//                 <div className={styles.codeSection}>
//                     <h3>Phần viết code</h3>
//                     <textarea
//                         className={styles.codeEditor}
//                         value={code}
//                         onChange={(e) => setCode(e.target.value)}
//                         placeholder="Nhập mã nguồn của bạn tại đây..."
//                     ></textarea>
//                 </div> */}

//                 {/* Nút nộp bài
//                 <div className={styles.submitSection}>
//                     <button onClick={handleSubmit} className={styles.submitButton}>
//                         Nộp bài
//                     </button>
//                     {message && <p className={styles.message}>{message}</p>}
//                 </div> */}
//             </div>
//         </div>
//     );
// }

// export default ExamQuestion;
