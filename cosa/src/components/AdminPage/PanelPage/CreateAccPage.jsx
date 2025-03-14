import React, { useEffect, useState } from "react";
import styles from "./CreateAccPage.module.css";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import config from "../../../config";

function CreateAccPage() {
    const navigate = useNavigate();
    const [accountCounts, setAccountCounts] = useState({
        admin: 0,
        teacher: 0,
        student: 0,
    });

    const userRole = localStorage.getItem("role");

    const fetchAccountCounts = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/admin/account-counts`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setAccountCounts(response.data);
        } catch (error) {
            console.error("Failed to fetch account counts:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchAccountCounts();
    }, []);

    return (
        <div className={styles.main_container}>
            <div>
                <h1>Cấp phát tài khoản</h1>
            </div>
            <div className={styles.second_container}>
                <div className={styles.main_form}>
                    {/* Truyền context qua Outlet */}
                    <Outlet context={{ fetchAccountCounts, navigate }} />
                </div>
                <div className={styles.panel_button}>
                    <div className={styles.panel_button_title}>
                        <p>Danh sách tài khoản</p>
                    </div>
                    <div className={styles.panel_button_type}>
                        {userRole !== "teacher" && (
                            <div onClick={() => navigate("list-admin")}>
                                <p>Admin: {accountCounts.admin} tài khoản</p>
                            </div>
                        )}
                        <div onClick={() => navigate("list-teacher")}>
                            <p>Giáo Viên: {accountCounts.teacher} tài khoản</p>
                        </div>
                        <div onClick={() => navigate("list-student")}>
                            <p>Thí sinh: {accountCounts.student} tài khoản</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAccPage;
