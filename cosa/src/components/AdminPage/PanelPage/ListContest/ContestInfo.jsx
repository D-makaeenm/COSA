import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./ContestInfo.module.css";
import config from "../../../../config"

function ContestInfo() {
    const { id } = useParams(); // Lấy id từ URL
    const [contestInfo, setContestInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const fetchContestInfo = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/management/exams/${id}`);
                setContestInfo(response.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.error || "Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
    
        if (location.state?.reload) {
            fetchContestInfo(); // Gọi lại API để cập nhật
            navigate(location.pathname, { replace: true }); // Xóa state sau khi xử lý
        } else {
            fetchContestInfo();
        }
    }, [id, location.state, location.pathname, navigate]);

    const handleRemoveParticipant = async (username) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa thí sinh ${username} khỏi cuộc thi?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${config.apiBaseUrl}/management/exams/remove-participant`,
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
            const response = await axios.get(`${config.apiBaseUrl}/management/exams/${id}`);
            setContestInfo(response.data);
        } catch (error) {
            alert(error.response?.data?.error || "Có lỗi xảy ra!");
        }
    };

    const handleEditContestClick = () => {
        navigate(`/admin/list-contest/edit-contest/${id}`);
    };

    const handleEditContestDetailsClick = () => {
        navigate(`/admin/list-contest/edit-contest-detail/${id}`);
    };

    const handleAddStudenttoContest = () => {
        navigate(`/admin/list-contest/contests/${id}/add-student`);
    };

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className={styles.info_container}>
            <Outlet
                context={{
                    contestInfo,
                    handleRemoveParticipant,
                    handleEditContestClick,
                    handleEditContestDetailsClick,
                    handleAddStudenttoContest,
                }}
            />
        </div>
    );
}

export default ContestInfo;
