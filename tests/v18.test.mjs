import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateArenaRating, getRankInfo, RANK_TIERS, rankGroupAtLeast } from '../src/utils/rank.js';
import { AVATARS, PROFILE_FRAMES, PROFILE_TITLES, customizationUnlocked } from '../src/data/customization.js';
import { buildAdvancedStatistics } from '../src/utils/statistics.js';

test('Arena Rating is deterministic and rank ladder is strictly increasing', () => {
  for (let i=1;i<RANK_TIERS.length;i+=1) assert.ok(RANK_TIERS[i].min > RANK_TIERS[i-1].min);
  const profile={xp:2500,completions:30,perGame:{maze:{completions:5},matrix:{completions:2},minesweeper:{completions:1}}};
  const daily={completedByDate:{'2026-09-28':{},'2026-09-29':{},'2026-09-30':{}}};
  const achievements={unlocked:{a:{},b:{},c:{}}};
  const a=calculateArenaRating(profile,daily,achievements);
  const b=calculateArenaRating(profile,daily,achievements);
  assert.deepEqual(a,b);
  assert.equal(a.rating,500+300+135+60+90);
  const rank=getRankInfo(profile,daily,achievements);
  assert.ok(rank.rating>=rank.tier.min);
  assert.ok(rank.progress>=0 && rank.progress<=100);
});

test('Rank group comparison and customization unlock rules work', () => {
  const profile={xp:5000,completions:100,perGame:{maze:{completions:10},matrix:{completions:10},minesweeper:{completions:1},cube:{completions:1},rps:{completions:1}}};
  const daily={completedByDate:{'2026-09-24':{},'2026-09-25':{},'2026-09-26':{},'2026-09-27':{},'2026-09-28':{},'2026-09-29':{},'2026-09-30':{}}};
  const achievements={unlocked:Object.fromEntries(Array.from({length:8},(_,i)=>[`a${i}`,{}]))};
  const rankInfo=getRankInfo(profile,daily,achievements);
  const levelInfo={level:12};
  assert.ok(rankGroupAtLeast(rankInfo,'silver'));
  const ctx={profile,daily,achievements,rankInfo,levelInfo};
  assert.equal(customizationUnlocked(AVATARS[0],ctx),true);
  assert.equal(customizationUnlocked(PROFILE_FRAMES.find(x=>x.id==='violet'),ctx),true);
  assert.equal(customizationUnlocked(PROFILE_TITLES.find(x=>x.id==='daily'),ctx),true);
});

test('Advanced statistics summarize sessions, XP, categories and 28-day activity', () => {
  const profile={xp:500,completions:3,perGame:{maze:{completions:2,xp:160,lastPlayedAt:3},matrix:{completions:1,xp:85,lastPlayedAt:2}},completionEvents:[
    {gameId:'maze',dateKey:'2026-09-30',time:3},{gameId:'maze',dateKey:'2026-09-29',time:2},{gameId:'matrix',dateKey:'2026-09-29',time:1},
  ],xpEvents:[{amount:85,dateKey:'2026-09-30'},{amount:160,dateKey:'2026-09-29'}]};
  const daily={completedByDate:{'2026-09-29':{},'2026-09-30':{}}};
  const stats=buildAdvancedStatistics(profile,daily,'2026-09-30');
  assert.equal(stats.last7.length,7);
  assert.equal(stats.last28.length,28);
  assert.equal(stats.totalSessions,3);
  assert.equal(stats.activeDays,2);
  assert.equal(stats.weekSessions,3);
  assert.equal(stats.weekXp,245);
  assert.equal(stats.mostPlayed.game.id,'maze');
  assert.ok(stats.diversityPercent>0);
});
