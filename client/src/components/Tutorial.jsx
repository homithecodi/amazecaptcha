import React, { useEffect } from "react";
import styles from "./Tutorial.module.scss";

function Tutorial({ device, setDevice, gamepadConnected }) {
  // Function to detect the user's device
  const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/windows phone/i.test(userAgent)) {
      return "Mobile";
    }
    if (/android/i.test(userAgent)) {
      return "Mobile";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "Mobile";
    }
    if (/Xbox|PlayStation|Nintendo/.test(userAgent) || gamepadConnected) {
      return "Console";
    }
    return "PC";
  };

  // Set the device on component mount
  useEffect(() => {
    setDevice(detectDevice());
    // 'gamepad' needed -> checks if controller connects, returns "console" if true
  }, [gamepadConnected]);

  // Function to handle dropdown change
  const handleDeviceChange = (event) => {
    setDevice(event.target.value);
  };

  return (
    <div className={styles.tutorial_container}>
      <h2 className={styles.header}>How to play?</h2>
      <p>
        You are the <span>Player</span>
        <div className={styles.player}></div>. Find the
        <span>True Goal</span>
        <div className={styles.goal}></div> by the hints.
      </p>
      <div>
        {device === "PC" && (
          <p>
            Use the Arrow Keys <span> ↑ ↓ → ← </span> or
            <span>On-Screen Buttons</span>to move.
          </p>
        )}
        {device === "Mobile" && (
          <p>
            <span>Swipe</span>the Maze or use<span>On-Screen Buttons</span>to
            move.
          </p>
        )}
        {device === "Console" && (
          <p>
            Use the<span>D-pad</span>on your controller to move.
          </p>
        )}
      </div>
      <div className={styles.dropdown}>
        {/* <label htmlFor="device-select">Select Device: </label> */}
        <select id="device-select" value={device} onChange={handleDeviceChange}>
          <option disabled>Select Device:</option>
          <option value="PC">PC</option>
          <option value="Mobile">Mobile</option>
          <option value="Console">Console</option>
        </select>
      </div>
    </div>
  );
}

export default Tutorial;
