import React from "react";
import { useOutletContext } from "react-router-dom";
import icons from "../../../FontAwesome/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ContestInfo.module.css";
import { Tooltip } from "react-tooltip";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

    return (
        <div>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>{contestInfo.title}</h1>
                    <div id="edit-contest" className={styles.editContest} onClick={handleEditContestClick}>
                        <FontAwesomeIcon icon={icons.pen} />
                    </div>
                    <Tooltip anchorId="edit-contest" content="Sửa thông tin cơ bản" />

                    <div
                        id="contest-details"
                        className={styles.editContest}
                        onClick={handleEditContestDetailsClick}
                    >
                        <FontAwesomeIcon icon={icons.info} />
                    </div>
                    <Tooltip anchorId="contest-details" content="Sửa thông tin chi tiết" />

                    <div
                        id="add-student-contest"
                        className={styles.editContest}
                        onClick={handleAddStudenttoContest}
                    >
                        <FontAwesomeIcon icon={icons.circleplus} />
                    </div>
                    <Tooltip anchorId="add-student-contest" content="Thêm thí sinh" />
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
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Số điểm</th>
                        <th>Thứ hạng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {contestInfo.participants.map((participant, index) => (
                        <tr key={index}>
                            <td>{participant.username}</td>
                            <td>{participant.name}</td>
                            <td>{participant.phone}</td>
                            <td>{participant.email}</td>
                            <td>{participant.score}</td>
                            <td>{participant.rank}</td>
                            <td>
                                <button
                                    onClick={() => handleRemoveParticipant(participant.username)}
                                    className={styles.remove_button}
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
