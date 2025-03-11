import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../FormCreateAccount/Form.module.css";
import axios from "axios";
import config from "../../../../config";

function EditTeacher() {
    const { state } = useLocation();
    const teacher = state?.teacher;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.password) {
            delete data.password;
        }

        try {
            const response = await axios.post(
                `${config.apiBaseUrl}/admin/edit-teacher`, // Đặt URL API chỉnh sửa
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            alert(response.data.message || "Account editing successfully!");
            e.target.reset();
            navigate("/admin/createUser/list-teacher");
        } catch (error) {
            const errorMessage =
                error.response?.data?.error || "Something went wrong. Please try again.";
            alert(errorMessage);
        }
    };

    return (
        <div className={styles.div_create_account}>
            <h3>Sửa tài khoản giáo viên</h3>
            <div className={styles.divform}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_container}>
                        <div className={styles.form_left}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={teacher?.username || ""}
                                readOnly
                            />

                            <label htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" placeholder="Password" /> {/*Cái này có cho sửa*/}
                        </div>

                        <div className={styles.form_right}>
                            <label htmlFor="name">Họ và tên</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Nhập Họ tên"
                                defaultValue={teacher?.name || ""}
                                required
                            />

                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                pattern="^\d{10,15}$"
                                placeholder="Nhập số điện thoại (10-15 số)"
                                defaultValue={teacher?.phone || ""}
                                required
                            />

                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@domain.com"
                                defaultValue={teacher?.email || ""}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.button_container}>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTeacher;