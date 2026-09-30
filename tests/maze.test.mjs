import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMaze, moveInMaze, shortestMazePathLength } from '../src/utils/maze.js';

function seeded(seed = 123456789) {
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('generated mazes are fully connected and have reciprocal walls', () => {
  for (const [rows, cols] of [[7,7],[10,10],[14,14],[18,18],[24,24],[32,32]]) {
    const maze = generateMaze(rows, cols, seeded(rows * 100 + cols));
    assert.equal(maze.length, rows * cols);
    assert.ok(shortestMazePathLength(maze, rows, cols) > 0);
    for (let i = 0; i < maze.length; i += 1) {
      const r = Math.floor(i / cols), c = i % cols;
      if (c + 1 < cols) assert.equal(Boolean(maze[i] & 2), Boolean(maze[i + 1] & 8));
      if (r + 1 < rows) assert.equal(Boolean(maze[i] & 4), Boolean(maze[i + cols] & 1));
    }
  }
});

test('every open maze edge can be traversed and closed walls block movement', () => {
  const rows = 12, cols = 12;
  const maze = generateMaze(rows, cols, seeded(42));
  for (let i = 0; i < maze.length; i += 1) {
    for (const [dir, bit] of [['up',1],['right',2],['down',4],['left',8]]) {
      const next = moveInMaze(maze, rows, cols, i, dir);
      if (maze[i] & bit) assert.equal(next, i);
      else assert.notEqual(next, i);
    }
  }
});

test('invalid maze dimensions fail explicitly', () => {
  for (const dims of [[0,3],[3,1],[2.5,4],[65,3]]) assert.throws(() => generateMaze(...dims), RangeError);
});
