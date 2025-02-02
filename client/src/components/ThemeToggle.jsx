import React from "react";
import styles from "./ThemeToggle.module.scss";

const ThemeToggle = ({ theme, setTheme }) => {
  return (
    <button onClick={() => setTheme(!theme)}>
      Switch to {theme ? "Light" : "Dark"} Mode
    </button>
  );
};

export default ThemeToggle;
