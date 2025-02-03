// server/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

// app.use(cors()); // Enable CORS
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
    // origin: "https://homithecodi.github.io/amazecaptcha/",
    methods: ["GET", "POST"],
  })
);

// const allowedOrigins = ["https://homithecodi.github.io"];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

// app.use(cors(corsOptions)); // Enable CORS with custom options

// Importing Functions
const {
  generateMazeRandom,
  generateMazeDFS,
  generateMazePrim,
  generateMazeKruskal,
  generateMazeDivision,
  generateMazeDivision2,
  generateMazeRandKruskal,
  generateMazeGrowingTree,
} = require("./mazeAlgorithms.js");

// Importing PathFinding Functions
const { findPath } = require("./pathfinding.js");

// import {
//   generateMazeDFS,
//   generateMazePrim,
//   generateMazeKruskal,
//   generateMazeDivision,
//   generateRandomMaze,
// } from "./mazeAlgorithms.js";

// Set the Maze Size Width and Height
const MAZE_SIZE = 20;
// Set the Wall Density of Random Maze
const WALL_DENSITY = 0.3;

function generateMaze(size, algorithm) {
  let maze;
  let retries = 0;
  const maxRetries = 10;
  do {
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
      case "division2":
        console.log("Using Recursive Division2 Algorithm");
        maze = generateMazeDivision2(size, size);
        break;
      case "randomKruskal":
        console.log("Using Randomized Kruskal Algorithm");
        maze = generateMazeRandKruskal(size, size);
        break;
      case "growing-tree":
        console.log("Using Growing Tree Algorithm");
        maze = generateMazeGrowingTree(size, size);
        break;
      default:
        console.log("Using Random Algorithm");
        maze = generateMazeRandom(size, size, WALL_DENSITY);
    }
    retries++;
  } while (
    !findPath(maze, { x: 1, y: 1 }, { x: size - 2, y: size - 2 }) &&
    retries < maxRetries
  );
  // while (!findPath(maze) && retries < maxRetries);

  if (retries === maxRetries) {
    console.log("FAILED!");
  }

  return maze;
}

function generatePlayer(maze) {
  let x, y;
  do {
    x = Math.floor(Math.random() * maze[0].length);
    y = Math.floor(Math.random() * maze.length);
  } while (maze[y][x] === 1); // Ensure player is not placed on a wall
  return { x, y };
}

// function generateGoal(maze) {
//   let x, y;
//   do {
//     x = Math.floor(Math.random() * maze[0].length);
//     y = Math.floor(Math.random() * maze.length);
//   } while (maze[y][x] === 1); // Ensure goal is not placed on a wall
//   return { x, y };
// }

function generateGoals(maze) {
  const goals = [];
  for (let i = 0; i < 3; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * maze[0].length);
      y = Math.floor(Math.random() * maze.length);
    } while (maze[y][x] === 1); // Ensure goal is not placed on a wall
    goals.push({ x, y });
  }
  const trueGoalIndex = Math.floor(Math.random() * 3); // Randomly select one goal as the true goal
  goals[trueGoalIndex].isTrueGoal = true; // Mark the true goal
  console.log("Generated goals:", goals); // Debug log for generated goals
  return goals;
}

function calculateDistance(player, trueGoal) {
  const dx = player.x - trueGoal.x;
  const dy = player.y - trueGoal.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getDistanceSignal(distance, mazeSize) {
  // Arbitrary threshold for 'far', 'mid' and 'close'
  const closeThreshold = 2;
  const farthreshold = mazeSize / 2;
  if (distance <= closeThreshold) {
    return "close";
  } else if (distance <= farthreshold) {
    return "mid";
  } else {
    return "far";
  }

  // return distance <= threshold ? "close" : "far";
}

io.on("connection", (socket) => {
  const initializeGame = (algorithm = "random") => {
    console.log(`User Connected: ${socket.id}`);
    const maze = generateMaze(MAZE_SIZE, algorithm); // 10x10 maze
    const player = generatePlayer(maze);
    const goals = generateGoals(maze);
    const trueGoal = goals.find((goal) => goal.isTrueGoal);
    socket.emit("init", { maze, player, goals });
    return { maze, player, goals, trueGoal };
  };

  let { maze, player, goals, trueGoal } = initializeGame();

  // socket.on("playerMove", (newPosition) => {
  //   if (newPosition.x === goal.x && newPosition.y === goal.y) {
  //     socket.emit("win", "You Won!");
  //   }
  // });

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
