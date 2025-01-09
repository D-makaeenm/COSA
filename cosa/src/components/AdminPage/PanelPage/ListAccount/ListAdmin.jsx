import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./List.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../../../FontAwesome/icons";

function ListAdmin() {
    const [admins, setAdmins] = useState([]);
    const navigate = useNavigate();

    // Gọi API để lấy danh sách admin
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get("http://localhost:5000/admin/list-admins", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setAdmins(response.data);
            } catch (error) {
                console.error("Error fetching admins:", error.response?.data || error.message);
            }
        };

        fetchAdmins();
    }, []);

    const handleEditClick = (admin) => {
        navigate("/admin/createUser/edit-account-admin", { state: { admin } });
    };


    const handleDelete = async (username) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc chắn muốn xóa tài khoản admin này?"
        );
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(
                "http://localhost:5000/admin/delete-admin",
                {
                    data: { username },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            alert(response.data.message || "Xóa thành công!");

            setAdmins((prevAdmins) =>
                prevAdmins.filter((admin) => admin.username !== username)
            );
        } catch (error) {
            alert(
                error.response?.data?.error || "Đã xảy ra lỗi khi xóa tài khoản. Vui lòng thử lại."
            );
        }
    };

    return (
        <div className={styles.container}>
            <h3>Danh sách Admin</h3>
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
                    {admins.map((admin) => (
                        <tr key={admin.id}>
                            <td>{admin.id}</td>
                            <td>{admin.username}</td>
                            <td>{admin.name}</td>
                            <td>{admin.phone}</td>
                            <td>{admin.email}</td>
                            <td>{new Date(admin.created_at).toLocaleString()}</td>
                            <td>
                                <div>
                                    <button className={styles.btnEdit} onClick={() => handleEditClick(admin)}><FontAwesomeIcon icon={icons.edit} className={styles.iconcustom} /></button>
                                    <button className={styles.btnDelete} onClick={() => handleDelete(admin.username)}><FontAwesomeIcon icon={icons.delete} className={styles.iconcustom} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListAdmin;
