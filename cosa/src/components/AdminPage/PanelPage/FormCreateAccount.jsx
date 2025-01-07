import React from "react";
import styles from "./FormCreateAccount.module.css"
import { Outlet, useNavigate } from "react-router-dom";

function FormCreateAccount() {
    const navigate = useNavigate();

    const handleFormAdmin = () => {
        navigate("form-admin");
    };

    return (
        <div> {/*day la 1 outlet*/}
            <div className={styles.outlet_account}>
                <p className={styles.pt}>Form cấp phát</p>
                <div className={styles.outlet_account1}>
                    <div onClick={handleFormAdmin}><p>Admin</p></div>
                    <div><p>Giáo viên</p></div>
                    <div><p>Thí sinh</p></div>
                </div>
            </div>
            <div className={styles.create_form}>
                <Outlet />
            </div>
        </div>
    );
}

export default FormCreateAccount;