import React from "react";
import styles from "./CreateAccPage.module.css"

function CreateAccPage() {

    return (
        <div className={styles.main_container}>
            <div>
                <h1>Cấp phát tài khoản</h1>
            </div>
            <div className={styles.second_container}>
                <div className={styles.main_form}>
                    <div className={styles.outlet_account}>
                        <div><p>Admin</p></div>
                        <div><p>Giáo viên</p></div>
                        <div><p>Thí sinh</p></div>
                    </div>
                    <div className={styles.create_form}>
                        outlet o day
                    </div>
                </div>
                <div className={styles.panel_button}>
                    <div className={styles.panel_button_title}>
                        <p>Tài khoản</p>
                    </div>
                    <div className={styles.panel_button_type}>
                        <div><p>Admin</p></div>
                        <div><p>Giáo Viên</p></div>
                        <div><p>Thí sinh</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAccPage;