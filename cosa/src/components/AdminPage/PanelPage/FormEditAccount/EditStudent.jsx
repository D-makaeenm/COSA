import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../FormCreateAccount/Form.module.css";
import axios from "axios";

function EditStudent() {
    const { state } = useLocation();
    const student = state?.student;
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
                "http://localhost:5000/admin/edit-student", // Đặt URL API chỉnh sửa
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            alert(response.data.message || "Account editing successfully!");
            e.target.reset();
            navigate("/admin/createUser/list-student"); 
        } catch (error) {
            const errorMessage =
                error.response?.data?.error || "Something went wrong. Please try again.";
            alert(errorMessage);
        }
    };

    return (
        <div className={styles.div_create_account}>
            <h3>Sửa tài khoản thí sinh</h3>
            <div className={styles.divform}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_container}>
                        <div className={styles.form_left}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={student?.username || ""}
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
                                defaultValue={student?.name || ""}
                                required
                            />

                            <label htmlFor="department">Khoa</label>
                            <input
                                id="department"
                                name="department"
                                type="text"
                                placeholder="Nhập tên Khoa"
                                defaultValue={student?.department || ""}
                                required
                            />

                            <label htmlFor="student_class">Lớp</label>
                            <input
                                id="student_class"
                                name="student_class"
                                type="text"
                                placeholder="Nhập tên Lớp"
                                defaultValue={student?.student_class || ""}
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

export default EditStudent;