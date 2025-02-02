import React, { useRef } from "react";
import styles from "./ResultScreen.module.scss";

function ResultScreen({
  moveCount,
  startTime,
  endTime,
  message,
  resetGame,
  algorithm,
}) {
  const resultRef = useRef(null);

  const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

  if (resultRef.current) {
    setTimeout(() => {
      resultRef.current.classList.remove(styles.hide);
    }, 500);
  }
  return (
    <div ref={resultRef} className={`${styles.results} ${styles.hide}`}>
      <h2 className={styles.header}>
        {message ? message : "Waiting for server response..."}
      </h2>
      <ul className={styles.table}>
        <li className={styles.cell}>Algorithm:</li>
        <li className={styles.cell}>{algorithm}</li>
        <li className={styles.cell}>No. of moves:</li>
        <li className={styles.cell}>{moveCount}</li>
        <li className={styles.cell}>Time:</li>
        <li className={styles.cell}>{`${timeTaken}s`}</li>
      </ul>
      <a href="https://www.google.com">
        <button className={styles.btn}>Continue?</button>
      </a>
      <button className={styles.btn} onClick={resetGame}>
        RESET
      </button>
    </div>
  );
}

export default ResultScreen;
