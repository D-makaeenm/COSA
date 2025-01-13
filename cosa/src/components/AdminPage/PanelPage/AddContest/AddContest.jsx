import React, { useState } from "react";
import axios from "axios";
import styles from "./AddContest.module.css";

function AddContest() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [status, setStatus] = useState("scheduled"); // Trạng thái mặc định là "scheduled"
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/exams",
                {
                    title,
                    description,
                    start_time: startTime,
                    end_time: endTime,
                    status, // Gửi trạng thái lên backend
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage("Cuộc thi được tạo thành công!");
        } catch (error) {
            setMessage(error.response?.data?.error || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.info_container}>
            <h1>Tạo mới cuộc thi</h1>
            <div className={styles.form}>
                <div className={styles.title}>
                    <label>Tiêu đề:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className={styles.description}>
                    <label>Mô tả:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                <div className={styles.start_time}>
                    <label>Thời gian bắt đầu:</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div className={styles.end_time}>
                    <label>Thời gian kết thúc:</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
                <div className={styles.status}>
                    <label>Trạng thái:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="scheduled">Scheduled</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className={styles.button}>
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Tạo cuộc thi"}
                    </button>
                </div>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default AddContest;
