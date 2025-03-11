import React, { useState, useEffect } from "react";
import styles from "./HomePage.module.css";
import icons from "../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SubmissionProgressChart from "./Chart/SubmissionProgressChart";
import ExamChart from "./Chart/ExamChart";
import axios from "axios";
import config from "../../../config";
function HomePage() {

    const [contestData, setContestData] = useState(null);
    const [statistics, setStatistics] = useState({
        totalContests: 0,
        totalStudents: 0,
        totalTeachers: 0
    });

    const statusTranslation = {
        scheduled: "Đã lên lịch",
        ongoing: "Đang tiến hành",
        completed: "Đã hoàn thành"
    };

    useEffect(() => {
        // Lấy JWT token từ localStorage
        const token = localStorage.getItem("token");

        // Gọi API để lấy thông tin cuộc thi gần nhất
        axios
            .get(`${config.apiBaseUrl}/dashboard/latest-contest-summary`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setContestData(response.data.info); // Đảm bảo đúng cấu trúc
            })
            .catch((error) => {
                console.error("Error fetching contest info:", error.response || error.message);
            });


        axios
            .get(`${config.apiBaseUrl}/dashboard/statistics`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setStatistics(response.data);
            })
            .catch((error) => {
                console.error("Error fetching statistics:", error.response || error.message);
            });
    }, []);

    return (
        <div className={styles.main_container}>
            <div>
                <h1>Trang Chủ</h1>
            </div>
            <div className={styles.contest_recent}>
                <h5>Cuộc thi gần nhất</h5>
                <h3>
                    Tên cuộc thi: {contestData ? contestData.title : "Đang tải..."}
                </h3>
                <div className={styles.contest_recent_info}>
                    <p>
                        <FontAwesomeIcon icon={icons.circle} style={{ color: "red" }} />{" "}
                        Tình trạng: {contestData ? statusTranslation[contestData.status] : "Đang tải..."} 
                    </p>
                    <p>
                        <FontAwesomeIcon icon={icons.user} style={{ color: "blue" }} />{" "}
                        Số lượng thí sinh: {contestData ? contestData.total_students : "Đang tải..."}
                    </p>
                    <p>
                        <FontAwesomeIcon icon={icons.filealt} style={{ color: "green" }} />{" "}
                        Số bài đã nộp: {contestData ? contestData.total_submissions : "Đang tải..."}
                    </p>
                    <p>
                        <FontAwesomeIcon icon={icons.checkcircle} style={{ color: "orange" }} />{" "}
                        Số bài đã chấm: {contestData ? contestData.graded_submissions : "Đang tải..."}
                    </p>
                    <p>
                        <FontAwesomeIcon icon={icons.usercircle} style={{ color: "purple" }} />{" "}
                        Người tạo: {contestData ? contestData.creator : "Đang tải..."}
                    </p>
                </div>
            </div>
            <div className={styles.statistics}>
                <div className={styles.statistics_card}>
                    Số lượng cuộc thi: {statistics.totalContests}
                </div>
                <div className={styles.statistics_card}>
                    Tổng số lượng thí sinh: {statistics.totalStudents}
                </div>
                <div className={styles.statistics_card}>
                    Tổng số lượng giáo viên: {statistics.totalTeachers}
                </div>
            </div>
            <div>
                <SubmissionProgressChart />
            </div>
            <div>
                < ExamChart />
            </div>
        </div>
    );
}

export default HomePage;
