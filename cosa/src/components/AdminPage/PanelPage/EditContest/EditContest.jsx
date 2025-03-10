import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Lấy id từ URL
import styles from "./EditContest.module.css";

function EditContest() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [duration, setDuration] = useState(""); // Thời lượng (phút)
    const [status, setStatus] = useState("scheduled");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isUserEditingDuration, setIsUserEditingDuration] = useState(false); // Đánh dấu người dùng chỉnh sửa duration
    const [isUserEditingEndTime, setIsUserEditingEndTime] = useState(false); // Đánh dấu người dùng chỉnh sửa end_time

    // Tải thông tin cuộc thi khi mở trang
    useEffect(() => {
        const fetchContestDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://localhost:5000/management/exams/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const { title, description, start_time, end_time, status } = response.data;

                setTitle(title);
                setDescription(description);
                setStartTime(new Date(start_time).toISOString().slice(0, 16));
                setEndTime(new Date(end_time).toISOString().slice(0, 16));

                // Tính duration từ start_time và end_time
                const durationMinutes = Math.floor(
                    (new Date(end_time) - new Date(start_time)) / (1000 * 60)
                );
                setDuration(durationMinutes);

                setStatus(status);
            } catch (error) {
                setMessage(error.response?.data?.error || "Không thể tải thông tin cuộc thi");
            } finally {
                setLoading(false);
            }
        };

        fetchContestDetails();
    }, [id]);

    useEffect(() => {
        if (isUserEditingDuration && startTime && duration) {
            const startTimestamp = new Date(startTime).getTime();
            const newEndTime = new Date(startTimestamp + duration * 60 * 1000)
                .toISOString()
                .slice(0, 16);
            setEndTime(newEndTime);
            setIsUserEditingDuration(false);
        }
    }, [duration, startTime, isUserEditingDuration]); 
    useEffect(() => {
        if (isUserEditingEndTime && startTime && endTime) {
            const startTimestamp = new Date(startTime).getTime();
            const endTimestamp = new Date(endTime).getTime();
            const calculatedDuration = Math.floor((endTimestamp - startTimestamp) / (1000 * 60));
            setDuration(calculatedDuration);
            setIsUserEditingEndTime(false);
        }
    }, [endTime, startTime, isUserEditingEndTime]);
    

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
                    duration,
                    status,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMessage("Thông tin cuộc thi đã được sửa thành công!");
        } catch (error) {
            setMessage(error.response?.data?.error || "Có lỗi xảy ra khi sửa cuộc thi!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.info_container}>
            <h1>Sửa thông tin cơ bản cuộc thi</h1>
            <div className={styles.form}>
                <div className={styles.basicIn}>
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
                            onChange={(e) => {
                                setEndTime(e.target.value);
                                setIsUserEditingEndTime(true); // Đánh dấu người dùng thay đổi end_time
                            }}
                        />
                    </div>
                    <div className={styles.duration}>
                        <label>Thời lượng cuộc thi (phút):</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => {
                                setDuration(e.target.value);
                                setIsUserEditingDuration(true); // Đánh dấu người dùng thay đổi duration
                            }}
                            min="1"
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
                </div>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default EditContest;
