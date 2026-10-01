import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIVERSITY_ARENA_KEYS, normalizeUniversityDifficulty } from '../src/utils/universityArena.js';
import { GAMES } from '../src/data/games.js';

const gameFiles = {
  '300':'Game300.jsx', prime:'GamePrime.jsx', pixel:'GamePixel.jsx', mnm:'GameMnM.jsx', cube:'GameCube.jsx',
  rps:'GameRPS.jsx', sudoku:'GameSudoku.jsx', minesweeper:'GameMinesweeper.jsx', maze:'GameMaze.jsx',
  matrix:'GameMemoryMatrix.jsx', nonogram:'GameNonogram.jsx', game2048:'Game2048.jsx'
};

test('University Arena has exactly Hard, Very Hard, and Impossible', () => {
  assert.deepEqual(UNIVERSITY_ARENA_KEYS, ['hard','very-hard','impossible']);
  assert.equal(normalizeUniversityDifficulty('extreme'), 'impossible');
  assert.equal(normalizeUniversityDifficulty('very-hard'), 'very-hard');
});

test('all 12 games expose the University Arena selector', async () => {
  assert.equal(GAMES.length, 12);
  for (const game of GAMES) {
    const file = gameFiles[game.id];
    assert.ok(file, `missing source map for ${game.id}`);
    const source = await readFile(new URL(`../src/games/${file}`, import.meta.url), 'utf8');
    assert.match(source, /UniversityDifficultySelector/, `${game.id} must expose University Arena difficulty`);
  }
});

test('legacy Extreme labels are removed from active game and guide copy', async () => {
  const paths = [
    '../src/components/GameScreen.jsx', '../src/data/guideDetails.js', '../src/pages/TipsPage.jsx',
    ...Object.values(gameFiles).map(file => `../src/games/${file}`)
  ];
  for (const path of paths) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.equal(/\bExtreme\b/.test(source), false, `${path} still contains Extreme`);
  }
});
