import test from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, DIRECTIONS, NET, LEVELS, WIN_SCORE, cubeFromNet, rollCube, faceRotation, projectPath,
  isValidPath, compareSymbols, createGame, canPlan, duelReducer as reduce, nextMoveCount } from '../src/utils/duelDice.js';
const seedRng = (seed = 123456789) => () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
const referenceShapes = ['paper', 'rock', 'scissors', 'paper', 'rock', 'scissors'];
const netCube = () => cubeFromNet(referenceShapes);
function playing() { let s = createGame('sma', seedRng()); for (const type of ['NET', 'FOLD', 'START']) s = reduce(s, { type }); return s; }
function execute(s, moves) {
  s = { ...s, movesRequired: moves.length };
  for (const direction of moves) s = reduce(s, { type: 'PLAN', direction });
  assert.equal(s.planned.length, moves.length);
  s = reduce(s, { type: 'ROLL' });
  for (let index = 0; index < moves.length; index++) {
    s = reduce(s, { type: 'ANIMATION_END', index }); s = reduce(s, { type: 'NEXT_STEP', index });
  }
  assert.equal(s.status, 'feedback');
  return s;
}

test('The center of the net becomes the TOP; the tail becomes BOTTOM', () => {
  const cube = netCube();
  assert.equal(NET.find(n => n.col === 2 && n.row === 2).face, 'top');
  assert.equal(cube.top.shape, 'scissors'); assert.equal(cube.top.id, 'face-2');
  assert.equal(cube.bottom.id, 'face-5'); assert.equal(faceRotation('bottom', cube.bottom), 180);
});
for (const direction of DIRECTIONS) {
  test(`Four ${direction} rolls restore every face AND icon rotation`, () => {
    const initial = netCube(); let cube = initial;
    for (let i = 0; i < 4; i++) cube = rollCube(cube, direction);
    assert.deepEqual(cube, initial);
  });
  test(`${direction} and its inverse restore the physical die`, () => {
    const inverse = { up: 'down', down: 'up', left: 'right', right: 'left' };
    assert.deepEqual(rollCube(rollCube(netCube(), direction), inverse[direction]), netCube());
  });
}
test('Rotation does not mutate the source cube', () => {
  const c = netCube(), before = structuredClone(c); rollCube(c, 'right'); assert.deepEqual(c, before);
});
test('10,000 random rolls preserve six unique faces and valid artwork rotations', () => {
  const rng = seedRng(); let cube = netCube();
  for (let i = 0; i < 10000; i++) {
    cube = rollCube(cube, DIRECTIONS[Math.floor(rng() * 4)]);
    assert.equal(new Set(Object.values(cube).map(f => f.id)).size, 6);
    for (const [position, face] of Object.entries(cube)) assert.ok([0, 90, 180, 270].includes(faceRotation(position, face)));
  }
});
test('Every one of the nine rock-paper-scissors matchups is correct', () => {
  for (const a of SYMBOLS) for (const b of SYMBOLS) {
    const result = compareSymbols(a, b), reverse = compareSymbols(b, a);
    assert.equal(result.delta + reverse.delta, 0);
    assert.equal(result.outcome === 'draw', a === b);
  }
  assert.equal(compareSymbols('rock', 'scissors').outcome, 'win');
  assert.equal(compareSymbols('scissors', 'paper').outcome, 'win');
  assert.equal(compareSymbols('paper', 'rock').outcome, 'win');
});
test('START accepts only the first downward step', () => {
  for (const d of DIRECTIONS) assert.equal(isValidPath({ col: 3, row: 0 }, [d]), d === 'down');
  assert.equal(isValidPath({ col: 2, row: 0 }, ['down']), false);
});
test('No immediate reverse, off-board moves, or return to START', () => {
  for (const [position, moves] of [
    [{col:3,row:0},['down','up']], [{col:0,row:1},['left']], [{col:6,row:1},['right']],
    [{col:3,row:7},['down']], [{col:3,row:1},['up']], [{col:3,row:3},['right','left']],
  ]) assert.equal(isValidPath(position, moves), false);
  assert.equal(isValidPath({col:3,row:3},['right','down','left','up']), true);
});
test('Route projection respects arena coordinates', () => {
  assert.deepEqual(projectPath({col:3,row:0}, ['down','down','right']), [{col:3,row:1},{col:3,row:2},{col:4,row:2}]);
});
test('Generated games contain 49 tiles and two of each die symbol', () => {
  const rng = seedRng();
  for (const level of Object.keys(LEVELS)) for (let i = 0; i < 100; i++) {
    const game = createGame(level, rng), shapes = Object.values(game.faces).map(f => f.shape);
    assert.equal(game.board.length, 49);
    for (const symbol of SYMBOLS) assert.equal(shapes.filter(s => s === symbol).length, 2);
    assert.ok(game.movesRequired >= LEVELS[level].minMoves && game.movesRequired <= LEVELS[level].maxMoves);
  }
});
test('Random steps include both limits and SMA uses 20 seconds', () => {
  for (const level of Object.keys(LEVELS)) {
    assert.equal(nextMoveCount(level, () => 0), LEVELS[level].minMoves);
    assert.equal(nextMoveCount(level, () => .999999), LEVELS[level].maxMoves);
  }
  assert.equal(LEVELS.sma.seconds, 20);
});
test('Invalid rule inputs fail explicitly', () => {
  assert.throws(() => cubeFromNet(['rock'])); assert.throws(() => compareSymbols('fire', 'rock'));
  assert.throws(() => createGame('invalid')); assert.throws(() => createGame('sma', () => 1));
});
test('Setup, memory and folding do not spend timer time', () => {
  let s = createGame('sma', seedRng());
  for (const action of ['NET', 'FOLD']) {
    const before = s.remainingMs; s = reduce(s, { type: 'TICK', elapsed: 50000 }); assert.equal(s.remainingMs, before);
    s = reduce(s, { type: action });
  }
  assert.equal(reduce(s, { type: 'TICK', elapsed: 50000 }).phase, 'folding');
});
test('Planning cannot exceed the required count and ROLL requires a full route', () => {
  let s = { ...playing(), movesRequired: 3 };
  assert.equal(reduce(s, {type:'ROLL'}), s);
  for (let i = 0; i < 8; i++) s = reduce(s, {type:'PLAN', direction:'down'});
  assert.equal(s.planned.length, 3); assert.equal(canPlan(s, 'right'), false);
});
test('Undo and Clear change only the plan, not the die', () => {
  let s = playing(); s = reduce(s, {type:'PLAN', direction:'down'}); s = reduce(s, {type:'PLAN', direction:'right'});
  const original = { position:s.position, faces:s.faces };
  s = reduce(s, {type:'UNDO'}); assert.deepEqual(s.planned, ['down']);
  s = reduce(s, {type:'CLEAR'}); assert.deepEqual(s.planned, []);
  assert.deepEqual({position:s.position,faces:s.faces}, original);
});
test('Rolling locks input and timer; repeated animation callbacks are ignored', () => {
  let s = { ...playing(), movesRequired: 3 };
  for (const direction of ['down','right','down']) s = reduce(s, {type:'PLAN',direction});
  s = reduce(s, {type:'ROLL'});
  for (const action of [{type:'ROLL'},{type:'PLAN',direction:'down'},{type:'UNDO'},{type:'CLEAR'},{type:'TICK',elapsed:99999}]) assert.equal(reduce(s, action), s);
  s = reduce(s, {type:'ANIMATION_END',index:0}); assert.equal(reduce(s, {type:'ANIMATION_END',index:0}), s);
});
test('All three visible video turns reproduce loss, win and draw with persistent orientation', () => {
  // Symbols read visually from the uploaded 63-second clip; fixture only.
  const rows = [
    ['rock','scissors','scissors','rock','paper','rock','rock'],
    ['scissors','paper','rock','rock','rock','rock','rock'],
    ['rock','rock','rock','paper','scissors','rock','scissors'],
    ['scissors','rock','rock','paper','scissors','scissors','paper'],
    ['rock','rock','scissors','scissors','paper','rock','paper'],
    ['paper','scissors','paper','scissors','scissors','rock','paper'],
    ['scissors','rock','paper','scissors','rock','paper','rock'],
  ];
  let s = {...playing(), board:rows.flat(), faces:netCube(), initialFaces:netCube()};
  s = execute(s, ['down','down','down','right']);
  assert.deepEqual(s.position, {col:4,row:3});
  assert.equal(s.faces.top.shape, 'rock'); assert.equal(faceRotation('top',s.faces.top), 270);
  assert.equal(s.battle.face.shape, 'paper'); assert.equal(s.battle.outcome, 'lose');
  s = reduce(s, {type:'ACK',nextMoves:3}); assert.deepEqual(s.scores, [-1,0]);
  s = execute(s, ['down','left','down']);
  assert.deepEqual(s.position, {col:3,row:5}); assert.equal(s.battle.face.id, 'face-1');
  assert.equal(s.battle.outcome, 'win'); s = reduce(s, {type:'ACK',nextMoves:5}); assert.deepEqual(s.scores, [-1,1]);
  s = execute(s, ['down','down','right','up','right']);
  assert.deepEqual(s.position, {col:5,row:6}); assert.equal(s.battle.outcome, 'draw');
  s = reduce(s, {type:'ACK',nextMoves:3}); assert.deepEqual(s.scores, [-1,1]);
});
test('Only the final bottom face matters, not top or intermediate tiles', () => {
  let s = {...playing(), faces:netCube(), initialFaces:netCube(), board:Array(49).fill('rock')};
  s = execute(s, ['down','down','down','right']);
  assert.equal(s.battle.face.shape, 'paper'); assert.equal(s.faces.top.shape, 'rock'); assert.equal(s.battle.delta, 1);
});
test('Result confirmation applies a score once and preserves position and faces', () => {
  let s = execute(playing(), ['down','right','down']);
  const before = structuredClone(s); const next = reduce(s, {type:'ACK',nextMoves:4});
  assert.deepEqual(next.position, before.position); assert.deepEqual(next.faces,before.faces);
  assert.equal(next.activePlayer, 2); assert.equal(next.turn, 2); assert.deepEqual(next.planned, []);
  assert.equal(reduce(next, {type:'ACK',nextMoves:4}), next);
});
test('Pause stops timer and planning, resume restores both', () => {
  let s = reduce(playing(), {type:'PAUSE',value:true});
  assert.equal(reduce(s, {type:'TICK',elapsed:30000}), s); assert.equal(canPlan(s,'down'), false);
  s = reduce(s, {type:'PAUSE',value:false}); assert.equal(canPlan(s,'down'), true);
  assert.equal(reduce(s,{type:'TICK',elapsed:2500}).remainingMs,17500);
});
test('Timeout penalizes once, leaves position unchanged, then changes turn', () => {
  let s=playing(); const original=structuredClone(s);
  s=reduce(s,{type:'TICK',elapsed:30000}); assert.equal(s.battle.outcome,'timeout'); assert.equal(s.remainingMs,0);
  assert.equal(reduce(s,{type:'TICK',elapsed:5000}),s);
  s=reduce(s,{type:'ACK',nextMoves:5}); assert.deepEqual(s.scores,[-1,0]); assert.equal(s.activePlayer,2);
  assert.deepEqual(s.position,original.position); assert.deepEqual(s.faces,original.faces); assert.equal(s.remainingMs,20000);
});
test('Stale timer and roll callbacks do not affect the next turn', () => {
  let s=reduce(playing(),{type:'TICK',elapsed:30000}); s=reduce(s,{type:'ACK',nextMoves:3});
  assert.equal(reduce(s,{type:'TICK',elapsed:30000,turn:1}),s);
  assert.equal(reduce(s,{type:'ANIMATION_END',index:0,turn:1}),s);
});
test('Reaching four points ends the match, blocks extra scoring, and supports reset', () => {
  let s=playing(); s={...s,status:'feedback',scores:[3,-2],battle:{outcome:'win',delta:1,player:1}};
  s=reduce(s,{type:'ACK',nextMoves:3}); assert.equal(s.phase,'ended'); assert.equal(s.winner,1); assert.equal(s.scores[0],WIN_SCORE);
  assert.equal(reduce(s,{type:'ACK',nextMoves:3}),s);
  s=reduce(s,{type:'RESET',state:createGame('sd',seedRng())}); assert.equal(s.phase,'setup'); assert.deepEqual(s.scores,[0,0]);
});
test('Reducer never mutates its input state while planning or rolling', () => {
  const s=playing(), before=structuredClone(s); reduce(s,{type:'PLAN',direction:'down'}); assert.deepEqual(s,before);
});
