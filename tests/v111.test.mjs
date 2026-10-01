import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, resolveRoute } from '../src/data/games.js';
import {
  createChallengeCode,
  validateChallengeCode,
  challengeSeed,
  mulberry32,
  levelCompletionKey,
  performanceForRun,
  rankedDeltaFor,
  runPreset,
  COMPETITIVE_LEVEL_KEYS,
} from '../src/utils/competitive.js';

test('v1.11 creates valid challenge codes for all 12 games', () => {
  assert.equal(GAMES.length, 12);
  for (const game of GAMES) {
    const code = createChallengeCode(game.id, `fixed-${game.id}`);
    const checked = validateChallengeCode(code, game.id);
    assert.equal(checked.valid, true, `${game.id}: ${code}`);
    assert.equal(checked.seed, challengeSeed(code));
  }
});

test('same challenge code produces same deterministic random sequence', () => {
  const code = createChallengeCode('maze', 'same-seed');
  const seed = challengeSeed(code);
  const a = mulberry32(seed);
  const b = mulberry32(seed);
  const seqA = Array.from({length:12}, () => a());
  const seqB = Array.from({length:12}, () => b());
  assert.deepEqual(seqA, seqB);
});

test('different challenge codes produce different random sequences', () => {
  const a = mulberry32(challengeSeed(createChallengeCode('maze','seed-a')));
  const b = mulberry32(challengeSeed(createChallengeCode('maze','seed-b')));
  assert.notDeepEqual(Array.from({length:8},()=>a()), Array.from({length:8},()=>b()));
});

test('challenge code cannot be reused for a different game', () => {
  const code = createChallengeCode('maze','maze-only');
  assert.equal(validateChallengeCode(code,'maze').valid,true);
  assert.equal(validateChallengeCode(code,'sudoku').valid,false);
});

test('completion keys cover all education and university arena levels', () => {
  assert.deepEqual(COMPETITIVE_LEVEL_KEYS,['sd','smp','sma','uni-hard','uni-very-hard','uni-impossible']);
  assert.equal(levelCompletionKey('sd'),'sd');
  assert.equal(levelCompletionKey('smp'),'smp');
  assert.equal(levelCompletionKey('sma'),'sma');
  assert.equal(levelCompletionKey('universitas','hard'),'uni-hard');
  assert.equal(levelCompletionKey('universitas','very-hard'),'uni-very-hard');
  assert.equal(levelCompletionKey('universitas','impossible'),'uni-impossible');
});

test('performance rating stays bounded and rewards a new personal best', () => {
  const first = performanceForRun({durationMs:60000,previousBestMs:0,outcome:'completed'});
  const pb = performanceForRun({durationMs:40000,previousBestMs:60000,outcome:'completed'});
  const loss = performanceForRun({durationMs:40000,previousBestMs:60000,outcome:'loss'});
  assert.ok(first.score >= 35 && first.score <= 100);
  assert.ok(pb.score >= 96 && pb.score <= 100);
  assert.equal(pb.grade,'S');
  assert.ok(loss.score < pb.score);
});

test('Brain Coach hints reduce ranked RP and losses can subtract RP', () => {
  assert.ok(rankedDeltaFor({grade:'S',outcome:'completed',hintsUsed:0}) > rankedDeltaFor({grade:'S',outcome:'completed',hintsUsed:2}));
  assert.equal(rankedDeltaFor({grade:'A',outcome:'loss',hintsUsed:0}),-12);
});

test('Arena Run presets resolve to 3, 5, 8 and 12 stages', () => {
  assert.equal(runPreset(3).count,3);
  assert.equal(runPreset(5).count,5);
  assert.equal(runPreset(8).count,8);
  assert.equal(runPreset(12).count,12);
});

test('competitive route aliases resolve to v1.11 pages', () => {
  assert.equal(resolveRoute('#/arena-run'),'arena-run');
  assert.equal(resolveRoute('#/tournament'),'arena-run');
  assert.equal(resolveRoute('#/history'),'history');
  assert.equal(resolveRoute('#/riwayat'),'history');
  assert.equal(resolveRoute('#/replay'),'replay');
  assert.equal(resolveRoute('#/completion'),'completion');
  assert.equal(resolveRoute('#/koleksi'),'completion');
});
