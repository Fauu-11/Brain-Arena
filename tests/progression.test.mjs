import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDailyStreak, deterministicIndex, getDailyChallenge, getLevelInfo, localDateKey, shiftDateKey } from '../src/utils/progression.js';
import { GAMES, resolveRoute } from '../src/data/games.js';

test('Daily challenge is deterministic for a date and points to a real game', () => {
  const a = getDailyChallenge(GAMES, '2026-09-30');
  const b = getDailyChallenge(GAMES, '2026-09-30');
  assert.deepEqual(a, b);
  assert.ok(GAMES.some(game => game.id === a.gameId));
  assert.equal(a.rewardXp, 150);
});

test('Daily challenge varies across a useful date range', () => {
  const selected = new Set();
  let key = '2026-09-01';
  for (let i = 0; i < 60; i++) {
    selected.add(getDailyChallenge(GAMES, key).gameId);
    key = shiftDateKey(key, 1);
  }
  assert.ok(selected.size >= 7);
});

test('Level progression starts at level 1 and advances predictably', () => {
  assert.deepEqual(getLevelInfo(0), { level:1,totalXp:0,currentXp:0,neededXp:250,nextLevelXp:250,progress:0,rank:{id:'Pemula',en:'Rookie'} });
  assert.equal(getLevelInfo(249).level, 1);
  assert.equal(getLevelInfo(250).level, 2);
  assert.equal(getLevelInfo(550).level, 3);
  assert.ok(getLevelInfo(5000).level > 10);
});

test('Daily streak tolerates an unfinished current day but breaks after a missed full day', () => {
  assert.equal(calculateDailyStreak(['2026-09-28','2026-09-29','2026-09-30'], '2026-09-30'), 3);
  assert.equal(calculateDailyStreak(['2026-09-28','2026-09-29'], '2026-09-30'), 2);
  assert.equal(calculateDailyStreak(['2026-09-27','2026-09-28'], '2026-09-30'), 0);
});

test('Date helpers and deterministic index are bounded', () => {
  assert.equal(shiftDateKey('2026-01-01', -1), '2025-12-31');
  assert.equal(shiftDateKey('2026-12-31', 1), '2027-01-01');
  assert.ok(deterministicIndex('hello', 10) >= 0 && deterministicIndex('hello', 10) < 10);
  assert.equal(deterministicIndex('hello', 0), 0);
  assert.match(localDateKey(new Date(2026, 8, 30, 12)), /^2026-09-30$/);
});

test('Daily and profile routes resolve with Indonesian aliases', () => {
  assert.equal(resolveRoute('#/daily'), 'daily');
  assert.equal(resolveRoute('#/harian'), 'daily');
  assert.equal(resolveRoute('#/profile'), 'profile');
  assert.equal(resolveRoute('#/profil'), 'profile');
});

test('Progression feature routes resolve in English and Indonesian', () => {
  assert.equal(resolveRoute('#/achievements'), 'achievements');
  assert.equal(resolveRoute('#/pencapaian'), 'achievements');
  assert.equal(resolveRoute('#/missions'), 'missions');
  assert.equal(resolveRoute('#/misi'), 'missions');
  assert.equal(resolveRoute('#/leaderboard'), 'leaderboard');
  assert.equal(resolveRoute('#/peringkat'), 'leaderboard');
});

test('Rank, customization and statistics routes resolve in English and Indonesian', () => {
  assert.equal(resolveRoute('#/rank'), 'rank');
  assert.equal(resolveRoute('#/ranking'), 'rank');
  assert.equal(resolveRoute('#/customize'), 'customize');
  assert.equal(resolveRoute('#/kustomisasi'), 'customize');
  assert.equal(resolveRoute('#/statistics'), 'statistics');
  assert.equal(resolveRoute('#/statistik'), 'statistics');
});
