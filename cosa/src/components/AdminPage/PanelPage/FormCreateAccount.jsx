import React from "react";
import styles from "./FormCreateAccount.module.css"
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";

function FormCreateAccount() {
    const navigate = useNavigate();
    const context = useOutletContext();
    const userRole = localStorage.getItem("role");
    const handleFormAdmin = () => {
        navigate("form-admin");
    };
    const handleFormTeacher = () => {
        navigate("form-teacher");
    };
    const handleFormStudent = () => {
        navigate("form-student");
    };

    return (
        <div> {/*day la 1 outlet*/}
            <div className={styles.outlet_account}>
                <p className={styles.pt}>Form cấp phát</p>
                <div className={styles.outlet_account1}>
                    {userRole !== "teacher" && (
                        <div className={styles.outlet_account2}>
                            <div onClick={handleFormAdmin}><p>Admin</p></div>
                            <div onClick={handleFormTeacher}><p>Giáo viên</p></div>
                            <div onClick={handleFormStudent}><p>Thí sinh</p></div>
                        </div>
                    )}
                    {userRole !== "admin" && (
                        <div className={styles.outlet_account2}>
                            <div onClick={handleFormStudent}><p>Thí sinh</p></div>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.create_form}>
                <Outlet context={context} />
            </div>
        </div>
    );
}

export default FormCreateAccount;