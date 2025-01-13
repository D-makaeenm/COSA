import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import axios from "axios";

function LatestExamsGanttChart() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/dashboard/get-latest-exams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Parse dữ liệu từ response
        const data = response.data.map((exam, index) => {
          const startDate = new Date(exam.created_at);
          const endDate = new Date(exam.end_time);
          const now = new Date();

          let percentDone = 0;
          let color = "#4285F4"; // Mặc định màu xanh dương (scheduled)

          if (exam.status === "completed") {
            percentDone = 100;
            color = "#34A853"; // Màu xanh lá cây
          } else if (exam.status === "ongoing") {
            const totalTime = endDate - startDate;
            const elapsedTime = now - startDate;
            percentDone = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
            color = "#FBBC05"; // Màu cam
          }

          return [
            `Task_${index}`, // ID duy nhất cho mỗi hàng
            exam.title, // Tên cuộc thi
            exam.status, // Trạng thái
            startDate, // Ngày tạo
            endDate, // Ngày kết thúc
            null, // Duration (Không cần dùng vì đã có start và end)
            percentDone, // % Hoàn thành
            null, // Dependencies (không áp dụng)
            color, // Màu của thanh
          ];
        });

        setExams(data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu cuộc thi.");
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  const columns = [
    { type: "string", label: "Task ID" },
    { type: "string", label: "Tên cuộc thi" },
    { type: "string", label: "Trạng thái" },
    { type: "date", label: "Ngày bắt đầu" },
    { type: "date", label: "Ngày kết thúc" },
    { type: "number", label: "Thời lượng" },
    { type: "number", label: "% Hoàn thành" },
    { type: "string", label: "Phụ thuộc" },
    { type: "string", role: "style" }, // Màu sắc
  ];

  const chartData = [columns, ...exams];

  const options = {
    height: 400, // Chiều cao của biểu đồ
    gantt: {
      trackHeight: 30, // Chiều cao mỗi hàng
      criticalPathEnabled: false, // Không cần hiển thị critical path
      innerGridTrack: { fill: "#f1f1f1" },
      barHeight: 20,
      barLabelStyle: { fontSize: 14 },
    },
    tooltip: {
      isHtml: true,
    },
  };

  return (
    <div>
      <h3>Biểu đồ Gantt: Các cuộc thi gần đây</h3>
      <Chart
        chartType="Gantt"
        width="100%"
        data={chartData}
        options={options}
      />
    </div>
  );
}

export default LatestExamsGanttChart;
