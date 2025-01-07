import React from "react";
import styles from "./CreateAccPage.module.css";
import { Outlet, useNavigate } from "react-router-dom";

function CreateAccPage() {
    const navigate = useNavigate();

    const handleAdminNavigate = () => {
        navigate("list/list-admin");
    };
    const handleTeacherNavigate = () => {
        navigate("list/list-teacher");
    };
    const handleStudentNavigate = () => {
        navigate("list/list-student");
    };

    return (
        <div className={styles.main_container}>
            <div>
                <h1>Cấp phát tài khoản</h1>
            </div>
            <div className={styles.second_container}>
                <div className={styles.main_form}>
                    <Outlet />
                </div>
                <div className={styles.panel_button}>
                    <div className={styles.panel_button_title}>
                        <p>Danh sách tài khoản</p>
                    </div>
                    <div className={styles.panel_button_type}>
                        <div onClick={handleAdminNavigate}>
                            <p>Admin: {/* Thêm số lượng tài khoản */}</p>
                        </div>
                        <div onClick={handleTeacherNavigate}>
                            <p>Giáo Viên: {/*Số lượng*/}</p>
                        </div>
                        <div onClick={handleStudentNavigate}>
                            <p>Thí sinh: {/*Số lượng*/}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAccPage;