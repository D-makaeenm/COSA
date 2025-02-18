import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";
import { Tooltip } from "react-tooltip";
import styles from "./EditContest.module.css";

function ExamTasks({ examId, onSave }) {
    const [tasks, setTasks] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [newTask, setNewTask] = useState({
        task_title: "",
        task_description: "",
        max_score: 0,
        time_limit: 0,
        penalty_correct: 0,
        penalty_time: 0,
        input: "",
        output: ""
    });

    const backendUrl = "http://localhost:5000/exam-tasks";

    // Fetch tasks khi component được mount
    useEffect(() => {
        axios
            .get(`${backendUrl}/${examId}`)
            .then((response) => {
                const updatedTasks = response.data.map((task) => {
                    let penaltyCorrect = 0;
                    let penaltyTime = 0;
                    let inputData = "";
                    let expectedOutput = "";
                    let timelimit = "";

                    // Lấy thông tin tiêu chí từ grading_criteria
                    if (task.grading_criteria) {
                        task.grading_criteria.forEach((criteria) => {
                            if (criteria.criteria_name === "Điểm trừ nếu đúng") {
                                penaltyCorrect = criteria.penalty;
                            } else if (criteria.criteria_name === "Điểm trừ nếu vượt quá thời gian") {
                                penaltyTime = criteria.penalty;
                            }
                        });
                    }

                    // Lấy thông tin từ testcases
                    if (task.testcases && task.testcases.length > 0) {
                        inputData = task.testcases[0].input || "";
                        expectedOutput = task.testcases[0].expected_output || "";
                        timelimit = task.testcases[0].time_limit || "";
                    }

                    return {
                        ...task,
                        penalty_correct: penaltyCorrect, // Điểm trừ nếu sai kết quả
                        penalty_time: penaltyTime, // Điểm trừ nếu vượt quá thời gian
                        input: inputData, // Input testcase
                        output: expectedOutput, // Output testcase
                        time_limit: timelimit,
                    };
                });

                setTasks(updatedTasks);
            })
            .catch((error) => console.error("Error fetching tasks:", error));
    }, [examId]);

    // Thêm task nhưng không gửi ngay, chỉ cập nhật state
    const handleAddTask = () => {
        const defaultTask = {
            exam_id: examId,
            task_title: `Bài mới`,
            task_description: "Mô tả bài mới",
            max_score: 0,
            time_limit: 0,
            penalty_correct: 0,
            penalty_time: 0,
            input: "",
            output: ""
        };

        const updatedTasks = [...tasks, defaultTask];
        setTasks(updatedTasks);
        onSave(updatedTasks);
    };

    // Chỉnh sửa task
    const handleEditTask = (id) => {
        setIsEditing(id);
        const task = tasks.find((task) => task.id === id);
        setNewTask(task);
    };

    // Lưu task nhưng không gửi ngay, chỉ cập nhật state
    const handleSaveTask = (id) => {
        const updatedTasks = tasks.map((task) =>
            task.id === id ? { ...task, ...newTask } : task
        );
        setTasks(updatedTasks);
        setIsEditing(null);
        onSave(updatedTasks);
    };

    // Hàm xóa bài tập (chỉ đánh dấu là xóa)
    const handleDeleteTask = (id) => {
        // Gửi yêu cầu xóa bài tập
        axios.delete(`http://localhost:5000/exam-tasks/${id}`)
            .then((response) => {
                console.log('Task deleted successfully:', response.data);
                // Cập nhật lại danh sách bài tập sau khi xóa
                const updatedTasks = tasks.filter((task) => task.id !== id);
                setTasks(updatedTasks);
                onSave(updatedTasks); // Cập nhật state cho parent component
            })
            .catch((error) => {
                console.error('Error deleting task:', error);
            });
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
                <div key={task.id || task.task_title} className={styles.taskItem}>
                    {isEditing === task.id ? (
                        <div className={styles.edit_taskItem}>
                            <div className={styles.edit_taskItem_inside}>
                                <p>Tiêu đề: </p>
                                <input
                                    type="text"
                                    value={newTask.task_title}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, task_title: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.edit_taskItem_inside}>
                                <p>Đề bài: </p>
                                <textarea
                                    value={newTask.task_description}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, task_description: e.target.value })
                                    }
                                    placeholder="Mô tả bài"
                                />
                            </div>
                            <div className={styles.edit_taskItem_inside}>
                                <p>Điểm tối đa: </p>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={newTask.max_score}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, max_score: parseFloat(e.target.value) })
                                    }
                                    placeholder="Điểm tối đa"
                                />
                            </div>
                            <div className={styles.edit_taskItem_inside}>
                                <p>Thời gian tối đa: </p>
                                <input
                                    type="number"
                                    value={newTask.time_limit}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, time_limit: parseFloat(e.target.value) })
                                    }
                                    placeholder="Thời gian tối đa"
                                />
                            </div>
                            {/* <div className={styles.edit_taskItem_inside}>
                                <p>Điểm trừ: </p>
                                <input
                                    type="number"
                                    value={newTask.penalty_correct}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, penalty_correct: parseFloat(e.target.value) })
                                    }
                                    placeholder="Trừ hết điểm nếu sai kết quả"
                                    step="any"
                                />
                            </div> */}
                            <div className={styles.edit_taskItem_inside}>
                                <p>Điểm trừ nếu vượt quá thời gian: </p>
                                <input
                                    type="number"
                                    value={newTask.penalty_time}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, penalty_time: parseFloat(e.target.value) })
                                    }
                                    placeholder="Điểm trừ nếu vượt quá thời gian"
                                    step="any"
                                />
                            </div>
                            <div className={styles.edit_taskItem_inside}>
                                <p>Input: </p>
                                <input
                                    type="text"
                                    value={newTask.input}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, input: e.target.value })
                                    }
                                    placeholder="Input Testcase"
                                />
                            </div>
                            <div className={styles.edit_taskItem_inside}>
                                <p>Output: </p>
                                <input
                                    type="text"
                                    value={newTask.output}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, output: e.target.value })
                                    }
                                    placeholder="Output mong đợi"
                                />
                            </div>
                            <div className={styles.edit_taskItem_btn_container}>
                                <button onClick={() => handleSaveTask(task.id)}>Lưu</button>
                                <button onClick={() => setIsEditing(null)}>Hủy</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h5>{task.task_title}</h5>
                            <p>{task.task_description}</p>
                            <p>Điểm tối đa: {task.max_score} điểm</p>
                            <p>Thời gian tối đa: {task.time_limit}s</p>
                            <p>Trừ hết điểm nếu sai kết quả: {task.penalty_correct} điểm</p>
                            <p>Điểm trừ nếu vượt quá thời gian: {task.penalty_time} điểm</p>
                            <p>Input: {task.input}</p>
                            <p>Output: {task.output}</p>
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
