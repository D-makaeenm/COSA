import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ListContest.module.css";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const statusTranslation = {
    completed: "Hoàn thành",
    ongoing: "Đang diễn ra",
    upcoming: "Sắp diễn ra"
};

function ListContest() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate(); // Hook để điều hướng
    const location = useLocation();

    useEffect(() => {
        // Kiểm tra nếu URL chứa "contests/:id", chuyển sang chế độ chi tiết
        if (location.pathname.includes("/contests/")) {
            setShowDetails(true);
        } else {
            setShowDetails(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get("http://localhost:5000/management/exams", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setContests(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching contest info:", error.response || error.message);
                setError("Không thể tải dữ liệu cuộc thi.");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className={styles.main_container}>
                <h1>Đang tải danh sách các cuộc thi...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.main_container}>
                <h1>{error}</h1>
            </div>
        );
    }

    // Hàm xử lý sự kiện khi nhấp vào một item
    const handleContestClick = (contestId) => {
        setShowDetails(true); // Chuyển sang chế độ chi tiết
        navigate(`/admin/list-contest/contests/${contestId}`);
    };


    return (
        <div className={styles.main_container}>
            {!showDetails && (
                <div>
                    <h1>Danh sách các cuộc thi</h1>
                    <div className={styles.second_container}>
                        {contests.map((contest) => (
                            <div
                                key={contest.id}
                                className={styles.contest_item}
                                onClick={() => handleContestClick(contest.id)} // Thêm sự kiện onClick
                            >
                                <h5>Tên cuộc thi</h5>
                                <h3>{contest.title}</h3>
                                <div className={styles.contest_item_info}>
                                    <p>
                                        <FontAwesomeIcon icon={icons.circle} style={{ color: "red" }} />{" "}
                                        Tình trạng: {statusTranslation[contest.status] || "Không xác định"}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={icons.user} style={{ color: "blue" }} />{" "}
                                        Số lượng thí sinh: {contest.total_students || 0}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={icons.filealt} style={{ color: "green" }} />{" "}
                                        Số bài đã nộp: {contest.total_submissions || 0}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={icons.checkcircle} style={{ color: "orange" }} />{" "}
                                        Số bài đã chấm: {contest.graded_submissions || 0}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={icons.usercircle} style={{ color: "purple" }} />{" "}
                                        Người tạo: {contest.creator || "Không rõ"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            )}

            {showDetails && ( // Hiển thị chi tiết contest khi ở chế độ chi tiết
                <div className={styles.second_container}>
                    <Outlet />
                </div>
            )}
        </div>
    );
}

export default ListContest;
