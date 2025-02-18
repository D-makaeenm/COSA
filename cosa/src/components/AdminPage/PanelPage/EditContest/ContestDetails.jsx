import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./EditContest.module.css";
import ExamTasks from "./ExamTasks";

function ContestDetails() {
    const { id: examId } = useParams(); // Lấy exam_id từ URL
    const [tasks, setTasks] = useState([]); // Lưu danh sách bài tập cần gửiểm
    const [tasksChanged, setTasksChanged] = useState(false); // Đánh dấu khi có thay đổi ở bài tập

    const backendUrl = "http://localhost:5000"; // API backend

    const handleTasksChange = (updatedTasks) => {
        setTasks(updatedTasks); // Lưu tất cả bài tập, kể cả đã xóa
        setTasksChanged(true); // Đánh dấu có thay đổi
        console.log(updatedTasks); // Đảm bảo rằng tasks được cập nhật đúng
    };


    // Hàm gửi tất cả thay đổi khi nhấn "Xác nhận sửa đổi"
    const handleConfirmChanges = async () => {
        if (!tasksChanged) {
            alert("Không có thay đổi nào để lưu.");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn sửa đổi?")) return;

        try {
            // Gửi tất cả thay đổi
            for (const task of tasks) {
                console.log("Task delete flag:", task.delete); // Thêm log kiểm tra giá trị delete
                if (task.id) { // Kiểm tra nếu bài tập có ID
                    if (task.delete) { // Nếu bài tập đã đánh dấu xóa
                        // Gửi yêu cầu DELETE để xóa bài tập
                        await axios.delete(`${backendUrl}/exam-tasks/${task.id}`);
                        console.log("Đã xóa task với ID:", task.id);
                    } else {
                        // Nếu bài tập chưa bị xóa, gửi PUT để cập nhật
                        await axios.put(`${backendUrl}/exam-tasks/${task.id}`, task);
                    }
                } else {
                    // Nếu bài tập mới (không có ID), gửi POST để tạo bài mới
                    const response = await axios.post(`${backendUrl}/exam-tasks/add-task`, task);
                    task.id = response.data.id; // Cập nhật ID từ backend
                }
            }

            alert("Thay đổi đã được gửi!");
            setTasksChanged(false); // Đánh dấu thay đổi đã được lưu
        } catch (error) {
            console.error("Lỗi khi gửi thay đổi:", error);
        }
    };


    return (
        <div className={styles.info_container}>
            <h1>Sửa thông tin tiêu chí, testcase, câu hỏi cuộc thi</h1>
            <div className={styles.formDetails}>
                <div className={styles.detailInfo_container}>
                    <ExamTasks
                        examId={examId}
                        onSave={(updatedTasks) => {
                            // Log updatedTasks để kiểm tra
                            console.log("Updated tasks:", updatedTasks);

                            // Lọc ra các task chưa bị xóa để hiển thị
                            const filteredTasks = updatedTasks.filter(task => !task.delete);
                            handleTasksChange(updatedTasks); // Truyền tất cả tasks về ContestDetails
                            setTasks(filteredTasks); // Cập nhật UI chỉ hiển thị task chưa xóa
                        }}
                    />


                </div>
                <div className={styles.button}>
                    <button onClick={handleConfirmChanges}>
                        Xác nhận sửa đổi
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ContestDetails;
