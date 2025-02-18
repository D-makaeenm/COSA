import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";
import { Tooltip } from "react-tooltip";
import styles from "./EditContest.module.css";

function TestCases({ examId, onSave }) {
    const [testcases, setTestcases] = useState([]);
    const [isEditing, setIsEditing] = useState(null); // ID của testcase đang được sửa
    const [newTestcase, setNewTestcase] = useState({
        input: "",
        expected_output: "",
        execution_time: 0,
    });

    const backendUrl = "http://localhost:5000/exam-tasks"; // API backend

    // Fetch testcases khi component được mount
    useEffect(() => {
        axios
            .get(`${backendUrl}/${examId}`)
            .then((response) => {
                setTestcases(response.data); // Cập nhật testcases từ backend
            })
            .catch((error) => console.error("Error fetching testcases:", error));
    }, [examId]);

    // Thêm testcase nhưng không gửi ngay, chỉ cập nhật state
    const handleAddTestcase = () => {
        const defaultTestcase = {
            exam_id: examId,
            input: "Dữ liệu đầu vào",
            expected_output: "Kết quả mong muốn",
            execution_time: 1, // Thời gian mặc định (1 giây)
        };
        const updatedTestcases = [...testcases, defaultTestcase];
        setTestcases(updatedTestcases);
        onSave(updatedTestcases); // Gửi danh sách testcases lên ContestDetails
    };


    // Chỉnh sửa testcase
    const handleEditTestcase = (id) => {
        setIsEditing(id);
        const testcase = testcases.find((testcase) => testcase.id === id);
        setNewTestcase(testcase);  // Cập nhật newTestcase với dữ liệu testcase cần sửa
    };

    // Lưu testcase đã chỉnh sửa
    const handleSaveTestcase = (id) => {
        const updatedTestcases = testcases.map((testcase) =>
            testcase.id === id ? { ...testcase, ...newTestcase } : testcase
        );
        setTestcases(updatedTestcases);
        setIsEditing(null);
        onSave(updatedTestcases);  // Gửi danh sách testcases lên ContestDetails
    };

    // Xóa testcase
    const handleDeleteTestcase = (id) => {
        const updatedTestcases = testcases.filter((testcase) => testcase.id !== id);
        setTestcases(updatedTestcases);
        onSave(updatedTestcases);  // Gửi danh sách testcases đã thay đổi lên ContestDetails
    };

    return (
        <div className={styles.testcases_container}>
            <div className={styles.testcases_title}>
                <h4>TestCases</h4>
                <div
                    id="add_testcases"
                    onClick={handleAddTestcase} // Gắn sự kiện thêm testcase
                    className={styles.addIcon}
                >
                    <FontAwesomeIcon icon={icons.circleplus} />
                </div>
                <Tooltip anchorId="add_testcases" content="Thêm testcase" />
            </div>

            {testcases.map((testcase) => (
                <div key={testcase.id} className={styles.testcaseItem}>
                    {isEditing === testcase.id ? (
                        <>
                            <div className={styles.edit_testcaseItem}>
                                <input
                                    type="text"
                                    value={newTestcase.input || testcase.input}
                                    onChange={(e) =>
                                        setNewTestcase({ ...newTestcase, input: e.target.value })
                                    }
                                    placeholder="Input"
                                />
                                <input
                                    type="text"
                                    value={newTestcase.expected_output || testcase.expected_output}
                                    onChange={(e) =>
                                        setNewTestcase({ ...newTestcase, expected_output: e.target.value })
                                    }
                                    placeholder="Expected Output"
                                />
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={newTestcase.execution_time || testcase.execution_time}
                                    onChange={(e) =>
                                        setNewTestcase({ ...newTestcase, execution_time: parseFloat(e.target.value) })
                                    }
                                    placeholder="Execution Time (seconds)"
                                />
                                <div className={styles.button2}>
                                    <button onClick={() => handleSaveTestcase(testcase.id)}>Lưu</button>
                                    <button onClick={() => setIsEditing(null)}>Hủy</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <p><b>Input:</b> {testcase.input}</p>
                            <p><b>Expected Output:</b> {testcase.expected_output}</p>
                            <p><b>Execution Time:</b> {testcase.execution_time} giây</p>
                            <div className={styles.button3}>
                                <button
                                    className={styles.button3_edit}
                                    onClick={() => handleEditTestcase(testcase.id)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className={styles.button3_del}
                                    onClick={() => handleDeleteTestcase(testcase.id)}
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

export default TestCases;
