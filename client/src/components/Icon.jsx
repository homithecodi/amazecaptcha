// Importing React
import React from "react";
// Importing Icons
import icons from "../icons/sprite.svg";
// Importing Stylings
import styles from "./Icon.module.scss";

function Icon({ name, color, width, height }) {
  return (
    <svg
      className={styles.icon}
      // Basic Stylings
      style={{
        width: `${width}rem`,
        height: `${height}rem`,
        fill: `${color}`,
      }}
    >
      <use
        // Addressing the Sprite Icon to Use
        href={`${icons}#icon-${name}`}
      ></use>
    </svg>
  );
}

export default Icon;
