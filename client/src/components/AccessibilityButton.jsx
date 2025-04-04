import React from "react";
import styles from "./AccessibilityButton.module.scss";
import Icon from "./Icon";

function AccessibilityButton({
  toggle,
  enabled,
  type,
  iconNameEnabled,
  iconNameDisabled,
  iconColor = "black",
  iconWidth = 2,
  iconHeight = 2,
}) {
  return (
    <button className={styles.accessibilityBtn} onClick={toggle}>
      {/* <div className={styles.accessibilityBtn_icon}>ICON</div> */}
      <Icon
        name={enabled ? iconNameEnabled : iconNameDisabled}
        color={iconColor}
        width={iconWidth}
        height={iconHeight}
      />
      <div className={styles.accessibilityBtn_text}>
        {enabled ? `Disable ${type}` : `Enable ${type}`}
      </div>
    </button>
  );
}

export default AccessibilityButton;
