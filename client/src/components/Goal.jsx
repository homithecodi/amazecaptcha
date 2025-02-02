import React from "react";
import styles from "./Goal.module.scss";

function Goal({ position }) {
  console.log("Rendering Goal:", position);
  let goalSize;
  if (window.innerWidth <= 600) {
    // the size is based on --cell-size in Maze.module.scss
    goalSize = 1.5;
  } else {
    goalSize = 2;
  }

  return (
    <div
      className={styles.goal}
      style={{
        // top: `calc(${position.y} * 2rem)`,
        // left: `calc(${position.x} * 2rem)`,
        top: `calc(${position.y} * ${goalSize}rem)`,
        left: `calc(${position.x} * ${goalSize}rem)`,
      }}
    />
  );
}

export default Goal;
