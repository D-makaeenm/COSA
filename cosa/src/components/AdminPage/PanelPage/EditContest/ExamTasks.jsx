import React, { useState, useEffect } from "react";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import styles from "./EditContest.module.css";

function ExamTasks({ examId }) {
    const [tasks, setTasks] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [newTask, setNewTask] = useState({
        task_title: "",
        task_description: "",
        max_score: 0,
        execution_time_limit: 0,
        penalty_time_exceeded: 0,  // Thêm penalty_time_exceeded
    });

    const backendUrl = "http://localhost:5000/exam-tasks";

    // Fetch tasks
    useEffect(() => {
        axios
            .get(`${backendUrl}/${examId}`)
            .then((response) => setTasks(response.data))
            .catch((error) => console.error("Error fetching tasks:", error));
    }, [examId]);

    // Add task
    const handleAddTask = async () => {
        const defaultTask = {
            exam_id: examId,
            task_title: `Bài mới`,
            task_description: "Mô tả bài mới",
            max_score: 0,
            execution_time_limit: 0,
            penalty_time_exceeded: 0,  // Thêm penalty_time_exceeded
        };

        try {
            const response = await axios.post(`${backendUrl}/add-task`, defaultTask);  // Đổi đường dẫn tới /add-task
            const newTask = { ...defaultTask, id: response.data.id }; // Lấy ID từ backend
            setTasks([...tasks, newTask]);  // Cập nhật tasks với ID mới
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // Edit task
    const handleEditTask = (id) => {
        setIsEditing(id);
        const task = tasks.find((task) => task.id === id);
        setNewTask(task);  // Cập nhật newTask với dữ liệu bài tập cần sửa
    };

    // Save task
    const handleSaveTask = async (id) => {
        try {
            const updatedTask = {
                ...newTask,
                exam_id: examId,
            };
            await axios.put(`${backendUrl}/${id}`, updatedTask);  // Gửi thông tin bao gồm penalty_time_exceeded
            setTasks(tasks.map((task) => (task.id === id ? { ...task, ...newTask } : task)));
            setIsEditing(null);  // Sau khi lưu, quay lại chế độ không chỉnh sửa
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setIsEditing(null);  // Hủy bỏ chế độ chỉnh sửa và quay lại danh sách bài tập
        setNewTask({  // Khôi phục lại dữ liệu cũ nếu không muốn thay đổi
            task_title: "",
            task_description: "",
            max_score: 0,
            execution_time_limit: 0,
            penalty_time_exceeded: 0,
        });
    };

    // Delete task
    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`${backendUrl}/${id}`);
            setTasks(tasks.filter((task) => task.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <div className={styles.exam_tasks_container}>
            <div className={styles.exam_tasks_title}>
                <h4>Câu hỏi</h4>
                <div
                    id="add_exam_tasks"
                    onClick={handleAddTask}
                    className={styles.addIcon}
                >
                    <FontAwesomeIcon icon={icons.circleplus} />
                </div>
                <Tooltip anchorId="add_exam_tasks" content="Thêm câu hỏi" />
            </div>

            {tasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                    {isEditing === task.id ? (
                        <div className={styles.edit_taskItem}>
                            <input
                                type="text"
                                value={newTask.task_title}
                                onChange={(e) =>
                                    setNewTask({ ...newTask, task_title: e.target.value })
                                }
                                placeholder="Tên bài"
                            />
                            <textarea
                                value={newTask.task_description}
                                onChange={(e) =>
                                    setNewTask({ ...newTask, task_description: e.target.value })
                                }
                                placeholder="Mô tả bài"
                            />
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={newTask.max_score}
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        max_score: e.target.value === '' ? '' : parseFloat(e.target.value), // cho phép nhập số thập phân
                                    })
                                }
                                placeholder="Điểm tối đa"
                            />

                            <input
                                type="number"
                                value={newTask.execution_time_limit}
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        execution_time_limit: e.target.value === '' ? '' : parseFloat(e.target.value), // cho phép nhập số thập phân
                                    })
                                }
                                placeholder="Thời gian tối đa"
                            />

                            <input
                                type="number"
                                value={newTask.penalty_time_exceeded}
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        penalty_time_exceeded: e.target.value === '' ? '' : parseFloat(e.target.value), // cho phép nhập số thập phân
                                    })
                                }
                                placeholder="Điểm trừ khi vượt thời gian"
                                step="any"  // Cho phép bất kỳ số thập phân
                            />

                            {/* Thêm nút Lưu và Hủy */}
                            <button onClick={() => handleSaveTask(task.id)}>Lưu</button>
                            <button onClick={handleCancelEdit}>Hủy</button>
                        </div>
                    ) : (
                        <>
                            <h5>{task.task_title}</h5>
                            <p>{task.task_description}</p>
                            <p>Điểm tối đa: {task.max_score}</p>
                            <p>Thời gian tối đa: {task.execution_time_limit}s</p>
                            <p>Điểm trừ nếu vượt thời gian: {task.penalty_time_exceeded}</p>
                            <div className={styles.button3}>
                                <button className={styles.button3_edit} onClick={() => handleEditTask(task.id)}>Sửa</button>
                                <button className={styles.button3_del} onClick={() => handleDeleteTask(task.id)}>Xóa</button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ExamTasks;
