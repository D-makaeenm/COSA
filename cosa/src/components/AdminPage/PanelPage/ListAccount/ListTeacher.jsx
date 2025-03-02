import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./List.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";

function ListTeacher() {
    const [teachers, setTeachers] = useState([]);
    const navigate = useNavigate();
    const userRole = localStorage.getItem("role");
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get("http://localhost:5000/admin/list-teacher", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setTeachers(response.data);
            } catch (error) {
                console.error("Error fetching teacher data", error);
            }
        };
        fetchTeachers();
    }, []);

    const handleEditClick = (teacher) => {
        navigate("/admin/createUser/edit-account-teacher", { state: { teacher } });
    };


    const handleDelete = async (username) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc chắn muốn xóa tài khoản giáo viên này?"
        );
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(
                "http://localhost:5000/admin/delete-teacher",
                {
                    data: { username },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            alert(response.data.message || "Xóa thành công!");

            setTeachers((prevTeachers) =>
                prevTeachers.filter((teacher) => teacher.username !== username)
            );
        } catch (error) {
            alert(
                error.response?.data?.error || "Đã xảy ra lỗi khi xóa tài khoản. Vui lòng thử lại."
            );
        }
    };

    return (
        <div>
            <h2>Danh sách Giáo Viên</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Họ và tên</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Ngày tạo</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td>{teacher.id}</td>
                            <td>{teacher.username}</td>
                            <td>{teacher.name}</td>
                            <td>{teacher.phone}</td>
                            <td>{teacher.email}</td>
                            <td>{new Date(teacher.created_at).toLocaleString()}</td>
                            <td>
                                {userRole !== "teacher" && (
                                    <div>
                                        <button className={styles.btnEdit} onClick={() => handleEditClick(teacher)}><FontAwesomeIcon icon={icons.edit} className={styles.iconcustom} /></button>
                                        <button className={styles.btnDelete} onClick={() => handleDelete(teacher.username)}><FontAwesomeIcon icon={icons.delete} className={styles.iconcustom} /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListTeacher;
