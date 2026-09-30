export const MAZE_DIRECTIONS = {
  up: { dr: -1, dc: 0, wall: 1, opposite: 4 },
  right: { dr: 0, dc: 1, wall: 2, opposite: 8 },
  down: { dr: 1, dc: 0, wall: 4, opposite: 1 },
  left: { dr: 0, dc: -1, wall: 8, opposite: 2 },
};

function assertSize(rows, cols) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 2 || cols < 2 || rows > 64 || cols > 64) {
    throw new RangeError('Maze rows and cols must be integers between 2 and 64.');
  }
}

export function generateMaze(rows, cols, rng = Math.random) {
  assertSize(rows, cols);
  if (typeof rng !== 'function') throw new TypeError('rng must be a function.');
  const total = rows * cols;
  const walls = Array(total).fill(15);
  const visited = new Uint8Array(total);
  const stack = [0];
  visited[0] = 1;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const r = Math.floor(current / cols);
    const c = current % cols;
    const options = [];
    for (const [name, dir] of Object.entries(MAZE_DIRECTIONS)) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const next = nr * cols + nc;
      if (!visited[next]) options.push({ name, next, ...dir });
    }
    if (!options.length) {
      stack.pop();
      continue;
    }
    const raw = Number(rng());
    const normalized = Number.isFinite(raw) ? Math.max(0, Math.min(0.999999999, raw)) : 0;
    const pick = options[Math.floor(normalized * options.length)];
    walls[current] &= ~pick.wall;
    walls[pick.next] &= ~pick.opposite;
    visited[pick.next] = 1;
    stack.push(pick.next);
  }

  return walls;
}

export function moveInMaze(maze, rows, cols, index, direction) {
  assertSize(rows, cols);
  const dir = MAZE_DIRECTIONS[direction];
  if (!dir || !Array.isArray(maze) || maze.length !== rows * cols || !Number.isInteger(index) || index < 0 || index >= maze.length) return index;
  if (maze[index] & dir.wall) return index;
  const r = Math.floor(index / cols) + dir.dr;
  const c = index % cols + dir.dc;
  if (r < 0 || r >= rows || c < 0 || c >= cols) return index;
  return r * cols + c;
}

export function shortestMazePathLength(maze, rows, cols, start = 0, target = rows * cols - 1) {
  assertSize(rows, cols);
  if (!Array.isArray(maze) || maze.length !== rows * cols) throw new RangeError('Maze data does not match its dimensions.');
  const distance = Array(maze.length).fill(-1);
  const queue = [start];
  distance[start] = 0;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    if (current === target) return distance[current];
    for (const name of Object.keys(MAZE_DIRECTIONS)) {
      const next = moveInMaze(maze, rows, cols, current, name);
      if (next !== current && distance[next] === -1) {
        distance[next] = distance[current] + 1;
        queue.push(next);
      }
    }
  }
  return -1;
}
