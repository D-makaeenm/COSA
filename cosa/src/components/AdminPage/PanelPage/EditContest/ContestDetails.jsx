import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";
import { Tooltip } from "react-tooltip";
import styles from "./EditContest.module.css";
import { ToastContainer, toast } from 'react-toastify';

const backendUrl = "http://localhost:5000/exam-tasks";

function ContestDetails() {
    const { id: examId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [tasksChanged, setTasksChanged] = useState(false);

    useEffect(() => {
        axios.get(`${backendUrl}/${examId}`)
            .then((response) => {
                setTasks(response.data.map(task => ({ ...task, delete: false })));
            })
            .catch((error) => console.error("Lỗi tải bài tập:", error));
    }, [examId]);

    const handleFileChange = (e, field, taskId) => {
        const file = e.target.files[0];
        if (!file) return;

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        [field]: file, // Lưu file object để gửi lên server
                        [`${field}_name`]: file.name || "Chưa có" // Lưu tên file để hiển thị
                    }
                    : task
            )
        );
        setTasksChanged(true);
    };

    const handleEditTask = (id) => {
        setIsEditing(id);
    };

    const handleCancelEdit = () => {
        setTasks(prevTasks => prevTasks.filter(task => task.id <= Math.max(...tasks.map(t => t.id)) - 1));
        setIsEditing(null);
    };


    const handleDeleteTask = (id) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, delete: true } : task));
        setTasksChanged(true);
    };

    const handleAddTask = () => {
        const defaultTask = {
            id: `new-${Date.now()}`, // ID tạm, sẽ thay thế bằng ID thực từ backend
            exam_id: examId,
            task_title: "",
            task_description: "",
            max_score: 0,
            time_limit: 0,
            task_image: null,
            input_file: null,
            output_file: null,
            delete: false,
        };

        setTasks((prevTasks) => [...prevTasks, defaultTask]);
        setIsEditing(defaultTask.id);
        setTasksChanged(true);
    };


    const handleSaveTask = (id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id
                    ? {
                        ...task,
                        input_file_name: task.input_file ? task.input_file.name : task.input_file_name,
                        output_file_name: task.output_file ? task.output_file.name : task.output_file_name
                    }
                    : task
            )
        );
        setIsEditing(null);
        setTasksChanged(true);
    };


    const notify = (action) => {
        if (action === 'warning') {
            toast.warning("Chưa có thay đổi gì", {
                autoClose: 3000,
                closeOnClick: true,
            });
        } else if (action === 'send') {
            toast.success("Gửi thành công!", {
                autoClose: 3000,
                closeOnClick: true,
            });
        }
    };

    const handleConfirmChanges = async () => {
        if (!tasksChanged) {
            notify("warning");
            return;
        }

        try {
            for (const task of tasks) {
                const formData = new FormData();

                Object.entries(task).forEach(([key, value]) => {
                    if (value && key !== "delete") {
                        formData.append(key, value);
                    }
                });

                if (task.delete && task.id) {
                    await axios.delete(`${backendUrl}/${task.id}`);
                } else if (String(task.id).startsWith("new-")) {
                    await axios.post(`${backendUrl}/add-task`, formData);
                } else {
                    await axios.put(`${backendUrl}/${task.id}`, formData);
                }
            }

            notify("send");
            setTasksChanged(false);
        } catch (error) {
            console.error("Lỗi khi gửi thay đổi:", error);
        }
    };


    return (
        <div className={styles.info_container}>
            <h1>Sửa thông tin tiêu chí, testcase, câu hỏi cuộc thi</h1>

            <div className={styles.exam_tasks_container}>
                <div className={styles.exam_tasks_title}>
                    <h4>Câu hỏi</h4>
                    <div id="add_exam_tasks" onClick={handleAddTask} className={styles.addIcon}>
                        <FontAwesomeIcon icon={icons.circleplus} />
                    </div>
                    <Tooltip anchorId="add_exam_tasks" content="Thêm câu hỏi" />
                </div>

                {tasks.map((task) => !task.delete && (
                    <div key={task.id || task.task_title} className={styles.taskItem}>
                        {isEditing === task.id ? (
                            <div className={styles.edit_taskItem}>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>Tiêu đề: </p>
                                    <input
                                        type="text"
                                        value={task.task_title}
                                        onChange={(e) => {
                                            const updatedTasks = tasks.map(t =>
                                                t.id === task.id ? { ...t, task_title: e.target.value } : t
                                            );
                                            setTasks(updatedTasks);
                                        }}
                                        required
                                    />
                                </div>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>Mô tả: </p>
                                    <textarea value={task.task_description} onChange={(e) => setTasks(tasks.map(t => t.id === task.id ? { ...t, task_description: e.target.value } : t))} required />
                                </div>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>Ảnh đề bài: </p>
                                    <input type="file" onChange={(e) => handleFileChange(e, "task_image", task.id)} required />
                                </div>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>Giới hạn thời gian: </p>
                                    <input type="number" value={task.time_limit} onChange={(e) => setTasks(tasks.map(t => t.id === task.id ? { ...t, time_limit: parseFloat(e.target.value) } : t))} required />
                                </div>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>Điểm: </p>
                                    <input type="number" min="0" value={task.max_score} onChange={(e) => setTasks(tasks.map(t => t.id === task.id ? { ...t, max_score: parseFloat(e.target.value) } : t))} required />
                                </div>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>File Input:</p>
                                    <input type="file" onChange={(e) => handleFileChange(e, "input_file", task.id)} required />
                                </div>
                                <div className={styles.edit_taskItem_inside}>
                                    <p>File Output:</p>
                                    <input type="file" onChange={(e) => handleFileChange(e, "output_file", task.id)} required />
                                </div>
                                <div className={styles.edit_taskItem_btn_container}>
                                    <button className={styles.btnluu} onClick={() => handleSaveTask(task.id)}>Lưu</button>
                                    <button className={styles.btnhuy} onClick={handleCancelEdit}>Hủy</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h5>{task.task_title}</h5>
                                <p>{task.task_description}</p>
                                <p>Điểm: {task.max_score} điểm</p>
                                <p>Giới hạn thời gian: {task.time_limit}</p>
                                <p>Tên file đề bài: {task.task_image instanceof File ? task.task_image.name : task.task_image}</p>
                                <p>File INPUT: {task.input_file_name || task.testcases?.[0]?.input_path || "Chưa có"}</p>
                                <p>File OUTPUT: {task.output_file_name || task.testcases?.[0]?.output_path || "Chưa có"}</p>
                                <div className={styles.button3}>
                                    <button className={styles.button3_edit} onClick={() => handleEditTask(task.id)}>Sửa</button>
                                    <button className={styles.button3_del} onClick={() => handleDeleteTask(task.id)}>Xóa</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <ToastContainer />
            <div className={styles.btnaccess}>
                <button onClick={handleConfirmChanges}>Xác nhận sửa đổi</button>
            </div>
        </div>
    );
}

export default ContestDetails;
