import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./EditContest.module.css";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";

function GradingCriteria({ examId }) {
    const [criteria, setCriteria] = useState([]); // Danh sách tiêu chí
    const [isEditing, setIsEditing] = useState(null); // ID của tiêu chí đang được sửa
    const [newCriteria, setNewCriteria] = useState({ criteria_name: "", max_score: 0, description: "" });
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [error, setError] = useState(null); // Trạng thái lỗi

    // Gọi API để lấy danh sách tiêu chí
    useEffect(() => {
        const fetchCriteria = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/grading-criteria/${examId}`);
                setCriteria(response.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách tiêu chí");
            } finally {
                setLoading(false);
            }
        };

        fetchCriteria();
    }, [examId]); // Thêm examId vào mảng dependencies để gọi lại API khi examId thay đổi

    const handleAddCriteria = () => {
        const newId = criteria.length > 0 ? criteria[criteria.length - 1].id + 1 : 1;
        const defaultCriteria = {
            id: newId,
            criteria_name: `Tiêu chí ${newId}`,
            description: "Mô tả tiêu chí mới",
            max_score: 0,
        };
        setCriteria([...criteria, defaultCriteria]);
    };

    const handleEditCriteria = (id) => {
        setIsEditing(id);
        const editingCriteria = criteria.find((criterion) => criterion.id === id);
        setNewCriteria(editingCriteria);
    };

    const handleSaveCriteria = (id) => {
        setCriteria(
            criteria.map((criterion) =>
                criterion.id === id ? { ...criterion, ...newCriteria } : criterion
            )
        );
        setIsEditing(null);
    };

    const handleDeleteCriteria = (id) => {
        setCriteria(criteria.filter((criterion) => criterion.id !== id));
    };

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div className={styles.grading_criteria_container}>
            <div className={styles.grading_criteria_title}>
                <h4>Tiêu chí</h4>
                <div
                    id="add_grading_criteria"
                    onClick={handleAddCriteria}
                    className={styles.addIcon}
                >
                    <FontAwesomeIcon icon={icons.circleplus} />
                </div>
                <Tooltip anchorId="add_grading_criteria" content="Thêm tiêu chí" />
            </div>

            {criteria.map((criterion) => (
                <div key={criterion.id} className={styles.criteriaItem}>
                    {isEditing === criterion.id ? (
                        <div className={styles.edit_criteriaItem}>
                            <input
                                type="text"
                                value={newCriteria.criteria_name}
                                onChange={(e) =>
                                    setNewCriteria({ ...newCriteria, criteria_name: e.target.value })
                                }
                                placeholder="Tiêu chí"
                            />
                            <textarea
                                value={newCriteria.description}
                                onChange={(e) =>
                                    setNewCriteria({ ...newCriteria, description: e.target.value })
                                }
                                placeholder="Mô tả"
                            />
                            <input
                                type="number"
                                value={newCriteria.max_score}
                                onChange={(e) =>
                                    setNewCriteria({ ...newCriteria, max_score: Number(e.target.value) })
                                }
                                placeholder="Điểm tối đa"
                            />
                            <div className={styles.button2}>
                                <button onClick={() => handleSaveCriteria(criterion.id)}>Lưu</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h5>{criterion.criteria_name}</h5>
                            <p>{criterion.description}</p>
                            <p>Điểm tối đa: {criterion.max_score}</p>
                            <div className={styles.button3}>
                                <button
                                    className={styles.button3_edit}
                                    onClick={() => handleEditCriteria(criterion.id)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className={styles.button3_del}
                                    onClick={() => handleDeleteCriteria(criterion.id)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default GradingCriteria;
