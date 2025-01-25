import React, { useState } from "react";
import styles from "./EditContest.module.css";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";

function TestCases() {
    const [testcases, setTestcases] = useState([
        { id: 1, input: "1,2,3", expected_output: "6", execution_time: 0.5 },
        { id: 2, input: "10", expected_output: "55", execution_time: 1 },
    ]);
    const [isEditing, setIsEditing] = useState(null); // ID của testcase đang được sửa
    const [newTestcase, setNewTestcase] = useState({ input: "", expected_output: "", execution_time: 0 });

    const handleAddTestcase = () => {
        const newId = testcases.length > 0 ? testcases[testcases.length - 1].id + 1 : 1;
        const defaultTestcase = {
            id: newId,
            input: "Dữ liệu đầu vào",
            expected_output: "Kết quả mong muốn",
            execution_time: 1, // Thời gian mặc định (1 giây)
        };
        setTestcases([...testcases, defaultTestcase]); // Thêm testcase mới
    };

    const handleEditTestcase = (id) => {
        setIsEditing(id);
    };

    const handleSaveTestcase = (id) => {
        setTestcases(
            testcases.map((testcase) =>
                testcase.id === id ? { ...testcase, ...newTestcase } : testcase
            )
        );
        setIsEditing(null);
    };

    const handleDeleteTestcase = (id) => {
        setTestcases(testcases.filter((testcase) => testcase.id !== id));
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
                                        setNewTestcase({ ...testcase, input: e.target.value })
                                    }
                                    placeholder="Input"
                                />
                                <input
                                    type="text"
                                    value={newTestcase.expected_output || testcase.expected_output}
                                    onChange={(e) =>
                                        setNewTestcase({ ...testcase, expected_output: e.target.value })
                                    }
                                    placeholder="Expected Output"
                                />
                                <input
                                    type="number"
                                    step="any"
                                    min = "0"
                                    value={newTestcase.execution_time || testcase.execution_time}
                                    onChange={(e) =>
                                        setNewTestcase({ ...testcase, execution_time: parseFloat(e.target.value) })
                                    }
                                    placeholder="Execution Time (seconds)"
                                />
                                <div className={styles.button2}>
                                    <button onClick={() => handleSaveTestcase(testcase.id)}>Lưu</button>
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
