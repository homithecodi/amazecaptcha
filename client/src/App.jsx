import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Maze from "./components/Maze";
import AlgorithmDropdown from "./components/AlgorithmDropdown";
import ResultScreen from "./components/ResultScreen";
import AccessibilityButton from "./components/AccessibilityButton";
import ControlButton from "./components/ControlButton";
// import ThemeToggle from "./components/ThemeToggle";
import styles from "./App.module.scss";
import beepSound from "./audios/beep01.mp3";
import Icon from "./components/Icon";

// const socket = io("http://localhost:3001");
// const socket = io("http://192.168.1.109:3001");
const socket = io("https://amazecaptcha.liara.run/");

function App() {
  // STATES HERE
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({});
  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [algorithm, setAlgorithm] = useState("random");
  const [beepInterval, setBeepInterval] = useState(null);
  const [vibrationPattern, setVibrationPattern] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [beepEnabled, setBeepEnabled] = useState(false); // MAKE IT TRUE
  const [vibrationEnabled, setVibrationEnabled] = useState(false); // MAKE IT TRUE
  const [pulseEnabled, setPulseEnabled] = useState(false); // MAKE IT TRUE
  const [pulseInterval, setPulseInterval] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  // const [theme, setTheme] = useState(true);

  // REFS HERE
  const startRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    socket.on("init", ({ maze, player, goals }) => {
      console.log("Received init data:", { maze, player, goals });
      setMaze(maze || []);
      setPlayer(player || {});
      setGoals(goals || []);
      setMessage("");
      setGameOver(false);
      setBeepInterval(null); // Reset beep interval
      setVibrationPattern([]); // Reset vibration pattern
      setPulseInterval(null); // Reset pulse interval
      // setIsGameStarted(false); // Reset game started status (update: not necessary)
      // Update CSS variable --maze-size
      document.documentElement.style.setProperty("--maze-size", maze.length);
    });

    socket.on("win", (msg) => {
      console.log("Received win message:", msg);
      setGameWon(true);
      setGameOver(true);
      setIsGameStarted(false);
      setMessage(msg);
      setEndTime(Date.now());
      setBeepInterval(null); // Stop Beep Sound
      setVibrationPattern([]); // Stop vibration
      setPulseInterval(null); // Stop pulse
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop any ongoing vibrations
      }
    });

    socket.on("lose", (msg) => {
      console.log("Received lose message:", msg);
      setMessage(msg);
      setGameOver(true);
      // setIsGameStarted(false);
      setBeepInterval(null); // Stop Beep Sound
      setVibrationPattern([]); // Stop vibration
      setPulseInterval(null); // Stop pulse
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop any ongoing vibrations
      }
    });

    socket.on("distance", (distanceSignal) => {
      console.log("Received distance signal: ", distanceSignal);
      if (distanceSignal === "close") {
        setBeepInterval(200); // Fast beep (3 times per second)
        setVibrationPattern([200, 100]); // Fast vibration pattern
        setPulseInterval(200); // Fast pulse
      } else if (distanceSignal === "mid") {
        setBeepInterval(500); // Medium beep (2 times per second)
        setVibrationPattern([500, 300]); // Medium vibration pattern
        setPulseInterval(350); // Meduim pulse
      } else {
        setBeepInterval(1000); // Slow beep (1 time per second)
        setVibrationPattern([1000, 500]); // Slow vibration pattern
        setPulseInterval(500); // Slow pulse
      }
    });

    socket.on("stopBeep", () => {
      setBeepInterval(null); // Stop beep sound
      setVibrationPattern([]); // Stop vibration
      setPulseInterval(null); // Stop pulse
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop any ongoing vibrations
      }
    });
  }, []);

  const resetGame = () => {
    setMoveCount(0);
    setStartTime(Date.now());
    setIsGameStarted(true);
    setGameWon(false);
    setGameOver(false);
    setPlayer({});
    setGoals([]);
    socket.emit("reset", { algorithm });
  };

  const startGame = () => {
    if (startRef) {
      startRef.current.classList.add(styles.hide);
      setTimeout(() => {
        setIsGameStarted(true);
        setStartTime(Date.now());
        setEndTime(null); // Reset end time
        socket.emit("start");
      }, 500);
    }
  };

  const toggleBeep = () => {
    setBeepEnabled(!beepEnabled);
  };

  const toggleVibrations = () => {
    setVibrationEnabled(!vibrationEnabled);
  };

  const togglePulse = () => {
    setPulseEnabled(!pulseEnabled);
  };

  const handlePlayerMove = (direction) => {
    if (gameOver) return;

    let newPosition = { ...player };
    const { x, y } = newPosition; // Destructure x and y from position

    if (direction === "up" && y > 0 && maze[y - 1][x] === 0) newPosition.y -= 1;
    if (direction === "down" && y < maze.length - 1 && maze[y + 1][x] === 0)
      newPosition.y += 1;
    if (direction === "left" && x > 0 && maze[y][x - 1] === 0)
      newPosition.x -= 1;
    if (direction === "right" && x < maze[0].length - 1 && maze[y][x + 1] === 0)
      newPosition.x += 1;
    setPlayer(newPosition);
    setMoveCount((prevCount) => prevCount + 1);
    socket.emit("playerMove", newPosition);
  };

  const handleAutoMove = (direction) => {
    if (gameOver) return;

    let canMove = true;
    let newPosition = { ...player };
    // NOTE: Need multiWay or it will not move at U shape blocks !!!
    let multiWay = false;

    const isWallOrBoundary = (x, y) =>
      x < 0 ||
      x >= maze[0].length ||
      y < 0 ||
      y >= maze.length ||
      maze[y][x] === 1;

    const isGoalInFront = (direction, x, y, goals) => {
      if (goals) {
        if (direction === "up") {
          if (goals.some((goal) => goal.x === x && goal.y === y - 1)) {
            // If there is a goal at top
            canMove = false;
          }
        } else if (direction === "down") {
          if (goals.some((goal) => goal.x === x && goal.y === y + 1)) {
            // If there is a goal at bottom
            canMove = false;
          }
        } else if (direction === "left") {
          if (goals.some((goal) => goal.x === x - 1 && goal.y === y)) {
            // If there is a goal at left
            canMove = false;
          }
        } else if (direction === "right") {
          if (goals.some((goal) => goal.x === x + 1 && goal.y === y)) {
            // If there is a goal at right
            canMove = false;
          }
        }
        return false;
      }
    };

    // Stop at two ways
    const checkMultiWay = () => {
      let wallsAround = 0;

      if (isWallOrBoundary(newPosition.x, newPosition.y - 1)) wallsAround++; // up
      if (isWallOrBoundary(newPosition.x, newPosition.y + 1)) wallsAround++; // down
      if (isWallOrBoundary(newPosition.x - 1, newPosition.y)) wallsAround++; // left
      if (isWallOrBoundary(newPosition.x + 1, newPosition.y)) wallsAround++; // right

      // if (wallsAround <= 1) {
      //   canMove = false;
      // }
      if (wallsAround <= 1) {
        multiWay = true;
      } else {
        multiWay = false;
      }
    };

    // checkMultiWay();

    while (canMove && !multiWay) {
      // !multiWay
      const { x, y } = newPosition;

      // Stop player if is on one of the goals
      if (goals.some((goal) => goal.x === x && goal.y === y)) return;

      if (direction === "up" && !isWallOrBoundary(x, y - 1)) {
        newPosition.y -= 1;
        checkMultiWay();
      } else if (direction === "down" && !isWallOrBoundary(x, y + 1)) {
        newPosition.y += 1;
        checkMultiWay();
      } else if (direction === "left" && !isWallOrBoundary(x - 1, y)) {
        newPosition.x -= 1;
        checkMultiWay();
      } else if (direction === "right" && !isWallOrBoundary(x + 1, y)) {
        newPosition.x += 1;
        checkMultiWay();
      } else {
        canMove = false;
      }

      // Update player position if moving forward
      if (canMove) {
        setPlayer(newPosition);
        setMoveCount((prevCount) => prevCount + 1);
        socket.emit("playerMove", newPosition);
      }

      // Stop if the player encounters a wall, boundary, or goal
      if (
        isWallOrBoundary(newPosition.x, newPosition.y) ||
        isGoalInFront(direction, newPosition.x, newPosition.y, goals)
      ) {
        canMove = false;
      }
    }
  };

  // Handling key events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameOver) return;
      if (event.key === "ArrowUp") handlePlayerMove("up");
      if (event.key === "ArrowDown") handlePlayerMove("down");
      if (event.key === "ArrowLeft") handlePlayerMove("left");
      if (event.key === "ArrowRight") handlePlayerMove("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, gameOver]);

  // Fade out effect of the Maze at beginning
  useEffect(() => {
    if (isGameStarted) {
      appRef.current.classList.remove(styles.hide);
    }
  }, [isGameStarted]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && isGameStarted) {
        socket.emit("playerPosition", player);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player, gameOver, isGameStarted]);

  useEffect(() => {
    if (beepInterval && isGameStarted && beepEnabled) {
      const beepAudio = new Audio(beepSound);
      const interval = setInterval(() => {
        beepAudio.play();
      }, beepInterval);
      return () => clearInterval(interval);
    }
  }, [beepInterval, isGameStarted, beepEnabled]);

  useEffect(() => {
    if (
      vibrationPattern.length &&
      isGameStarted &&
      navigator.vibrate &&
      vibrationEnabled
    ) {
      console.log(`Vibration triggered with pattern: ${vibrationPattern}`);
      const interval = setInterval(
        () => {
          navigator.vibrate(vibrationPattern);
        },
        vibrationPattern.reduce((a, b) => a + b, 0)
      );
      return () => {
        clearInterval(interval);
        navigator.vibrate(0); // Stop any ongoing vibrations
      };
    }
  }, [vibrationPattern, isGameStarted, vibrationEnabled]);

  // Listener for Dark / Light Mode
  // useEffect(() => {
  //   if (theme) {
  //     document.body.classList.toggle(styles.dark_mode);
  //     setTheme(!theme);
  //   }
  // }, [theme]);

  return (
    <>
      {!isGameStarted && !gameWon && (
        <button className={styles.start} onClick={startGame} ref={startRef}>
          Start
        </button>
      )}
      {isGameStarted && (
        <div ref={appRef} className={`${styles.hide} ${styles.app_container}`}>
          <AlgorithmDropdown setAlgorithm={setAlgorithm} />
          <p className={styles.algorithm_label}>Algorithm: {algorithm}</p>
          <div className={styles.icons}>
            {/* <ThemeToggle theme={theme} setTheme={setTheme} /> */}
            <AccessibilityButton
              toggle={toggleBeep}
              enabled={beepEnabled}
              type={"Beep"}
              iconNameEnabled={"volume-high"}
              iconNameDisabled={"volume-mute2"}
              key={"beep"}
            />
            <AccessibilityButton
              toggle={toggleVibrations}
              enabled={vibrationEnabled}
              type={"Vibration"}
              iconNameEnabled={"radio-checked"}
              iconNameDisabled={"radio-unchecked"}
              key={"vibration"}
            />
            <AccessibilityButton
              toggle={togglePulse}
              enabled={pulseEnabled}
              type={"Pulse"}
              iconNameEnabled={"eye"}
              iconNameDisabled={"eye-blocked"}
              key={"pulse"}
            />
          </div>
          <p className={styles.message}>{message}</p>
          <Maze
            maze={maze}
            player={player}
            goals={goals}
            pulseInterval={pulseInterval}
            pulseEnabled={pulseEnabled}
            setPlayer={setPlayer}
            setMoveCount={setMoveCount}
            socket={socket}
            handleAutoMove={handleAutoMove}
          />
          <button className={styles.reset_btn} onClick={resetGame}>
            <Icon name={"spinner11"} color={"black"} width={2} height={2} />
            RESET
          </button>
          <div className={styles.controlButtons}>
            <ControlButton
              key={"up"}
              direction={"up"}
              handlePlayerMove={handlePlayerMove}
              handleAutoMove={handleAutoMove}
              algorithm={algorithm}
              iconName={"arrow-up"}
            />
            <ControlButton
              key={"left"}
              direction={"left"}
              handlePlayerMove={handlePlayerMove}
              handleAutoMove={handleAutoMove}
              algorithm={algorithm}
              iconName={"arrow-left"}
            />
            <ControlButton
              key={"right"}
              direction={"right"}
              handlePlayerMove={handlePlayerMove}
              handleAutoMove={handleAutoMove}
              algorithm={algorithm}
              iconName={"arrow-right"}
            />
            <ControlButton
              key={"down"}
              direction={"down"}
              handlePlayerMove={handlePlayerMove}
              handleAutoMove={handleAutoMove}
              algorithm={algorithm}
              iconName={"arrow-down"}
            />
          </div>
        </div>
      )}
      {gameWon && (
        <ResultScreen
          moveCount={moveCount}
          startTime={startTime}
          endTime={endTime}
          message={message}
          resetGame={resetGame}
          algorithm={algorithm}
        />
      )}
    </>
  );
}

export default App;
