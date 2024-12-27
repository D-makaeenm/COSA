import React from "react";
import styles from "./Footer.module.css";

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.ft_inf}>
                <p>Copyright © 2020 Trường Đại Học Kỹ thuật Công nghiệp</p>
                <p>Version: CNTN-2024.12M.04 (updated 2024-12-24 17:57)</p>
                <p>Design by BDuyDev</p>
            </div>
        </footer>
    );
}

export default Footer;
