import React from "react";
import styles from "./Player.module.scss";

function Player({ position }) {
  console.log("Rendering Player:", position);

  let playerSize;

  if (window.innerWidth <= 1024) {
    // the size is based on --cell-size in Maze.module.scss
    playerSize = 1.5;
  } else {
    playerSize = 2;
  }

  return (
    <div
      className={styles.player}
      style={{
        top: `calc(${position.y} * ${playerSize}rem)`,
        left: `calc(${position.x} * ${playerSize}rem)`,
      }}
    />
  );
}

export default Player;
