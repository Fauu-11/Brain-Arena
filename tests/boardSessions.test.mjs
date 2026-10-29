import test from 'node:test';
import assert from 'node:assert/strict';
import { initial2048Session, initialNonogramSession, reduce2048Session, reduceNonogramSession } from '../src/utils/boardSessions.js';
import { create2048 } from '../src/utils/game2048.js';
import { generateNonogram } from '../src/utils/nonogram.js';
import { mulberry32 } from '../src/utils/competitive.js';

const start2048 = board => reduce2048Session(initial2048Session, { type: 'start', board });
const move = (session, direction, target = 2048) => reduce2048Session(session, { type: 'move', direction, target, randomValues: [0, 0] });
const puzzle = { size: 3, cells: [true, false, false, false, true, false, false, false, true] };
const startNonogram = () => reduceNonogramSession(initialNonogramSession, { type: 'start', puzzle });

test('2048 reducer is replay-safe without consuming global randomness or mutating input', () => {
  const session = start2048([2, 2, 0, 0, ...Array(12).fill(0)]);
  const snapshot = structuredClone(session);
  const first = move(session, 'left');
  const second = move(session, 'left');
  assert.deepEqual(first, second);
  assert.deepEqual(session, snapshot);
  assert.equal(first.score, 4);
  assert.equal(first.moves, 1);
});
test('2048 queued valid actions use the preceding board and accumulate score', () => {
  const first = move(start2048([2, 2, 4, 0, ...Array(12).fill(0)]), 'left');
  const second = move(first, 'left');
  assert.equal(second.score, 12);
  assert.equal(second.moves, 2);
  assert.deepEqual(second.board.slice(0, 4), [8, 2, 2, 0]);
});
test('2048 victory is terminal immediately and a new game cannot inherit an end timer', () => {
  const won = move(start2048([64, 64, 0, 0, ...Array(12).fill(0)]), 'left', 128);
  assert.equal(won.state, 'ended');
  assert.equal(move(won, 'right', 128), won);
  const restarted = reduce2048Session(won, { type: 'start', board: create2048(mulberry32(4)) });
  assert.equal(restarted.state, 'playing');
  assert.equal(restarted.moves, 0);
  assert.equal(restarted.score, 0);
});
test('2048 invalid direction and no-op move leave board, score and moves untouched', () => {
  const session = start2048([2, 0, 0, 0, ...Array(12).fill(0)]);
  assert.equal(move(session, 'left'), session);
  assert.equal(move(session, 'invalid'), session);
});
test('2048 full board with no adjacent merge after a legal move ends the session', () => {
  const before = [2, 2, 8, 16, 8, 16, 32, 64, 16, 32, 64, 128, 32, 64, 128, 256];
  const after = move(start2048(before), 'left', 4096);
  assert.equal(after.state, 'ended');
});
test('Nonogram repeated reducer evaluation counts one action once without side effects', () => {
  const session = startNonogram();
  const snapshot = structuredClone(session);
  const action = { type: 'mark', index: 0, mode: 'fill' };
  const a = reduceNonogramSession(session, action);
  const b = reduceNonogramSession(session, action);
  assert.deepEqual(a, b);
  assert.equal(a.moves, 1);
  assert.deepEqual(session, snapshot);
});
test('Nonogram finishing move commits marks, counter and terminal state together', () => {
  let session = startNonogram();
  for (const index of [0, 4, 8]) session = reduceNonogramSession(session, { type: 'mark', index, mode: 'fill' });
  assert.equal(session.state, 'ended');
  assert.equal(session.moves, 3);
  assert.equal(reduceNonogramSession(session, { type: 'mark', index: 0 }), session);
});
test('Nonogram clue-equivalent solution is accepted', () => {
  let session = startNonogram();
  for (const index of [2, 4, 6]) session = reduceNonogramSession(session, { type: 'mark', index, mode: 'fill' });
  assert.equal(session.state, 'ended');
});
test('Nonogram cross/fill/clear and invalid coordinates have predictable effects', () => {
  let session = startNonogram();
  session = reduceNonogramSession(session, { type: 'mark', index: 1, mode: 'cross' });
  assert.equal(session.marks[1], 2);
  session = reduceNonogramSession(session, { type: 'mark', index: 1, mode: 'fill' });
  assert.equal(session.marks[1], 1);
  session = reduceNonogramSession(session, { type: 'mark', index: 1, mode: 'fill' });
  assert.equal(session.marks[1], 0);
  assert.equal(session.moves, 3);
  assert.equal(reduceNonogramSession(session, { type: 'mark', index: -1 }), session);
});
test('Nonogram restarting clears prior marks and terminal status', () => {
  let session = startNonogram();
  for (const index of [0, 4, 8]) session = reduceNonogramSession(session, { type: 'mark', index });
  const next = generateNonogram(5, 0.4, mulberry32(21));
  session = reduceNonogramSession(session, { type: 'start', puzzle: next });
  assert.equal(session.state, 'playing');
  assert.equal(session.moves, 0);
  assert.deepEqual(session.marks, Array(25).fill(0));
});
