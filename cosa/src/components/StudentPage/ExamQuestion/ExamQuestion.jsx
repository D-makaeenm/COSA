import React from "react";
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import styles from './ExamQuestion.module.css';

function ExamQuestion() {
    return (
        <div className={styles.questions}>
            <div className={styles.container}>
                <div>
                    <h2>Bài 1: Tính tổng</h2>
                    <p>Viết chương trình tính tổng 2 số nguyên dương 33 và 99</p>
                </div>
                <div>
                    <h4>Phần viết code</h4>
                    <CodeMirror
                        height="500px"
                        extensions={[python()]}
                    />
                </div>
                <div className={styles.btndiv}>
                    <button className={styles.submitButton}>
                        Nộp bài
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamQuestion;
