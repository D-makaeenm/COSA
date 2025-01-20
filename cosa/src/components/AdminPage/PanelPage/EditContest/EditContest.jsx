import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Lấy id từ URL
import styles from "./EditContest.module.css";

function EditContest() {
    const { id } = useParams(); // Lấy id của cuộc thi từ URL
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [status, setStatus] = useState("scheduled");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Tải thông tin cuộc thi khi mở trang
    useEffect(() => {
        const fetchContestDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://localhost:5000/management/exams/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const { title, description, start_time, end_time, status } =
                    response.data;

                // Đổ dữ liệu từ API vào form
                setTitle(title);
                setDescription(description);
                setStartTime(start_time.slice(0, 16)); // Lấy datetime-local hợp lệ
                setEndTime(end_time.slice(0, 16)); // Lấy datetime-local hợp lệ
                setStatus(status);
            } catch (error) {
                setMessage(
                    error.response?.data?.error || "Không thể tải thông tin cuộc thi"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContestDetails();
    }, [id]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/management/exams/edit/${id}`,
                {
                    title,
                    description,
                    start_time: startTime,
                    end_time: endTime,
                    status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage("Thông tin cuộc thi đã được sửa thành công!");
        } catch (error) {
            setMessage(
                error.response?.data?.error || "Có lỗi xảy ra khi sửa cuộc thi!"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.info_container}>
            <h1>Sửa thông tin cuộc thi</h1>
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
                        {loading ? "Đang xử lý..." : "Sửa đổi"}
                    </button>
                </div>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default EditContest;
