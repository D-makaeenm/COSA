import React, { useState } from "react";
import styles from "./Reports.module.css";

function Reports() {
    const [selectedOption, setSelectedOption] = useState("all");

    const handleChange = (event) => {
        setSelectedOption(event.target.id);
    };

    return (
        <div>
            <h1>Báo Cáo, Thống Kê</h1>

            {/* Dropdown */}
            <div className={styles.select}>
                <div
                    className={styles.selected}
                    data-default="All"
                    data-one="option-1"
                    data-two="option-2"
                    data-three="option-3"
                >
                    <span>
                        {selectedOption === "all"
                            ? "All"
                            : selectedOption === "option-1"
                            ? "Option 1"
                            : selectedOption === "option-2"
                            ? "Option 2"
                            : "Option 3"}
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512"
                        className={styles.arrow}
                    >
                        <path
                            d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                        ></path>
                    </svg>
                </div>
                <div className={styles.options}>
                    <div title="all">
                        <input
                            id="all"
                            name="option"
                            type="radio"
                            checked={selectedOption === "all"}
                            onChange={handleChange}
                        />
                        <label className={styles.option} htmlFor="all" data-txt="All"></label>
                    </div>
                    <div title="option-1">
                        <input
                            id="option-1"
                            name="option"
                            type="radio"
                            checked={selectedOption === "option-1"}
                            onChange={handleChange}
                        />
                        <label className={styles.option} htmlFor="option-1" data-txt="Option 1"></label>
                    </div>
                    <div title="option-2">
                        <input
                            id="option-2"
                            name="option"
                            type="radio"
                            checked={selectedOption === "option-2"}
                            onChange={handleChange}
                        />
                        <label className={styles.option} htmlFor="option-2" data-txt="Option 2"></label>
                    </div>
                    <div title="option-3">
                        <input
                            id="option-3"
                            name="option"
                            type="radio"
                            checked={selectedOption === "option-3"}
                            onChange={handleChange}
                        />
                        <label className={styles.option} htmlFor="option-3" data-txt="Option 3"></label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;
