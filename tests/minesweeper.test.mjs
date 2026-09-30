import test from 'node:test';
import assert from 'node:assert/strict';
import { createMinefield, revealArea, chordReveal, getNeighbors, formatMinesweeperTime } from '../src/utils/minesweeper.js';

const seeded = (() => {
  let seed = 123456789;
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
})();

test('minefield has exact mines and a safe first-click neighborhood', () => {
  const rows = 9, cols = 9, mines = 10, safe = 40;
  const board = createMinefield(rows, cols, mines, safe, seeded);
  assert.equal(board.filter(c => c.mine).length, mines);
  assert.equal(board[safe].mine, false);
  for (const i of getNeighbors(safe, rows, cols)) assert.equal(board[i].mine, false);
});

test('adjacent counts match surrounding mines', () => {
  const rows = 12, cols = 12, mines = 20, safe = 0;
  const board = createMinefield(rows, cols, mines, safe, seeded);
  board.forEach((cell, i) => {
    if (cell.mine) return;
    const expected = getNeighbors(i, rows, cols).filter(n => board[n].mine).length;
    assert.equal(cell.adjacent, expected);
  });
});

test('zero reveal expands through connected safe cells', () => {
  const board = [
    { mine:false, adjacent:0 }, { mine:false, adjacent:1 }, { mine:true, adjacent:0 },
    { mine:false, adjacent:0 }, { mine:false, adjacent:1 }, { mine:false, adjacent:1 },
    { mine:false, adjacent:0 }, { mine:false, adjacent:0 }, { mine:false, adjacent:0 },
  ];
  const revealed = revealArea(board, 3, 3, 6);
  assert.ok(revealed.has(0));
  assert.ok(revealed.has(4));
  assert.ok(revealed.has(8));
  assert.equal(revealed.has(2), false);
});

test('flags block reveal and chord opens neighbors only when flag count matches', () => {
  const board = [
    { mine:true, adjacent:0 }, { mine:false, adjacent:1 },
    { mine:false, adjacent:1 }, { mine:false, adjacent:1 },
  ];
  const revealed = new Set([3]);
  const noChord = chordReveal(board, 2, 2, 3, revealed, new Set());
  assert.equal(noChord.size, 1);
  const chorded = chordReveal(board, 2, 2, 3, revealed, new Set([0]));
  assert.ok(chorded.has(1));
  assert.ok(chorded.has(2));
  assert.equal(chorded.has(0), false);
});

test('time formatting is stable', () => {
  assert.equal(formatMinesweeperTime(0), '00:00');
  assert.equal(formatMinesweeperTime(65), '01:05');
  assert.equal(formatMinesweeperTime(3601), '60:01');
});
