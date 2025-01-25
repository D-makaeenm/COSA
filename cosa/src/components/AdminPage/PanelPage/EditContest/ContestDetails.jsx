import React from "react";
import { useParams } from "react-router-dom";
import styles from "./EditContest.module.css";
import ExamTasks from "./ExamTasks";
import GradingCriteria from "./GradingCriteria";
import TestCases from "./TestCases";

function ContestDetails() {
    const { id: examId } = useParams(); // Lấy exam_id từ URL

    return (
        <div className={styles.info_container}>
            <h1>Sửa thông tin tiêu chí, testcase, câu hỏi cuộc thi</h1>
            <div className={styles.formDetails}>
                <div className={styles.detailInfo_container}>
                    <ExamTasks examId={examId} />
                    <GradingCriteria examId={examId} />
                    <TestCases examId={examId} />
                </div>
                <div className={styles.button}>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc chắn muốn sửa đổi?")) {
                                alert("Thay đổi đã được gửi!");
                            }
                        }}
                    >
                        Xác nhận sửa đổi
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ContestDetails;