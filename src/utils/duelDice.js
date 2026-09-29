/** Pure Dice Duel rules. No DOM, clocks, audio, or random calls in the reducer.
 * Coordinates: x right, y down, z toward the viewer. Arena rows are 1..7;
 * START is (3, 0). The central net square is the initial TOP, not FRONT.
 */
export const SYMBOLS = ['rock', 'paper', 'scissors'];
export const DIRECTIONS = ['up', 'left', 'right', 'down'];
export const WIN_SCORE = 4;
export const STEP_MS = 480;
export const STEP_PAUSE_MS = 130;
export const FOLD_MS = 1200;
export const LEVELS = {
  sd: { minMoves: 3, maxMoves: 3, seconds: 25 },
  smp: { minMoves: 3, maxMoves: 4, seconds: 22 },
  sma: { minMoves: 3, maxMoves: 5, seconds: 20 },
  universitas: { minMoves: 4, maxMoves: 5, seconds: 16 },
};
export const FACE_THEME = {
  rock: { bg: '#ef4444', id: 'Batu', en: 'Rock' },
  paper: { bg: '#10b981', id: 'Kertas', en: 'Paper' },
  scissors: { bg: '#f59e0b', id: 'Gunting', en: 'Scissors' },
};
export const NET = [
  { face: 'back', col: 2, row: 1, id: 'BELAKANG', en: 'BACK' },
  { face: 'left', col: 1, row: 2, id: 'KIRI', en: 'LEFT' },
  { face: 'top', col: 2, row: 2, id: 'ATAS', en: 'TOP' },
  { face: 'right', col: 3, row: 2, id: 'KANAN', en: 'RIGHT' },
  { face: 'front', col: 2, row: 3, id: 'DEPAN', en: 'FRONT' },
  { face: 'bottom', col: 2, row: 4, id: 'BAWAH', en: 'BOTTOM' },
];
const NORMAL = { top: [0, 0, 1], bottom: [0, 0, -1], back: [0, -1, 0], front: [0, 1, 0], left: [-1, 0, 0], right: [1, 0, 0] };
const BASE_UP = { top: [0, -1, 0], bottom: [0, -1, 0], back: [0, 0, -1], front: [0, 0, 1], left: [0, -1, 0], right: [0, -1, 0] };
const BASE_RIGHT = { top: [1, 0, 0], bottom: [-1, 0, 0], back: [1, 0, 0], front: [1, 0, 0], left: [0, 0, 1], right: [0, 0, -1] };
const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const same = (a, b) => a.every((v, i) => v === b[i]);
const negate = v => v.map(n => -n || 0);
function rotateVector([x, y, z], direction) {
  const v = { down: [x, z, -y], up: [x, -z, y], right: [z, y, -x], left: [-z, y, x] }[direction];
  if (!v) throw new RangeError('Unknown roll direction');
  return v.map(n => n || 0);
}
export function faceRotation(position, face) {
  const choices = [BASE_UP[position], BASE_RIGHT[position], negate(BASE_UP[position]), negate(BASE_RIGHT[position])];
  const index = choices.findIndex(v => same(v, face.up));
  if (index < 0) throw new Error('Invalid face orientation');
  return index * 90;
}
export function cubeFromNet(shapes) {
  if (!Array.isArray(shapes) || shapes.length !== 6 || shapes.some(s => !SYMBOLS.includes(s))) throw new TypeError('A die needs six valid symbols');
  return Object.fromEntries(NET.map(({ face }, i) => [face, {
    id: `face-${i}`, shape: shapes[i],
    // The final net square folds twice about X, leaving its artwork inverted
    // relative to the bottom face rendered with rotateY(180deg).
    up: face === 'bottom' ? [0, 1, 0] : [...BASE_UP[face]],
  }]));
}
export function rollCube(cube, direction) {
  const next = {};
  for (const [position, face] of Object.entries(cube)) {
    const normal = rotateVector(NORMAL[position], direction);
    const target = Object.keys(NORMAL).find(p => same(NORMAL[p], normal));
    next[target] = { ...face, up: rotateVector(face.up, direction) };
  }
  return next;
}
export function advance(position, direction) {
  const d = DELTA[direction];
  if (!d) throw new RangeError('Unknown movement direction');
  return { col: position.col + d[0], row: position.row + d[1] };
}
export function projectPath(position, moves) {
  let p = position;
  return moves.map(m => { p = advance(p, m); return p; });
}
export function isValidPath(position, moves) {
  let p = position, previous;
  if (position.row === 0 && position.col !== 3) return false;
  if (position.col < 0 || position.col > 6 || position.row < 0 || position.row > 7) return false;
  for (const move of moves) {
    if (!DIRECTIONS.includes(move) || OPPOSITE[previous] === move) return false;
    if (p.row === 0 && move !== 'down') return false;
    p = advance(p, move);
    if (p.col < 0 || p.col > 6 || p.row < 1 || p.row > 7) return false;
    previous = move;
  }
  return true;
}
export function compareSymbols(die, tile) {
  if (!SYMBOLS.includes(die) || !SYMBOLS.includes(tile)) throw new TypeError('Invalid battle symbols');
  if (die === tile) return { outcome: 'draw', delta: 0 };
  return { rock: 'scissors', paper: 'rock', scissors: 'paper' }[die] === tile
    ? { outcome: 'win', delta: 1 } : { outcome: 'lose', delta: -1 };
}
function randomInt(max, random) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Random source must return [0, 1)');
  return Math.floor(value * max);
}
export function nextMoveCount(level = 'sma', random = Math.random) {
  const { minMoves, maxMoves } = LEVELS[level] || LEVELS.sma;
  return minMoves + randomInt(maxMoves - minMoves + 1, random);
}
export function createGame(level = 'sma', random = Math.random) {
  if (!Object.hasOwn(LEVELS, level)) throw new RangeError('Unknown school level');
  const pool = [...SYMBOLS, ...SYMBOLS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const faces = cubeFromNet(pool);
  return {
    phase: 'setup', status: 'planning', level, paused: false,
    board: Array.from({ length: 49 }, () => SYMBOLS[randomInt(3, random)]),
    initialFaces: faces, faces, position: { col: 3, row: 0 },
    planned: [], trail: [], origin: null, rollIndex: 0, rollDir: null, rollStage: null,
    activePlayer: 1, scores: [0, 0], turn: 1, winner: null, battle: null,
    remainingMs: LEVELS[level].seconds * 1000, movesRequired: nextMoveCount(level, random),
  };
}
export const isPlanning = state => state.phase === 'playing' && state.status === 'planning' && !state.paused;
export function canPlan(state, direction) {
  return isPlanning(state) && state.planned.length < state.movesRequired && isValidPath(state.position, [...state.planned, direction]);
}
export function duelReducer(state, action) {
  // Ignore callbacks that belonged to a previous turn.
  if (action.turn !== undefined && action.turn !== state.turn) return state;
  switch (action.type) {
    case 'RESET': return action.state;
    case 'NET': return state.phase === 'setup' ? { ...state, phase: 'planar' } : state;
    case 'FOLD': return state.phase === 'planar' ? { ...state, phase: 'folding' } : state;
    case 'START': return state.phase === 'folding' ? { ...state, phase: 'playing' } : state;
    case 'PAUSE': return state.paused === action.value ? state : { ...state, paused: action.value };
    case 'PLAN': return canPlan(state, action.direction) ? { ...state, planned: [...state.planned, action.direction] } : state;
    case 'UNDO': return isPlanning(state) && state.planned.length ? { ...state, planned: state.planned.slice(0, -1) } : state;
    case 'CLEAR': return isPlanning(state) && state.planned.length ? { ...state, planned: [] } : state;
    case 'ROLL': {
      if (!isPlanning(state) || state.remainingMs <= 0 || state.planned.length !== state.movesRequired || !isValidPath(state.position, state.planned)) return state;
      const position = advance(state.position, state.planned[0]);
      return { ...state, status: 'rolling', rollStage: 'animate', rollIndex: 0, rollDir: state.planned[0], origin: state.position, position, trail: [position] };
    }
    case 'ANIMATION_END': {
      if (state.status !== 'rolling' || state.rollStage !== 'animate' || action.index !== state.rollIndex) return state;
      return { ...state, faces: rollCube(state.faces, state.rollDir), rollDir: null, rollStage: 'pause' };
    }
    case 'NEXT_STEP': {
      if (state.status !== 'rolling' || state.rollStage !== 'pause' || action.index !== state.rollIndex) return state;
      const nextIndex = state.rollIndex + 1;
      if (nextIndex < state.planned.length) {
        const direction = state.planned[nextIndex], position = advance(state.position, direction);
        return { ...state, rollIndex: nextIndex, rollStage: 'animate', rollDir: direction, position, trail: [...state.trail, position] };
      }
      const tile = state.board[(state.position.row - 1) * 7 + state.position.col];
      return { ...state, status: 'feedback', rollDir: null, rollStage: null,
        battle: { ...compareSymbols(state.faces.bottom.shape, tile), face: state.faces.bottom, tile, player: state.activePlayer } };
    }
    case 'TICK': {
      if (!isPlanning(state) || !Number.isFinite(action.elapsed) || action.elapsed <= 0) return state;
      const remainingMs = Math.max(0, state.remainingMs - action.elapsed);
      return remainingMs > 0 ? { ...state, remainingMs } : { ...state, remainingMs: 0, status: 'feedback',
        battle: { outcome: 'timeout', delta: -1, player: state.activePlayer } };
    }
    case 'ACK': {
      if (state.status !== 'feedback' || !state.battle) return state;
      const scores = [...state.scores];
      scores[state.activePlayer - 1] += state.battle.delta; // Negative scores match the reference clip.
      if (scores[state.activePlayer - 1] >= WIN_SCORE) return { ...state, phase: 'ended', status: 'ended', battle: null, winner: state.activePlayer, scores };
      const cfg = LEVELS[state.level];
      const count = Number.isInteger(action.nextMoves) && action.nextMoves >= cfg.minMoves && action.nextMoves <= cfg.maxMoves ? action.nextMoves : cfg.minMoves;
      return { ...state, scores, battle: null, activePlayer: 3 - state.activePlayer, turn: state.turn + 1,
        status: 'planning', remainingMs: cfg.seconds * 1000, movesRequired: count,
        planned: [], trail: [], origin: null, rollIndex: 0, rollDir: null, rollStage: null };
    }
    default: return state;
  }
}
