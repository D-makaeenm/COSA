import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";
import { Tooltip } from "react-tooltip";
import styles from "./EditContest.module.css";

function GradingCriteria({ examId, onSave }) {
    const [criteriaList, setCriteriaList] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [newCriteria, setNewCriteria] = useState({
        criteria_name: "",
        penalty: 0,
    });

    const backendUrl = "http://localhost:5000/grading-criteria";

    // Fetch grading criteria khi component được mount
    useEffect(() => {
        axios
            .get(`${backendUrl}/${examId}`)
            .then((response) => setCriteriaList(response.data))
            .catch((error) => console.error("Error fetching grading criteria:", error));
    }, [examId]);

    // Thêm tiêu chí nhưng không gửi ngay, chỉ cập nhật state
    const handleAddCriteria = (taskId) => {
        const defaultCriteria = {
            task_id: taskId,
            criteria_name: `Tiêu chí mới`,
            penalty: 0,
        };

        setCriteriaList([...criteriaList, defaultCriteria]);
        onSave([...criteriaList, defaultCriteria]);
    };

    // Chỉnh sửa tiêu chí
    const handleEditCriteria = (id) => {
        setIsEditing(id);
        const criteria = criteriaList.find((criteria) => criteria.id === id);
        setNewCriteria(criteria);
    };

    // Lưu tiêu chí nhưng không gửi ngay, chỉ cập nhật state
    const handleSaveCriteria = (id) => {
        const updatedCriteria = criteriaList.map((criteria) =>
            criteria.id === id ? { ...criteria, ...newCriteria } : criteria
        );
        setCriteriaList(updatedCriteria);
        setIsEditing(null);
        onSave(updatedCriteria);
    };

    // Xóa tiêu chí
    const handleDeleteCriteria = (id) => {
        const updatedCriteria = criteriaList.filter((criteria) => criteria.id !== id);
        setCriteriaList(updatedCriteria);
        onSave(updatedCriteria);
    };

    return (
        <div className={styles.grading_criteria_container}>
            <div className={styles.grading_criteria_title}>
                <h4>Tiêu chí chấm điểm</h4>
            </div>

            {criteriaList.map((criteria) => (
                <div key={criteria.id || criteria.criteria_name} className={styles.grading_criteria_Item}>
                    {isEditing === criteria.id ? (
                        <div className={styles.edit_criteriaItem}>
                            <input
                                type="text"
                                value={newCriteria.criteria_name}
                                onChange={(e) =>
                                    setNewCriteria({ ...newCriteria, criteria_name: e.target.value })
                                }
                                placeholder="Tên tiêu chí"
                            />
                            <input
                                type="number"
                                value={newCriteria.penalty}
                                onChange={(e) =>
                                    setNewCriteria({ ...newCriteria, penalty: parseFloat(e.target.value) })
                                }
                                placeholder="Điểm trừ"
                                step="any"
                            />
                            <div className={styles.edit_criteriaItem_btn_container}>
                                <button onClick={() => handleSaveCriteria(criteria.id)}>Lưu</button>
                                <button onClick={() => setIsEditing(null)}>Hủy</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h5>{criteria.criteria_name}</h5>
                            <p>Điểm trừ: {criteria.penalty}</p>
                            <div className={styles.button3}>
                                <button className={styles.button3_edit} onClick={() => handleEditCriteria(criteria.id)}>Sửa</button>
                                <button className={styles.button3_del} onClick={() => handleDeleteCriteria(criteria.id)}>Xóa</button>
                            </div>
                        </>
                    )}
                </div>
            ))}

            <div className={styles.add_criteria_container}>
                <h5>Thêm tiêu chí</h5>
                <div
                    id="add_grading_criteria"
                    onClick={() => handleAddCriteria(criteriaList[0]?.task_id || 1)}
                    className={styles.addIcon}
                >
                    <FontAwesomeIcon icon={icons.circleplus} />
                </div>
                <Tooltip anchorId="add_grading_criteria" content="Thêm tiêu chí mới" />
            </div>
        </div>
    );
}

export default GradingCriteria;
