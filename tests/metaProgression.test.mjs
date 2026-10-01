import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, achievementProgress, newlyCompletedAchievements } from '../src/data/achievements.js';
import { allMissionCards, missionClaimKey, missionProgress, missionSets, weekStartKey } from '../src/utils/missions.js';

test('Achievement catalog is unique and progression is bounded', () => {
  assert.ok(ACHIEVEMENTS.length >= 10);
  assert.equal(new Set(ACHIEVEMENTS.map(item => item.id)).size, ACHIEVEMENTS.length);
  const profile = { xp:2600, completions:30, perGame:{ minesweeper:{completions:10}, maze:{completions:1}, matrix:{completions:1} } };
  const daily = { completedByDate:{ '2026-09-28':{}, '2026-09-29':{}, '2026-09-30':{} } };
  const first = ACHIEVEMENTS.find(item => item.id === 'first-finish');
  const xp = ACHIEVEMENTS.find(item => item.id === 'xp-2500');
  assert.equal(achievementProgress(first,profile,daily).complete,true);
  assert.equal(achievementProgress(xp,profile,daily).percent,100);
  assert.ok(newlyCompletedAchievements(profile,daily,{}).length >= 5);
});

test('Daily missions measure sessions and game variety for the requested date', () => {
  const date = '2026-09-30';
  const { daily:missions } = missionSets(date);
  const profile = { completionEvents:[
    { gameId:'maze', dateKey:date, time:1 },
    { gameId:'matrix', dateKey:date, time:2 },
    { gameId:'maze', dateKey:'2026-09-29', time:3 },
  ] };
  const dailyState = { completedByDate:{} };
  const sessions = missions.find(item => item.type === 'sessions');
  const variety = missions.find(item => item.type === 'distinct-games');
  assert.equal(missionProgress(sessions,profile,dailyState,date).current,2);
  assert.equal(missionProgress(sessions,profile,dailyState,date).complete,true);
  assert.equal(missionProgress(variety,profile,dailyState,date).current,2);
});

test('Weekly mission window starts Monday and claim keys reset on schedule', () => {
  assert.equal(weekStartKey('2026-09-30'),'2026-09-28');
  const weekly = missionSets('2026-09-30').weekly[0];
  assert.match(missionClaimKey(weekly,'2026-09-30'),/^weekly:2026-09-28:/);
  const cards = allMissionCards({ completionEvents:[] },{ completedByDate:{} },{},'2026-09-30');
  assert.equal(cards.length,6);
  assert.ok(cards.every(card => !card.claimed));
});
