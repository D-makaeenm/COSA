import React from "react";
import styles from "./Navbar.module.css";
import logos from "../../assets/images/logo.png";

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <img src={logos} alt="logo.jpg" />
            </div>
            <div className={styles.slogan}>
                <p> ĐẠI HỌC KỸ THUẬT CÔNG NGHIỆP <br /> ĐẠI HỌC THÁI NGUYÊN</p>
            </div>
        </nav>
    );
}

export default Navbar;
