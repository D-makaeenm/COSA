import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ContestInfo.module.css";

function AddStudent() {
    const { id: contestId } = useParams(); // Lấy contestId từ URL
    const [students, setStudents] = useState([]); // Danh sách thí sinh chưa tham gia
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Trạng thái lỗi
    const navigate = useNavigate();

    useEffect(() => {
        // Gọi API để lấy danh sách thí sinh chưa tham gia cuộc thi
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem("token"); // Lấy token từ localStorage
                const response = await axios.get(
                    `http://localhost:5000/admin/list-student/${contestId}`, // API mới
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Thêm token vào headers
                        },
                    }
                );
                setStudents(response.data); // Cập nhật danh sách thí sinh
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách thí sinh.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [contestId]);

    const handleAddStudent = async (studentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn thêm thí sinh này vào cuộc thi?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            await axios.post(
                `http://localhost:5000/management/exams/add-participant`,
                {
                    exam_id: contestId,
                    user_id: studentId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Thí sinh đã được thêm vào cuộc thi.");
            // Cập nhật danh sách thí sinh sau khi thêm
            setStudents((prevStudents) =>
                prevStudents.filter((student) => student.id !== studentId)
            );
        } catch (err) {
            console.error("Lỗi:", err);
            alert("Có lỗi xảy ra khi thêm thí sinh vào cuộc thi.");
        }
    };

    if (loading) {
        return <p>Đang tải danh sách thí sinh...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    const handleBackToContestInfo = () => {
        navigate(`/admin/list-contest/contests/${contestId}`, { state: { reload: true } }); // Gửi trạng thái 'reload'
    };
    
    return (
        <div>
            <div onClick={handleBackToContestInfo} className={styles.btnback}>
                Quay lại
            </div>
            <div className={styles.title}>
                <h1>Danh sách thí sinh chưa tham gia cuộc thi này</h1>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Họ và tên</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.username}</td>
                            <td>{student.name}</td>
                            <td>{student.phone}</td>
                            <td>{student.email}</td>
                            <td>
                                <button
                                    onClick={() => handleAddStudent(student.id)}
                                    className={styles.add_button}
                                >
                                    Thêm
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AddStudent;
