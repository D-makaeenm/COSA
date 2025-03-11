import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./List.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";
import config from "../../../../config";

function ListStudent() {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/admin/list-student`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching student data", error);
            }
        };
        fetchStudents();
    }, []);

    const handleEditClick = (student) => {
        navigate("/admin/createUser/edit-account-student", { state: { student } });
    };


    const handleDelete = async (username) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc chắn muốn xóa tài khoản thí sinh này?"
        );
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(
                `${config.apiBaseUrl}/admin/delete-student`,
                {
                    data: { username },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            alert(response.data.message || "Xóa thành công!");

            // Cập nhật danh sách sinh viên
            setStudents((prevStudents) =>
                prevStudents.filter((student) => student.username !== username)
            );
        } catch (error) {
            alert(
                error.response?.data?.error || "Đã xảy ra lỗi khi xóa tài khoản. Vui lòng thử lại."
            );
        }
    };

    return (
        <div>
            <h2>Danh sách Thí Sinh</h2>
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
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.username}</td>
                            <td>{student.name}</td>
                            <td>{student.phone}</td>
                            <td>{student.email}</td>
                            <td>{new Date(student.created_at).toLocaleString()}</td>
                            <td>
                                <div>
                                    <button className={styles.btnEdit} onClick={() => handleEditClick(student)}><FontAwesomeIcon icon={icons.edit} className={styles.iconcustom} /></button>
                                    <button className={styles.btnDelete} onClick={() => handleDelete(student.username)}><FontAwesomeIcon icon={icons.delete} className={styles.iconcustom} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListStudent;
