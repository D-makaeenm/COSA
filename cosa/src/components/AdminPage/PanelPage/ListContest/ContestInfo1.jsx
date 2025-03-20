import React from "react";
import { useOutletContext } from "react-router-dom";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ContestInfo.module.css";
import { Tooltip } from "react-tooltip";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import * as XLSX from "xlsx";

function ContestInfo1() {
    const {
        contestInfo,
        handleRemoveParticipant,
        handleEditContestClick,
        handleEditContestDetailsClick,
        handleAddStudenttoContest,
    } = useOutletContext();

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return format(date, "HH:mm:ss EEEE dd/MM/yyyy", { locale: vi });
    };

    // 🟢 Export Excel bao gồm điểm từng bài
    const handleExportDataContest = () => {
        if (!contestInfo || !contestInfo.participants.length) {
            alert("Không có dữ liệu để xuất!");
            return;
        }
    
        const maxBai = contestInfo.participants.reduce(
            (max, p) => Math.max(max, p.submissions?.length || 0),
            0
        );
    
        const exportData = contestInfo.participants.map((participant, index) => {
            let row = {
                "STT": index + 1,
                "Username": participant.username || "",
                "Họ và tên": participant.name || "",
                "Thứ hạng": participant.rank || "",
            };
    
            for (let i = 0; i < maxBai; i++) {
                row[`Bài ${i + 1}`] = participant.submissions?.[i] ?? "-";
            }
    
            row["Tổng điểm"] = participant.score ?? 0;
            row["Ghi chú"] = "";
            return row;
        });
    
        const wb = XLSX.utils.book_new();
    
        // ✅ Tạo sheet từ data, bắt đầu từ A2 để trống dòng 1
        const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A2" });
    
        // ✅ Chèn tiêu đề vào A1
        XLSX.utils.sheet_add_aoa(ws, [["Danh sách kết quả thi"]], { origin: "A1" });
    
        // ✅ Merge ô từ A1 đến cột cuối cùng (ví dụ: G1)
        const totalColumns = Object.keys(exportData[0]).length;
        const lastColumn = String.fromCharCode(65 + totalColumns - 1); // Chuyển số sang chữ (A, B, ..., Z)
    
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } }  // Merge từ A1 đến lastColumn1
        ];
    
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách");
        XLSX.writeFile(wb, `Danh_sach_ThiSinh_${contestInfo.title}.xlsx`);
    };
    
    
    

    const maxSubmissions = contestInfo.participants.reduce(
        (max, p) => Math.max(max, p.submissions?.length || 0),
        0
    );

    return (
        <div>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>{contestInfo.title}</h1>

                    <div id="edit-contest" className={styles.editContest} onClick={handleEditContestClick}>
                        <FontAwesomeIcon icon={icons.pen} />
                    </div>
                    <Tooltip anchorId="edit-contest" content="Sửa thông tin cơ bản" />

                    <div id="contest-details" className={styles.editContest} onClick={handleEditContestDetailsClick}>
                        <FontAwesomeIcon icon={icons.info} />
                    </div>
                    <Tooltip anchorId="contest-details" content="Sửa thông tin chi tiết" />

                    <div id="add-student-contest" className={styles.editContest} onClick={handleAddStudenttoContest}>
                        <FontAwesomeIcon icon={icons.circleplus} />
                    </div>
                    <Tooltip anchorId="add-student-contest" content="Thêm thí sinh" />

                    <button id="export-data" className={styles.editContest} onClick={handleExportDataContest}><FontAwesomeIcon icon={icons.chart} /></button>
                    <Tooltip anchorId="export-data" content="Xuất báo cáo" />
                </div>

                <div className={styles.author}>
                    <p>Người tạo: {contestInfo.creator_name}</p>
                    <p>Thời gian bắt đầu: {formatDateTime(contestInfo.start_time)}</p>
                    <p>Thời gian kết thúc: {formatDateTime(contestInfo.end_time)}</p>
                </div>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Họ và tên</th>
                        <th>Thứ hạng</th>
                        {Array.from({ length: maxSubmissions }).map((_, index) => (
                            <th key={index}>Bài {index + 1}</th>
                        ))}
                        <th>Tổng điểm</th>
                        <th>Ghi chú</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {contestInfo.participants.map((participant, index) => (
                        <tr key={index}>
                            <td>{participant.username}</td>
                            <td>{participant.name}</td>
                            <td>{participant.rank}</td>

                            {Array.from({ length: maxSubmissions }).map((_, subIndex) => (
                                <td key={subIndex}>
                                    {participant.submissions?.[subIndex] ?? "-"}
                                </td>
                            ))}
                            <td>{participant.score}</td>
                            <td></td>
                            <td>
                                <button
                                    className={styles.remove_button}
                                    onClick={() => handleRemoveParticipant(participant.username)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ContestInfo1;
