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
