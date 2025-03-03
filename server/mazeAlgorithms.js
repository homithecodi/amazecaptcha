/*** ----------------Randomg Maze---------------- ***/
function generateMazeRandom(width, height, wallDensity = 0.3) {
  // Default Wall Density set to 30%
  // Fill the Maze with empty paths
  const maze = Array.from({ length: height }, () => Array(width).fill(0));
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (Math.random() < wallDensity) {
        maze[i][j] = 1;
      }
    }
  }

  // Ensure the start and end points are paths
  maze[1][1] = 0;
  maze[height - 2][width - 2] = 0;

  return maze;
}

/*** --------------Depth-First Search------------ ***/

function generateMazeDFS(width, height) {
  const maze = Array.from({ length: height }, () => Array(width).fill(1)); // Initialize maze with walls
  const stack = [];
  const directions = [
    [0, 2], // Down
    [2, 0], // Right
    [0, -2], // Up
    [-2, 0], // Left
  ];

  function isValid(x, y) {
    // Check if x and y are within the maze boundaries
    return x >= 0 && y >= 0 && x < width && y < height;
  }

  function shuffle(array) {
    // Shuffles the directions to ensure that the maze generation is not biased
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function carvePath(x, y) {
    maze[y][x] = 0; // Mark the cell as a path
    stack.push([x, y]);

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      shuffle(directions);

      let carved = false;
      for (const [dx, dy] of directions) {
        const nx = cx + dx;
        const ny = cy + dy;
        const mx = cx + dx / 2;
        const my = cy + dy / 2;

        if (isValid(nx, ny) && maze[ny][nx] === 1) {
          maze[my][mx] = 0; // Remove the wall
          maze[ny][nx] = 0; // Mark the new cell as a path
          stack.push([nx, ny]);
          carved = true;
          break;
        }
      }

      if (!carved) {
        stack.pop();
      }
    }
  }

  // Start carving from the top-left corner
  carvePath(0, 0);

  // // Ensure the border cells are all walls
  // for (let i = 0; i < height; i++) {
  //   maze[i][0] = 1;
  //   maze[i][width - 1] = 1;
  // }
  // for (let j = 0; j < width; j++) {
  //   maze[0][j] = 1;
  //   maze[height - 1][j] = 1;
  // }

  // Ensure the start and end points are paths
  maze[1][1] = 0; // Adjust this to your desired starting point
  maze[height - 2][width - 2] = 0; // Adjust this to your desired ending point

  return maze;
}

/*** ---------------Prim's Algorithm------------- ***/

// server/mazeAlgorithms.js
function generateMazePrim(width, height) {
  const maze = Array.from({ length: height }, () => Array(width).fill(1)); // Start with all walls
  const walls = [];
  const directions = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Adds walls of the current cell to the stack of walls
  function addWalls(x, y) {
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (ny > 0 && ny < height && nx > 0 && nx < width && maze[ny][nx] === 1) {
        walls.push([nx, ny, x, y]);
      }
    }
  }

  function carve(x, y) {
    maze[y][x] = 0;
    // Add neighbour walls to list of walls to be processed
    addWalls(x, y);
  }

  carve(1, 1);

  while (walls.length > 0) {
    shuffle(walls);
    const [x, y, px, py] = walls.pop();
    if (maze[y][x] === 1) {
      maze[(y + py) / 2][(x + px) / 2] = 0;
      carve(x, y);
    }
  }

  // Ensure the border cells are all walls
  for (let i = 0; i < height; i++) {
    maze[i][0] = 1;
    maze[i][width - 1] = 1;
  }
  for (let j = 0; j < width; j++) {
    maze[0][j] = 1;
    maze[height - 1][j] = 1;
  }

  // Ensure the start and end points are paths
  maze[1][1] = 0; // Adjust this to your desired starting point
  maze[height - 2][width - 2] = 0; // Adjust this to your desired ending point

  return maze;
}

/*** -------------Kruskal's Algorithm------------ ***/

// server/mazeAlgorithms.js
function generateMazeKruskal(width, height) {
  const maze = Array.from({ length: height }, () => Array(width).fill(1)); // Start with all walls
  const sets = [];
  const edges = [];
  const directions = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ];

  // Finds and returns the set that contains the given cell
  function findSet(cell) {
    for (const set of sets) {
      if (set.has(cell)) return set;
    }
    return null;
  }

  // Merges two sets into one, ensuring all cells belong to a single set
  function unionSets(set1, set2) {
    set1.forEach((cell) => set2.add(cell));
    sets.splice(sets.indexOf(set1), 1);
  }

  // Sets: Each cell is initially its own set.
  // Edges: All possible edges (walls) between cells are added to the edges list.
  for (let y = 1; y < height; y += 2) {
    for (let x = 1; x < width; x += 2) {
      const cell = `${x},${y}`;
      sets.push(new Set([cell]));
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny > 0 && ny < height && nx > 0 && nx < width) {
          edges.push([x, y, nx, ny]);
        }
      }
    }
  }

  // Randomly Select Edge: Randomly select an edge from the list.
  // Find Sets: Determine the sets to which the adjacent cells belong.
  // Union: If the cells belong to different sets
  // remove the wall between them and union the sets.
  // This ensures no cycles are formed.
  while (edges.length > 0) {
    const [x, y, nx, ny] = edges.splice(
      Math.floor(Math.random() * edges.length),
      1
    )[0];
    const set1 = findSet(`${x},${y}`);
    const set2 = findSet(`${nx},${ny}`);
    if (set1 !== set2) {
      maze[(y + ny) / 2][(x + nx) / 2] = 0;
      maze[y][x] = 0;
      maze[ny][nx] = 0;
      unionSets(set1, set2);
    }
  }

  // Ensure the border cells are all walls
  for (let i = 0; i < height; i++) {
    maze[i][0] = 1;
    maze[i][width - 1] = 1;
  }
  for (let j = 0; j < width; j++) {
    maze[0][j] = 1;
    maze[height - 1][j] = 1;
  }

  // Ensure the start and end points are paths
  maze[1][1] = 0; // Adjust this to your desired starting point
  maze[height - 2][width - 2] = 0; // Adjust this to your desired ending point

  return maze;
}

/*** -------------Recursive Division------------- ***/
function generateMazeDivision(width, height) {
  const maze = Array.from({ length: height }, () => Array(width).fill(0)); // Start with all paths

  function divide(x, y, w, h, orientation) {
    if (w < 2 || h < 2) return;

    const horizontal = orientation === "horizontal";
    let wx = x + (horizontal ? 0 : Math.floor(Math.random() * (w - 2)));
    let wy = y + (horizontal ? Math.floor(Math.random() * (h - 2)) : 0);
    const px = wx + (horizontal ? Math.floor(Math.random() * w) : 0);
    const py = wy + (horizontal ? 0 : Math.floor(Math.random() * h));
    const dx = horizontal ? 1 : 0;
    const dy = horizontal ? 0 : 1;
    const length = horizontal ? w : h;
    const dir = horizontal ? "horizontal" : "vertical";

    for (let i = 0; i < length; i++) {
      if (wx !== px || wy !== py) {
        maze[wy][wx] = 1;
      }
      wx += dx;
      wy += dy;
    }

    const [nx, ny] = [x, y];
    const [nw, nh] = horizontal ? [w, wy - y + 1] : [wx - x + 1, h];
    divide(nx, ny, nw, nh, dir);

    const [nx2, ny2] = horizontal ? [x, wy + 1] : [wx + 1, y];
    const [nw2, nh2] = horizontal ? [w, y + h - wy - 1] : [x + w - wx - 1, h];
    divide(nx2, ny2, nw2, nh2, dir);
  }

  divide(0, 0, width, height, "horizontal");

  // Ensure there are openings in the walls
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      if (maze[y][x] === 1) {
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ];
        const [dx, dy] =
          directions[Math.floor(Math.random() * directions.length)];
        maze[y + dy][x + dx] = 0;
      }
    }
  }

  // Ensure the border cells are all walls
  for (let i = 0; i < height; i++) {
    maze[i][0] = 1;
    maze[i][width - 1] = 1;
  }
  for (let j = 0; j < width; j++) {
    maze[0][j] = 1;
    maze[height - 1][j] = 1;
  }

  // Ensure the start and end points are paths
  maze[1][1] = 0; // Adjust this to your desired starting point
  maze[height - 2][width - 2] = 0; // Adjust this to your desired ending point

  return maze;
}

/*** ------------Recursive Division 2------------ ***/
/*
function generateMazeDivision2(grid) {
  const divide = (x, y, width, height, orientation) => {
    if (width < 2 || height < 2) return;

    const horizontal = orientation === "horizontal";
    const wx = x + (horizontal ? 0 : Math.floor(Math.random() * (width - 2)));
    const wy = y + (horizontal ? Math.floor(Math.random() * (height - 2)) : 0);

    const px = wx + (horizontal ? Math.floor(Math.random() * width) : 0);
    const py = wy + (horizontal ? 0 : Math.floor(Math.random() * height));

    const dx = horizontal ? 1 : 0;
    const dy = horizontal ? 0 : 1;
    const length = horizontal ? width : height;

    for (let i = 0; i < length; i++) {
      if (wx !== px || wy !== py) grid[wy][wx] = "wall";
      wx += dx;
      wy += dy;
    }

    const nextOrientation = (width, height) => {
      if (width < height) return "horizontal";
      if (height < width) return "vertical";
      return Math.random() < 0.5 ? "horizontal" : "vertical";
    };

    divide(
      x,
      y,
      horizontal ? width : wx - x + 1,
      horizontal ? wy - y + 1 : height,
      nextOrientation(width, height)
    );
    divide(
      horizontal ? x : wx + 1,
      horizontal ? wy + 1 : y,
      horizontal ? width : x + width - wx - 1,
      horizontal ? y + height - wy - 1 : height,
      nextOrientation(width, height)
    );
  };

  divide(0, 0, grid[0].length, grid.length, "horizontal");
}
*/

/*** -------------Randomized Kruskal------------- ***/
/*
function createDisjointSet(size) {
  const parent = Array.from({ length: size }, (_, i) => i);
  const rank = Array(size).fill(0);

  const find = (x) => {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  };

  const union = (x, y) => {
    const rootX = find(x);
    const rootY = find(y);
    if (rootX !== rootY) {
      if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
    }
  };

  return { find, union };
}

function generateMazeRandKruskal(grid) {
  const width = grid[0].length;
  const height = grid.length;
  const disjointSet = createDisjointSet(width * height);

  let edges = [];
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (r > 0) edges.push([r * width + c, (r - 1) * width + c]);
      if (c > 0) edges.push([r * width + c, r * width + (c - 1)]);
    }
  }

  edges = edges.sort(() => Math.random() - 0.5);

  edges.forEach(([u, v]) => {
    if (disjointSet.find(u) !== disjointSet.find(v)) {
      disjointSet.union(u, v);
      const [ux, uy] = [Math.floor(u / width), u % width];
      const [vx, vy] = [Math.floor(v / width), v % width];
      if (ux === vx) {
        grid[ux][Math.min(uy, vy) + 1] = "path";
      } else {
        grid[Math.min(ux, vx) + 1][uy] = "path";
      }
    }
  });
}
*/

/*** ----------------Growing Tree---------------- ***/

// server/mazeAlgorithms.js
function generateMazeGrowingTree(width, height) {
  // Ensure the maze dimensions are odd
  if (width % 2 === 0) width++;
  if (height % 2 === 0) height++;

  const maze = Array.from({ length: height }, () => Array(width).fill(1)); // Start with all walls
  const cells = [];
  const directions = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ];

  // Randomly shuffle the directions array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function carve(x, y) {
    cells.push([x, y]);
    maze[y][x] = 0;

    while (cells.length > 0) {
      const index = Math.floor(Math.random() * cells.length);
      const cell = cells[index];

      shuffle(directions);
      let carved = false;

      for (const [dx, dy] of directions) {
        const nx = cell[0] + dx;
        const ny = cell[1] + dy;
        // Converts the target cell and the intermediate cell into paths (0).
        if (
          ny >= 0 && // Allow carving into the first row
          ny < height &&
          nx >= 0 && // Allow carving into the first column
          nx < width &&
          maze[ny][nx] === 1
        ) {
          maze[ny][nx] = 0;
          maze[cell[1] + dy / 2][cell[0] + dx / 2] = 0;
          cells.push([nx, ny]);
          carved = true;
          break;
        }
      }

      if (!carved) {
        cells.splice(index, 1);
      }
    }
  }

  carve(0, 0);

  // // Ensure the border cells are all walls
  // for (let i = 0; i < height; i++) {
  //   maze[i][0] = 1;
  //   maze[i][width - 1] = 1;
  // }
  // for (let j = 0; j < width; j++) {
  //   maze[0][j] = 1;
  //   maze[height - 1][j] = 1;
  // }

  // Ensure the start and end points are paths
  maze[1][1] = 0; // Adjust this to your desired starting point
  maze[height - 2][width - 2] = 0; // Adjust this to your desired ending point

  return maze;
}

/*
function generateMazeGrowingTree(grid) {
  const getUnvisitedNeighbors = (x, y, grid) => {
    const neighbors = [];
    if (x > 1 && grid[y][x - 2] === "wall") neighbors.push({ x: x - 2, y });
    if (x < grid[0].length - 2 && grid[y][x + 2] === "wall")
      neighbors.push({ x: x + 2, y });
    if (y > 1 && grid[y - 2][x] === "wall") neighbors.push({ x, y: y - 2 });
    if (y < grid.length - 2 && grid[y + 2][x] === "wall")
      neighbors.push({ x, y: y + 2 });
    return neighbors;
  };

  const removeWall = (a, b, grid) => {
    const dx = (b.x - a.x) / 2;
    const dy = (b.y - a.y) / 2;
    grid[a.y + dy][a.x + dx] = "path";
  };

  const cells = [{ x: 0, y: 0 }];
  grid[0][0] = "path";

  while (cells.length > 0) {
    const index = Math.floor(Math.random() * cells.length);
    const cell = cells[index];
    const neighbors = getUnvisitedNeighbors(cell.x, cell.y, grid);

    if (neighbors.length > 0) {
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[chosen.y][chosen.x] = "path";
      removeWall(cell, chosen, grid);
      cells.push(chosen);
    } else {
      cells.splice(index, 1);
    }
  }
}
*/

module.exports = {
  generateMazeRandom,
  generateMazeDFS,
  generateMazePrim,
  generateMazeKruskal,
  generateMazeDivision,
  // generateMazeDivision2,
  // generateMazeRandKruskal,
  generateMazeGrowingTree,
};
