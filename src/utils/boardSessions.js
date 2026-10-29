import { addRandomTile, canMove2048, move2048 } from './game2048.js';
import { nonogramSolved } from './nonogram.js';

export const initial2048Session = { state: 'setup', board: Array(16).fill(0), score: 0, moves: 0 };
export const initialNonogramSession = { state: 'setup', puzzle: null, marks: [], moves: 0 };

// Random values are sampled by the event handler, never inside a React reducer.
export function reduce2048Session(session, action) {
  if (action.type === 'restore') return action.session;
  if (action.type === 'setup') return { ...initial2048Session };
  if (action.type === 'start') return { state: 'playing', board: [...action.board], score: 0, moves: 0 };
  if (action.type !== 'move' || session.state !== 'playing' || !['up', 'down', 'left', 'right'].includes(action.direction)) return session;
  const result = move2048(session.board, action.direction);
  if (!result.moved) return session;
  let index = 0;
  const board = addRandomTile(result.board, () => action.randomValues[index++]);
  const ended = Math.max(...board) >= action.target || !canMove2048(board);
  return { state: ended ? 'ended' : 'playing', board, score: session.score + result.score, moves: session.moves + 1 };
}

export function reduceNonogramSession(session, action) {
  if (action.type === 'restore') return action.session;
  if (action.type === 'setup') return { ...initialNonogramSession };
  if (action.type === 'start') return { state: 'playing', puzzle: action.puzzle, marks: Array(action.puzzle.cells.length).fill(0), moves: 0 };
  if (action.type !== 'mark' || session.state !== 'playing' || !Number.isInteger(action.index) || action.index < 0 || action.index >= session.marks.length) return session;
  const marks = [...session.marks];
  const value = action.mode === 'cross' ? 2 : 1;
  marks[action.index] = marks[action.index] === value ? 0 : value;
  return { ...session, marks, moves: session.moves + 1, state: nonogramSolved(session.puzzle.cells, marks) ? 'ended' : 'playing' };
}
