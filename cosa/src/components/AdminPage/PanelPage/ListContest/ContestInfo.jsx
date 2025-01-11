import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ContestInfo.module.css";

function ContestInfo() {
    const { id } = useParams(); // Lấy id từ URL
    const [contestInfo, setContestInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Gọi API để lấy dữ liệu
        axios
            .get(`http://localhost:5000/management/exams/${id}`)
            .then((response) => {
                setContestInfo(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.error || "Không thể tải dữ liệu");
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className={styles.info_container}>
            <div>
                <h1>{contestInfo.title}</h1>
                <p>Người tạo: {contestInfo.creator_name}</p>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Họ và tên</th>
                        <th>Lớp</th>
                        <th>Khoa</th>
                        <th>Số điểm</th>
                        <th>Thứ hạng</th>
                    </tr>
                </thead>
                <tbody>
                    {contestInfo.participants.map((participant, index) => (
                        <tr key={index}>
                            <td>{participant.username}</td>
                            <td>{participant.name}</td>
                            <td>{participant.student_class}</td>
                            <td>{participant.department}</td>
                            <td>{participant.score}</td>
                            <td>{participant.rank}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ContestInfo;
