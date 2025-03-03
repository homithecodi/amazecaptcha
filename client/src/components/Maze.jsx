import React, { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import styles from "./Maze.module.scss";
import Player from "./Player";
import Goal from "./Goal";
import Icon from "./Icon";

function Maze({
  maze,
  player,
  goals,
  pulseInterval,
  pulseEnabled,
  handleAutoMove,
}) {
  console.log("Rendering Maze:", maze);

  const mazeRef = useRef(null);

  // Swiping functionality
  const handlers = useSwipeable({
    onSwipedUp: () => handleAutoMove("up"),
    onSwipedDown: () => handleAutoMove("down"),
    onSwipedLeft: () => handleAutoMove("left"),
    onSwipedRight: () => handleAutoMove("right"),
  });

  useEffect(() => {
    if (pulseInterval) {
      const interval = setInterval(() => {
        if (mazeRef.current) {
          if (pulseEnabled) {
            const duration = Math.min(pulseInterval / 1000, 0.5); // Convert to seconds, cap at 0.5s
            mazeRef.current.style.animationDuration = `${duration}s`;
            mazeRef.current.classList.toggle(styles.pulse);
            // setTimeout(() => {
            //   mazeRef.current.classList.remove(styles.pulse);
            // }, pulseInterval);
          } else {
            // If pulseEnabled was Disabled:
            mazeRef.current.classList.remove(styles.pulse);
          }
        }
      }, pulseInterval);

      return () => clearInterval(interval);
    }
  }, [pulseInterval, pulseEnabled]);

  if (!Array.isArray(goals)) {
    return null;
  }

  return (
    <>
      {maze.length === 0 ? (
        <div className={styles.maze_loading}>
          <Icon
            name={"spinner2"}
            color={"color-primary"}
            width={4}
            height={4}
          />
          <h2>Loading the maze...</h2>
        </div>
      ) : (
        <div {...handlers}>
          <div ref={mazeRef} className={styles.maze_container}>
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`${
                    cell === 1 ? styles.maze_cell_wall : styles.maze_cell
                  }`}
                ></div>
              ))
            )}
            <Player position={player} />
            {goals.map((goal, index) => (
              <Goal key={`goal-${index}`} position={goal} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Maze;
