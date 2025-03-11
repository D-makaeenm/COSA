import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../FormCreateAccount/Form.module.css";
import axios from "axios";
import config from "../../../../config";

function EditStudent() {
    const { state } = useLocation();
    const student = state?.student;
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [examId, setExamId] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.password) {
            delete data.password;
        }

        try {
            const response = await axios.post(
                `${config.apiBaseUrl}/admin/edit-student`, // Đặt URL API chỉnh sửa
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


    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${config.apiBaseUrl}/management/exams`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContests(response.data.data); // Gán dữ liệu từ API
            } catch (error) {
                console.error("Lỗi khi lấy danh sách cuộc thi:", error);
            }
        };

        fetchContests();
    }, []);

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
                            <label htmlFor="contest">Cuộc thi</label>
                            <select
                                id="contest"
                                name="exam_id"
                                value={examId}
                                onChange={(e) => setExamId(e.target.value)}
                            >
                                <option value="">Chọn cuộc thi</option>
                                {contests.map((contest) => (
                                    <option key={contest.id} value={contest.id}>
                                        {contest.title} ({contest.status})
                                    </option>
                                ))}
                            </select>
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

                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                pattern="^\d{10,15}$"
                                placeholder="Nhập số điện thoại (10-15 số)"
                                defaultValue={student?.phone || ""}
                                
                            />

                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@domain.com"
                                defaultValue={student?.email || ""}
                                
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