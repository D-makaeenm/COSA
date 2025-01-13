import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const SubmissionProgressChart = () => {
  const [progressData, setProgressData] = useState([]);
  const [contestTitle, setContestTitle] = useState("");

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    // Gọi API để lấy dữ liệu
    axios
      .get("http://localhost:5000/dashboard/latest-contest-summary", {
        headers: {
          Authorization: `Bearer ${token}` // Thêm JWT token vào header
        }
      })
      .then((response) => {
        setContestTitle(response.data.contest_title); // Lấy tên cuộc thi
        setProgressData(response.data.progress); // Lấy tiến độ nộp bài
      })
      .catch((error) => {
        console.error("Error fetching progress data:", error.response || error.message);
      });
  }, []);

  return (
    <div>
      <h2>Tiến Độ Nộp Bài: {contestTitle}</h2>
      <BarChart
        width={800}
        height={400}
        data={progressData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: "Thời gian", position: "insideBottom", offset: -5 }} />
        <YAxis label={{ value: "Số bài nộp", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        {/* Màu Xanh Lá: Trước thời hạn */}
        <Bar dataKey="before_deadline" fill="#28a745" name="Trước thời hạn" />
        {/* Màu Cam: Đúng thời hạn */}
        <Bar dataKey="at_deadline" fill="#ffc107" name="Đúng thời hạn" />
        {/* Màu Đỏ: Chưa chấm */}
        <Bar dataKey="ungraded_submissions" fill="#dc3545" name="Chưa chấm" />
      </BarChart>
    </div>
  );
};

export default SubmissionProgressChart;
