import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ContestInfo.module.css";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";

function ContestInfo() {
    const { id } = useParams(); // Lấy id từ URL
    const [contestInfo, setContestInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return format(date, "HH:mm:ss EEEE dd/MM/yyyy", { locale: vi });
    };

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

    const handleRemoveParticipant = async (username) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa thí sinh ${username} khỏi cuộc thi?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/management/exams/remove-participant",
                {
                    exam_id: id, // ID của cuộc thi
                    username: username, // ID của sinh viên
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert(`Thí sinh ${username} đã bị xóa khỏi cuộc thi.`);
            const response = await axios.get(`http://localhost:5000/management/exams/${id}`);
            setContestInfo(response.data);
        } catch (error) {
            alert(error.response?.data?.error || "Có lỗi xảy ra!");
        }
    };

    const handleEditContestClick = () => {
        navigate(`/admin/list-contest/edit-contest/${id}`); // Điều hướng đến trang sửa thông tin cuộc thi
    };

    return (
        <div className={styles.info_container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>{contestInfo.title}</h1>
                    <div className={styles.editContest} onClick={handleEditContestClick}><FontAwesomeIcon icon={icons.pen} /></div>
                </div>
                <div className={styles.author}>
                    <p>Người tạo: {contestInfo.creator_name}</p>
                    <p>Thời gian bắt đầu: {formatDateTime(contestInfo.start_time)}</p>
                    <p>Thời gian kết thúc: {formatDateTime(contestInfo.end_time)}</p>
                </div>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Họ và tên</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Số điểm</th>
                        <th>Thứ hạng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {contestInfo.participants.map((participant, index) => (
                        <tr key={index}>
                            <td>{participant.username}</td>
                            <td>{participant.name}</td>
                            <td>{participant.phone}</td>
                            <td>{participant.email}</td>
                            <td>{participant.score}</td>
                            <td>{participant.rank}</td>
                            <td>
                                <button
                                    onClick={() => handleRemoveParticipant(participant.username)}
                                    className={styles.remove_button}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ContestInfo;
