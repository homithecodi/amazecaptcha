import React from "react";
import styles from "./StarRating.module.scss";

function StarRating({
  rating,
  setRating,
  hoverRating,
  setHoverRating,
  count = 5,
  size = 5,
  icon = "★",
  color = "gold",
}) {
  let stars = Array(count).fill(icon);

  return (
    <div className={styles.starsContainer}>
      {stars.map((_, index) => {
        const isActiveColor =
          (rating || hoverRating) && (index < rating || index < hoverRating);

        return (
          <div
            className={styles.star}
            style={{
              fontSize: `${size}rem`,
              color: `${color}`,
              filter: `${isActiveColor ? "grayscale(0%)" : "grayscale(100%)"}`,
            }}
            key={index}
            onMouseEnter={() => setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(index + 1)}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
}

export default StarRating;
