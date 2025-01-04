import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icons from "../FontAwesome/icons"; // Đường dẫn đến file `icons.js`
import styles from "./SideBar.module.css";
import logo from "../../assets/images/logo.png"
import { useNavigate } from "react-router-dom";

function SideBar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed); // Đổi trạng thái mở/thu gọn
    };

    return(
        <div className={styles.sidebar} style={{ width: isCollapsed ? "80px" : "250px" }}>
            <div className={styles.zoom_btn} onClick={handleToggle}>
                {isCollapsed ? (
                    <div className={styles.abc1}>
                        <FontAwesomeIcon icon={icons.arrowRight} className={styles.iconzoomin} />
                    </div>
                ) : (
                    <div className={styles.abc}>
                        <img src={logo} alt="logo.jpg" />
                        <FontAwesomeIcon icon={icons.arrowLeft} className={styles.iconzoomout}/>
                    </div>
                )}
            </div>
            <div className={styles.btn_panel}>
                <div
                    style={{
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        padding: isCollapsed ? "10px 0" : "10px 0 10px 10px",
                        margin: isCollapsed ? "auto" : "10px"
                    }}
                    onClick={() => navigate("/admin/home")}
                >
                    <FontAwesomeIcon icon={icons.house} className={styles.iconcustom}/>
                    {!isCollapsed && <span>Trang chủ</span>}
                </div>
                <div
                    style={{
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        padding: isCollapsed ? "10px 0" : "10px 0 10px 10px",
                        margin: isCollapsed ? "auto" : "10px"
                    }}
                    onClick={() => navigate("/admin/createUser")}
                >
                    <FontAwesomeIcon icon={icons.user} className={styles.iconcustom}/>
                    {!isCollapsed && <span>Tạo tài khoản</span>}
                </div>
                <div
                    style={{
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        padding: isCollapsed ? "10px 0" : "10px 0 10px 10px",
                        margin: isCollapsed ? "auto" : "10px"
                    }}
                >
                    <FontAwesomeIcon icon={icons.list} className={styles.iconcustom}/>
                    {!isCollapsed && <span>Danh sách cuộc thi</span>}
                </div>
                <div
                    style={{
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        padding: isCollapsed ? "10px 0" : "10px 0 10px 10px",
                        margin: isCollapsed ? "auto" : "10px"
                    }} onClick={() => navigate("/admin/reports")}
                >
                    <FontAwesomeIcon icon={icons.chart} className={styles.iconcustom}/>
                    {!isCollapsed && <span>Báo cáo, Thống kê</span>}
                </div>
            </div>
        </div>
    );
}

export default SideBar;