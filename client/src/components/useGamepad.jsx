import { useEffect, useRef } from "react";

const useGamepad = (gamepadConnected, setGamepadConnected, onMove) => {
  const buttonState = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleGamepadConnected = (event) => {
      console.log("Gamepad connected:", event.gamepad);
      setGamepadConnected(true);
    };

    const handleGamepadDisconnected = (event) => {
      console.log("Gamepad disconnected:", event.gamepad);
      setGamepadConnected(false);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
    };
  }, [gamepadConnected]);

  useEffect(() => {
    let animationFrameId;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0]; // Use the first connected gamepad

      if (gamepad) {
        // Check D-pad buttons (standard mapping)
        const buttons = gamepad.buttons;

        // Current state of each button
        const currState = {
          up: buttons[12]?.pressed,
          down: buttons[13]?.pressed,
          left: buttons[14]?.pressed,
          right: buttons[15]?.pressed,
        };

        // Check for button press transitions
        if (currState.up && !buttonState.current.up) {
          onMove("up"); // Up
        }
        if (currState.down && !buttonState.current.down) {
          onMove("down"); // Down
        }
        if (currState.left && !buttonState.current.left) {
          onMove("left"); // Left
        }
        if (currState.right && !buttonState.current.right) {
          onMove("right"); // Right
        }

        // Update the button state
        buttonState.current = { ...currState };
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    pollGamepad();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onMove]);
};

export default useGamepad;
