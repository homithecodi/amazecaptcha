// server/pathfinding.js

class Node {
  constructor(x, y, parent = null) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.g = 0; // Cost from start to current node
    this.h = 0; // Heuristic cost from current node to goal
    this.f = 0; // Total cost (g + h)
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node, maze, obstacles) {
  const neighbors = [];
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (const dir of directions) {
    const x = node.x + dir.x;
    const y = node.y + dir.y;

    // Check if the neighbor is within bounds, not a wall, and not an obstacle
    if (
      x >= 0 &&
      x < maze[0].length &&
      y >= 0 &&
      y < maze.length &&
      maze[y][x] === 0 &&
      !obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y)
    ) {
      neighbors.push(new Node(x, y, node));
    }
  }

  return neighbors;
}

function aStar(start, goal, maze, obstacles = []) {
  const openList = [];
  const closedList = [];

  openList.push(new Node(start.x, start.y));

  while (openList.length > 0) {
    let current = openList[0];
    let currentIndex = 0;

    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < current.f) {
        current = openList[i];
        currentIndex = i;
      }
    }

    openList.splice(currentIndex, 1);
    closedList.push(current);

    if (current.equals(goal)) {
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path.reverse();
    }

    const neighbors = getNeighbors(current, maze, obstacles);
    for (const neighbor of neighbors) {
      if (closedList.some((node) => node.equals(neighbor))) {
        continue;
      }

      neighbor.g = current.g + 1;
      neighbor.h = heuristic(neighbor, goal);
      neighbor.f = neighbor.g + neighbor.h;

      if (
        openList.some((node) => node.equals(neighbor) && node.g < neighbor.g)
      ) {
        continue;
      }

      openList.push(neighbor);
    }
  }

  return null; // No path found
}

module.exports = { aStar };

// function heuristic(a, b) {
//   return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
// }

// function neighbors(maze, node) {
//   const dirs = [
//     { x: 0, y: -1 },
//     { x: 1, y: 0 },
//     { x: 0, y: 1 },
//     { x: -1, y: 0 },
//   ];
//   const result = [];

//   for (const dir of dirs) {
//     const newX = node.x + dir.x;
//     const newY = node.y + dir.y;
//     if (
//       newX >= 0 &&
//       newX < maze[0].length &&
//       newY >= 0 &&
//       newY < maze.length &&
//       maze[newY][newX] === 0
//     ) {
//       result.push({ x: newX, y: newY });
//     }
//   }

//   return result;
// }

// function aStar(maze, start, goal) {
//   const openSet = [start];
//   const cameFrom = new Map();

//   const gScore = new Map();
//   gScore.set(start, 0);

//   const fScore = new Map();
//   fScore.set(start, heuristic(start, goal));

//   while (openSet.length > 0) {
//     let current = openSet.reduce((a, b) =>
//       fScore.get(a) < fScore.get(b) ? a : b
//     );

//     if (current.x === goal.x && current.y === goal.y) {
//       return true;
//     }

//     openSet.splice(openSet.indexOf(current), 1);
//     for (const neighbor of neighbors(maze, current)) {
//       const tentative_gScore = gScore.get(current) + 1;

//       if (!gScore.has(neighbor) || tentative_gScore < gScore.get(neighbor)) {
//         cameFrom.set(neighbor, current);
//         gScore.set(neighbor, tentative_gScore);
//         fScore.set(neighbor, tentative_gScore + heuristic(neighbor, goal));
//         if (!openSet.includes(neighbor)) {
//           openSet.push(neighbor);
//         }
//       }
//     }
//   }

//   return false;
// }

// module.exports = { heuristic, neighbors, aStar };

// function findPath(maze, start, goal) {
//   const height = maze.length;
//   const width = maze[0].length;
//   const openList = [start];
//   const closedList = [];
//   const cameFrom = {};

//   function getNeighbors(node) {
//     const neighbors = [];
//     const directions = [
//       { x: 0, y: -1 },
//       { x: 0, y: 1 },
//       { x: -1, y: 0 },
//       { x: 1, y: 0 },
//     ];
//     for (const { x, y } of directions) {
//       const nx = node.x + x;
//       const ny = node.y + y;
//       if (
//         nx >= 0 &&
//         ny >= 0 &&
//         nx < width &&
//         ny < height &&
//         maze[ny][nx] === 0
//       ) {
//         neighbors.push({ x: nx, y: ny });
//       }
//     }
//     return neighbors;
//   }

//   function heuristic(node) {
//     return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
//   }

//   while (openList.length > 0) {
//     openList.sort((a, b) => heuristic(a) - heuristic(b));
//     const current = openList.shift();
//     if (current.x === goal.x && current.y === goal.y) {
//       return true;
//     }
//     closedList.push(current);
//     for (const neighbor of getNeighbors(current)) {
//       if (
//         !closedList.some((n) => n.x === neighbor.x && n.y === neighbor.y) &&
//         !openList.some((n) => n.x === neighbor.x && n.y === neighbor.y)
//       ) {
//         openList.push(neighbor);
//         cameFrom[`${neighbor.x},${neighbor.y}`] = current;
//       }
//     }
//   }
//   return false;
// }

// module.exports = { findPath };

/*
function findPath(maze) {
  const height = maze.length;
  const width = maze[0].length;
  const start = { x: 1, y: 1 };
  const goal = { x: width - 2, y: height - 2 };
  const openList = [start];
  const closedList = [];
  const cameFrom = {};

  function getNeighbors(node) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    for (const { x, y } of directions) {
      const nx = node.x + x;
      const ny = node.y + y;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < width &&
        ny < height &&
        maze[ny][nx] === 0
      ) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    return neighbors;
  }

  function heuristic(node) {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
  }

  while (openList.length > 0) {
    openList.sort((a, b) => heuristic(a) - heuristic(b));
    const current = openList.shift();
    if (current.x === goal.x && current.y === goal.y) {
      return true;
    }
    closedList.push(current);
    for (const neighbor of getNeighbors(current)) {
      if (
        !closedList.some((n) => n.x === neighbor.x && n.y === neighbor.y) &&
        !openList.some((n) => n.x === neighbor.x && n.y === neighbor.y)
      ) {
        openList.push(neighbor);
        cameFrom[`${neighbor.x},${neighbor.y}`] = current;
      }
    }
  }
  return false;
}


module.exports = { findPath };

*/
