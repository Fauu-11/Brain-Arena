import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRENT_SEASON, getSeasonLevel, nextSeasonReward, seasonIsActive } from '../src/utils/season.js';
import { eventBonusForGame, getActiveEvent } from '../src/utils/events.js';
import { getMasteryInfo, masteryFromProfile } from '../src/utils/mastery.js';
import { adaptiveRecommendation } from '../src/utils/adaptive.js';
import { createProgressBackup, importProgressBackup, validateProgressBackup } from '../src/utils/backup.js';
import { generateNonogram, nonogramClues, nonogramSolved } from '../src/utils/nonogram.js';
import { addRandomTile, canMove2048, create2048, move2048 } from '../src/utils/game2048.js';
import { GAMES, resolveRoute } from '../src/data/games.js';

class FakeStorage {
  constructor(seed={}) { this.map = new Map(Object.entries(seed)); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key,value) { this.map.set(String(key),String(value)); }
  removeItem(key) { this.map.delete(key); }
}

test('Season is active in October 2026 and levels/rewards progress predictably', () => {
  assert.equal(seasonIsActive('2026-10-01'), true);
  assert.equal(seasonIsActive('2026-11-30'), true);
  assert.equal(seasonIsActive('2026-12-01'), false);
  assert.equal(getSeasonLevel(0).level, 1);
  assert.equal(getSeasonLevel(200).level, 2);
  assert.equal(nextSeasonReward(0, {}).id, CURRENT_SEASON.rewards[0].id);
  assert.equal(nextSeasonReward(260, { [CURRENT_SEASON.rewards[0].id]: true }).id, CURRENT_SEASON.rewards[1].id);
});

test('Event rotation is deterministic and only eligible categories earn bonus XP', () => {
  const a = getActiveEvent('2026-10-01');
  const b = getActiveEvent('2026-10-01');
  assert.deepEqual(a,b);
  assert.equal(a.bonusPercent,50);
  const eligible = GAMES.find(game => game.category === a.category);
  const ineligible = GAMES.find(game => game.category !== a.category);
  assert.deepEqual(eventBonusForGame(eligible,60,'2026-10-01').bonus,30);
  assert.equal(eventBonusForGame(ineligible,60,'2026-10-01').bonus,0);
});

test('Game Mastery and adaptive difficulty advance from novice toward university', () => {
  assert.equal(getMasteryInfo(0).tier.en,'Novice');
  assert.ok(getMasteryInfo(3000).level > getMasteryInfo(100).level);
  const profile={ perGame:{ maze:{ masteryXp:5000, completions:25 } } };
  assert.equal(masteryFromProfile(profile,'maze').xp,5000);
  const rec=adaptiveRecommendation(profile,'maze');
  assert.equal(rec.level,'universitas');
  assert.ok(['hard','very-hard','extreme'].includes(rec.universityDifficulty));
});

test('Progress backup exports only Brain Arena keys and imports safely', () => {
  const source = new FakeStorage({ ba_profile_v1:'{"xp":120}', maze_best_sd:'42', unrelated_secret:'nope' });
  const backup = createProgressBackup(source);
  assert.equal(backup.appVersion,'1.9.0');
  assert.equal(backup.data.unrelated_secret,undefined);
  assert.equal(validateProgressBackup(backup),true);
  const target = new FakeStorage({ ba_old:'remove-me', other:'keep-me' });
  assert.equal(importProgressBackup(backup,target,true),2);
  assert.equal(target.getItem('ba_profile_v1'),'{"xp":120}');
  assert.equal(target.getItem('ba_old'),null);
  assert.equal(target.getItem('other'),'keep-me');
  assert.throws(()=>validateProgressBackup({format:'wrong',version:1,data:{}}));
});

test('Nonogram clues and solved-state support clue-equivalent solutions', () => {
  assert.deepEqual(nonogramClues([true,true,false,true]),[2,1]);
  assert.deepEqual(nonogramClues([false,false]),[0]);
  let seed=7; const random=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const puzzle=generateNonogram(5,.4,random);
  assert.equal(puzzle.cells.length,25);
  assert.equal(puzzle.rows.length,5);
  assert.equal(puzzle.cols.length,5);
  const exact=puzzle.cells.map(v=>v?1:2);
  assert.equal(nonogramSolved(puzzle.cells,exact),true);
  const empty=Array(25).fill(0);
  assert.equal(nonogramSolved(puzzle.cells,empty),false);
});

test('2048 move engine merges correctly and detects locked boards', () => {
  const board=[2,2,4,4, 0,0,0,0, 2,2,2,0, 0,0,0,0];
  const left=move2048(board,'left');
  assert.equal(left.moved,true);
  assert.deepEqual(left.board.slice(0,4),[4,8,0,0]);
  assert.deepEqual(left.board.slice(8,12),[4,2,0,0]);
  assert.equal(left.score,16);
  const locked=[2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2];
  assert.equal(canMove2048(locked),false);
  const seeded=()=>0;
  const created=create2048(seeded);
  assert.equal(created.filter(Boolean).length,2);
  const added=addRandomTile(Array(16).fill(0),seeded);
  assert.equal(added.filter(Boolean).length,1);
});

test('v1.9 routes and 12-game catalog resolve', () => {
  assert.equal(GAMES.length,12);
  assert.equal(resolveRoute('#/season'),'season');
  assert.equal(resolveRoute('#/musim'),'season');
  assert.equal(resolveRoute('#/events'),'events');
  assert.equal(resolveRoute('#/mastery'),'mastery');
  assert.equal(resolveRoute('#/pengaturan'),'settings');
  assert.equal(resolveRoute('#/nonogram'),'nonogram');
  assert.equal(resolveRoute('#/2048'),'game2048');
});
