import React from "react";
import styles from "./ControlButton.module.scss";
import Icon from "./Icon";

function ControlButton({
  direction,
  handlePlayerMove,
  handleAutoMove,
  algorithm,
  iconName,
  iconColor = "black",
  iconWidth = 2,
  iconHeight = 2,
}) {
  const handleControlClick = () => {
    if (algorithm === "random") {
      handlePlayerMove(direction);
    } else {
      handleAutoMove(direction);
    }
  };

  let buttonText;
  switch (direction) {
    case "up":
      buttonText = "↑";
      break;
    case "down":
      buttonText = "↓";
      break;
    case "left":
      buttonText = "←";
      break;
    case "right":
      buttonText = "→";
      break;
    default:
      buttonText = ""; // if direction is invalid
  }

  return (
    <button
      className={`${styles.controlButton} ${styles[direction]}`}
      onClick={handleControlClick}
    >
      {/* {buttonText} */}
      <Icon
        name={iconName}
        color={iconColor}
        width={iconWidth}
        height={iconHeight}
      />
    </button>
  );
}

export default ControlButton;
