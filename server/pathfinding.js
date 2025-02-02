// server/pathfinding.js
function findPath(maze, start, goal) {
  const height = maze.length;
  const width = maze[0].length;
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
