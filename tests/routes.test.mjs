import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, resolveRoute, routeHash } from '../src/data/games.js';
import { generateSudokuMatrix } from '../src/utils/sudoku.js';

test('Catalog identifiers and canonical slugs are unique', () => {
  assert.equal(GAMES.length, 12);
  assert.equal(new Set(GAMES.map(g => g.id)).size, 12);
  assert.equal(new Set(GAMES.map(g => g.slug)).size, 12);
});
for (const game of GAMES) {
  test(`Routes and guides: ${game.id}`, () => {
    for (const value of [game.id, game.slug, `game-${game.id}`, `game-${game.slug}`]) {
      assert.equal(resolveRoute(`#/${value}`), game.id);
      assert.equal(resolveRoute(`#${value}/`), game.id);
    }
    assert.equal(resolveRoute(routeHash(game.id)), game.id);
    assert.equal(resolveRoute(`#/tips-${game.id}`), `tips-${game.id}`);
    assert.equal(resolveRoute(`#/tips-${game.slug}`), `tips-${game.id}`);
  });
}
test('Pages and aliases', () => {
  for (const value of ['', '#', '#/', '#/home']) assert.equal(resolveRoute(value), 'home');
  for (const [alias, expected] of Object.entries({ permainan:'games', favorit:'favorites', aktivitas:'activity', panduan:'guides', tips:'guides', musim:'season', event:'events', penguasaan:'mastery', pengaturan:'settings' })) {
    assert.equal(resolveRoute(`#/${alias}`), expected);
  }
});
test('Malformed, unknown and prototype-property routes are rejected', () => {
  for (const value of ['#/404', '#/%ZZ', '#/constructor', '#/__proto__', '#/toString', '#/tips-unknown']) {
    assert.equal(resolveRoute(value), 'not-found');
  }
});
for (const [size, boxRows, boxCols] of [[4,2,2], [6,2,3], [9,3,3]]) {
  test(`Sudoku ${size}x${size}: 500 generated boards satisfy every constraint`, () => {
    let seed = 123456789;
    const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
    const expected = Array.from({ length:size }, (_,i) => i+1);
    const valid = values => assert.deepEqual([...values].sort((a,b)=>a-b), expected);
    const seen = new Set();
    for (let iteration=0; iteration<500; iteration++) {
      const matrix = generateSudokuMatrix(size, boxRows, boxCols, random);
      assert.equal(matrix.length, size * size);
      seen.add(matrix.join(','));
      for (let r=0; r<size; r++) valid(matrix.slice(r*size, (r+1)*size));
      for (let c=0; c<size; c++) valid(Array.from({length:size},(_,r)=>matrix[r*size+c]));
      for (let br=0; br<size; br+=boxRows) for (let bc=0; bc<size; bc+=boxCols) {
        const box=[];
        for (let r=0;r<boxRows;r++) for(let c=0;c<boxCols;c++) box.push(matrix[(br+r)*size+bc+c]);
        valid(box);
      }
    }
    assert.ok(seen.size > 20, 'Randomized generator should produce diverse boards.');
  });
}
test('Invalid Sudoku dimensions fail explicitly', () => {
  for (const config of [[0,0,0],[6,3,3],[4,2.5,2],[9,-3,-3]]) {
    assert.throws(()=>generateSudokuMatrix(...config), RangeError);
  }
});
