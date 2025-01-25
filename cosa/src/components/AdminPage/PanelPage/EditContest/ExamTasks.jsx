import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
import styles from "./EditContest.module.css";
import React, { useState } from "react";

function ExamTasks() {
    const [tasks, setTasks] = useState([
        { id: 1, task_title: "Bài 1: Tính tổng", task_description: "Viết chương trình tính tổng số nguyên dương nhỏ hơn n", max_score: 3 },
        { id: 2, task_title: "Bài 2: Số nguyên tố", task_description: "Viết chương trình liệt kê các số nguyên tố nhỏ hơn n", max_score: 3 },
    ]);
    const [isEditing, setIsEditing] = useState(null); // ID của câu hỏi đang được sửa
    const [newTask, setNewTask] = useState({ task_title: "", task_description: "", max_score: 0 });

    const handleAddTask = () => {
        const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        const defaultTask = {
            id: newId,
            task_title: `Bài ${newId}: Tên bài mới`,
            task_description: "Mô tả bài mới",
            max_score: 0,
        };
        setTasks([...tasks, defaultTask]); // Thêm câu hỏi mới
    };

    const handleEditTask = (id) => {
        setIsEditing(id);
    };

    const handleSaveTask = (id) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, ...newTask } : task
            )
        );
        setIsEditing(null);
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    return (
        <div className={styles.exam_tasks_container}>
            <div className={styles.exam_tasks_title}>
                <h4>Câu hỏi</h4>
                <div
                    id="add_exam_tasks"
                    onClick={handleAddTask} // Gắn sự kiện thêm task
                    className={styles.addIcon} // Style riêng nếu cần
                >
                    <FontAwesomeIcon icon={icons.circleplus} />
                </div>
                <Tooltip anchorId="add_exam_tasks" content="Thêm câu hỏi" />
            </div>

            {tasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                    {isEditing === task.id ? (
                        <>
                            <div className={styles.edit_taskItem}>
                                <input
                                    type="text"
                                    value={newTask.task_title || task.task_title}
                                    onChange={(e) =>
                                        setNewTask({ ...task, task_title: e.target.value })
                                    }
                                    placeholder="Tên bài"
                                />
                                <textarea
                                    value={newTask.task_description || task.task_description}
                                    onChange={(e) =>
                                        setNewTask({ ...task, task_description: e.target.value })
                                    }
                                    placeholder="Mô tả bài"
                                />
                                <input
                                    type="number"
                                    value={newTask.max_score || task.max_score}
                                    onChange={(e) =>
                                        setNewTask({ ...task, max_score: Number(e.target.value) })
                                    }
                                    placeholder="Điểm tối đa"
                                />
                                <div className={styles.button2}>
                                    <button onClick={() => handleSaveTask(task.id)}>Lưu</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h5>{task.task_title}</h5>
                            <p>{task.task_description}</p>
                            <p>Điểm tối đa: {task.max_score}</p>
                            <div className={styles.button3}>
                                <button
                                    className={styles.button3_edit}
                                    onClick={() => handleEditTask(task.id)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className={styles.button3_del}
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ExamTasks;
