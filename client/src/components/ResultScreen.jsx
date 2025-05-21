import React, { useRef } from "react";
import styles from "./ResultScreen.module.scss";
import StarRating from "./StarRating";

function ResultScreen({
  name,
  setName,
  age,
  setAge,
  gender,
  setGender,
  algorithm,
  moveCount,
  timeTaken,
  comment,
  setComment,
  message,
  resetGame,
  handleSubmit,
  submitBtnDisabled,
  maze,
  rating,
  setRating,
  hoverRating,
  setHoverRating,
  retries,
}) {
  const resultRef = useRef(null);
  const mazeLength = maze.length - 1;
  // const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

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
      <form className={styles.table} onSubmit={handleSubmit}>
        <label className={styles.field}>
          Algorithm:
          <input type="text" value={algorithm} readOnly />
        </label>
        <label className={styles.field}>
          Maze Size:
          <input type="text" value={`${mazeLength}x${mazeLength}`} readOnly />
        </label>
        <label className={styles.field}>
          No. of Retries:
          <input type="text" value={`${retries}`} readOnly />
        </label>
        <label className={styles.field}>
          No. of Moves:
          <input type="text" value={moveCount} readOnly />
        </label>
        <label className={styles.field}>
          Time:
          <input type="text" value={`${timeTaken}s`} readOnly />
        </label>
        <label className={styles.field}>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoComplete="off"
            required
          />
        </label>
        <label className={styles.field}>
          Age:
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age..."
            required
          />
        </label>
        <label className={styles.field}>
          Gender:
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="" disabled>
              Select gender:
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Prefer not to say</option>
          </select>
        </label>
        <label className={styles.field}>
          Rate:
          <StarRating
            rating={rating}
            setRating={setRating}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
            icon={"⭐"}
            count={5}
            size={3}
          />
          {/* <input type="text" value={`${timeTaken}s`} readOnly /> */}
        </label>
        <label className={styles.field}>
          Add a comment:
          <textarea
            value={comment}
            placeholder="(Optional)"
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </label>

        <button
          className={styles.submitBtn}
          type="submit"
          disabled={submitBtnDisabled}
        >
          Submit
        </button>
      </form>
      {/* <a href="https://www.google.com">
        <button className={styles.btn}>Continue?</button>
      </a> */}
      <button className={styles.btn} onClick={resetGame}>
        Restart
      </button>
    </div>
  );
}

export default ResultScreen;
