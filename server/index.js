// server/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");
// Importing Maze Generation Functions
const {
  generateMazeRandom,
  generateMazeDFS,
  generateMazePrim,
  generateMazeKruskal,
  generateMazeDivision,
  generateMazeGrowingTree,
} = require("./mazeAlgorithms.js");
// Importing PathFinding Function
const { aStar } = require("./pathfinding.js");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app's URL
    // origin: "http://192.168.1.109:3000",
    // origin: "https://homithecodi.github.io",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your React app's URL
    // origin: "http://192.168.1.109:3000",
    // origin: "https://homithecodi.github.io",
    methods: ["GET", "POST"],
  })
);

// Database Connection data
const pool = new Pool({
  user: "root",
  host: "postgresql",
  database: "mazeResults",
  password: "Pkvv01jo2RRwAx78w3l81I5W",
  port: 5432,
});

// Set the Maze Size Width and Height
const MAZE_SIZE = 16;
// Set the Distance of Goals from each other (Better be half the maze size or less)
const GOALS_DISTANCE = 8;
// Set the Wall Density of Random Maze
const WALL_DENSITY = 0.3;

function generateMaze(size, algorithm) {
  let maze;

  switch (algorithm) {
    case "dfs":
      console.log("Using Depth-First Search Algorithm");
      maze = generateMazeDFS(size, size);
      break;
    case "prim":
      console.log("Using Prim Algorithm");
      maze = generateMazePrim(size, size);
      break;
    case "kruskal":
      console.log("Using Kruskal Algorithm");
      maze = generateMazeKruskal(size, size);
      break;
    case "division":
      console.log("Using Recursive Division Algorithm");
      maze = generateMazeDivision(size, size);
      break;
    case "growing-tree":
      console.log("Using Growing Tree Algorithm");
      maze = generateMazeGrowingTree(size, size);
      break;
    default:
      console.log("Using Random Algorithm");
      maze = generateMazeRandom(size, size, WALL_DENSITY);
  }

  return maze;
}

///////////////////////////////////////////////////////////////
// PLAYER GENERATION
///////////////////////////////////////////////////////////////

// First Function to Generate Player
// function generatePlayer(maze, goals = []) {
//   let x, y;
//   do {
//     x = Math.floor(Math.random() * maze[0].length);
//     y = Math.floor(Math.random() * maze.length);
//   } while (
//     maze[y][x] === 1 ||
//     goals.some((goal) => goal.x === x && goal.y === y)
//   ); // Ensure player is not placed on a wall or a goal
//   return { x, y };
// }

function generatePlayer(maze, goals = [], minDistance = 3) {
  let x, y;
  let isValidPosition = false;
  let attempts = 0;
  const maxAttempts = 1000;

  while (!isValidPosition && attempts < maxAttempts) {
    // Find a random place for spawning the player
    x = Math.floor(Math.random() * maze[0].length);
    y = Math.floor(Math.random() * maze.length);

    // Check if the position is not a wall and not too close to any goal
    if (maze[y][x] !== 1) {
      isValidPosition = true;
      for (const goal of goals) {
        const dx = Math.abs(goal.x - x);
        const dy = Math.abs(goal.y - y);
        if (dx < minDistance && dy < minDistance) {
          isValidPosition = false;
          break;
        }
      }
    }
    attempts++;
  }

  // IN CASE SHIT HAPPENED!
  // if (!isValidPosition) {
  //   console.warn(
  //     "FAILED TO PLACE PLAYER AFTER MAXIMUM ATTEMPTS. REGENERATING PLAYER POSITION!"
  //   );
  //   return; // Indicate failure to place player
  // }

  return { x, y };
}

///////////////////////////////////////////////////////////////
// GOAL GENERATION
///////////////////////////////////////////////////////////////

// First Function to Generate Goal
// function generateGoal(maze) {
//   let x, y;
//   do {
//     x = Math.floor(Math.random() * maze[0].length);
//     y = Math.floor(Math.random() * maze.length);
//   } while (maze[y][x] === 1); // Ensure goal is not placed on a wall
//   return { x, y };
// }

function generateGoals(maze, player, minDistance = 3) {
  const goals = [];
  let isValid = false;
  let attempts = 0;
  const maxAttempts = 1000;

  while (!isValid && attempts < maxAttempts) {
    goals.length = 0; // Reset the goals array

    // Step 1: Generate all goals without checking paths
    for (let i = 0; i < 3; i++) {
      let x, y;
      let isValidGoal = false;
      let goalAttempts = 0;

      while (!isValidGoal && goalAttempts < maxAttempts) {
        x = Math.floor(Math.random() * maze[0].length);
        y = Math.floor(Math.random() * maze.length);

        // Check if the position is not a wall and not too close to other goals or the player
        if (maze[y][x] !== 1) {
          isValidGoal = true;
          for (const goal of goals) {
            const dx = Math.abs(goal.x - x);
            const dy = Math.abs(goal.y - y);
            if (dx < minDistance && dy < minDistance) {
              isValidGoal = false;
              break;
            }
          }

          // Check distance from player
          const dxPlayer = Math.abs(player.x - x);
          const dyPlayer = Math.abs(player.y - y);
          if (dxPlayer < minDistance && dyPlayer < minDistance) {
            isValidGoal = false;
          }
        }
        goalAttempts++;
      }

      if (isValidGoal) {
        goals.push({ x, y });
      } else {
        break; // Exit if a goal cannot be placed
      }
    }

    // Step 2: Validate the entire set of goals
    if (goals.length === 3) {
      isValid = true;
      for (let i = 0; i < goals.length; i++) {
        const goal = goals[i];
        const otherGoals = goals.filter((g, index) => index !== i); // Treat all other goals as obstacles
        const path = aStar(player, goal, maze, otherGoals);

        if (!path) {
          isValid = false; // If any goal is unreachable, regenerate the entire set
          break;
        }
      }
    }
    attempts++;
  }

  // IN CASE SHIT HAPPENED!!!
  // if (!isValid) {
  //   console.warn(
  //     "Failed to place goals after maximum attempts. Regenerating goals."
  //   );

  //   return null; // Indicate failure to place goals
  // }

  // if (!isValid) {
  //   console.warn(
  //     "WARNING: Failed to place goals after maximum attempts. Falling back to random positions."
  //   );
  //   // Fallback: Place goals randomly without distance constraints
  //   goals.length = 0;
  //   for (let i = 0; i < 3; i++) {
  //     let x, y;
  //     do {
  //       x = Math.floor(Math.random() * maze[0].length);
  //       y = Math.floor(Math.random() * maze.length);
  //     } while (maze[y][x] === 1);
  //     goals.push({ x, y });
  //   }
  // }

  // Step 3: Mark one goal as the true goal
  const trueGoalIndex = Math.floor(Math.random() * 3); // Randomly select one goal as the true goal
  goals[trueGoalIndex].isTrueGoal = true; // Mark the true goal
  console.log("Generated goals:", goals); // Debug log for generated goals
  return goals;
}

// Calculating the distance from Player to True Goal
function calculateDistance(player, trueGoal) {
  const dx = player.x - trueGoal.x;
  const dy = player.y - trueGoal.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Creating a signal based on Player distance to True Goal and Maze Size
function getDistanceSignal(distance, mazeSize) {
  // Arbitrary threshold for 'far', 'mid' and 'close'
  const closeThreshold = 3;
  const farthreshold = mazeSize / 2;
  if (distance <= closeThreshold) {
    return "close";
  } else if (distance <= farthreshold) {
    return "mid";
  } else {
    return "far";
  }
}

io.on("connection", (socket) => {
  const initializeGame = (algorithm = "growing-tree") => {
    console.log(`User Connected: ${socket.id}`);
    const maze = generateMaze(MAZE_SIZE, algorithm);
    const player = generatePlayer(maze, [], GOALS_DISTANCE);
    const goals = generateGoals(maze, player, GOALS_DISTANCE);
    const trueGoal = goals.find((goal) => goal.isTrueGoal);
    socket.emit("init", { maze, player, goals });
    return { maze, player, goals, trueGoal };
  };

  let { maze, player, goals, trueGoal } = initializeGame();

  socket.on("playerMove", (newPosition) => {
    console.log("Player moved to:", newPosition); // Debug log for player position
    console.log("Current goals:", goals); // Debug log for goals
    player = newPosition;

    if (goals && Array.isArray(goals)) {
      const goal = goals.find(
        (g) => g.x === newPosition.x && g.y === newPosition.y
      );
      if (goal) {
        if (goal.isTrueGoal) {
          socket.emit("win", "You Won!");
          socket.emit("stopBeep");
        } else {
          socket.emit("lose", "You Lost!");
          socket.emit("stopBeep");
        }
      }
    }
  });

  socket.on("playerPosition", (playerPosition) => {
    console.log("Received player position:", playerPosition);
    if (trueGoal) {
      const distance = calculateDistance(playerPosition, trueGoal);
      const distanceSignal = getDistanceSignal(distance, MAZE_SIZE);
      socket.emit("distance", distanceSignal);
    }
  });

  // Sending data to DataBase
  socket.on("submit-test", async (data) => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO maze_results (name, age, gender, time, date, algorithm, move_count, comment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          data.name,
          data.age,
          data.gender,
          data.timeTaken,
          data.date,
          data.algorithm,
          data.moveCount,
          data.comment,
        ]
      );
      console.log("Data inserted:", res.rows);
    } catch (err) {
      console.error("Error executing query", err.stack);
    } finally {
      client.release();
    }
  });

  socket.on("reset", ({ algorithm }) => {
    ({ maze, player, goals, trueGoal } = initializeGame(algorithm));
    // NOT SURE IF NECESSARY - DELETE IF NEEDED !!!
    socket.emit("init", { maze, player, goals });
  });

  socket.on("disconnect", () => {
    console.log(`User Disonnected: ${socket.id}`);
    socket.disconnect();
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
