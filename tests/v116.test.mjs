import test from 'node:test';
import assert from 'node:assert/strict';
import { createAutomaticBackup, listAutomaticBackups, restoreAutomaticBackup, deleteAutomaticBackup } from '../src/utils/autoBackup.js';
import { brainCoachReview } from '../src/utils/coachV2.js';
import { buildPerformanceAnalytics } from '../src/utils/performanceAnalytics.js';
import { createSessionIntegrity, integrityLabel } from '../src/utils/integrity.js';
import { DATA_SCHEMA_VERSION, migrateProgressData } from '../src/utils/migration.js';
import { resolveRoute, GAMES } from '../src/data/games.js';

class MemoryStorage { constructor(initial={}){this.map=new Map(Object.entries(initial));} get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;} getItem(k){return this.map.has(k)?this.map.get(k):null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);} }

test('v1.16 automatic backups keep five snapshots and restore data',()=>{
  const storage=new MemoryStorage({'ba_profile_v1':JSON.stringify({xp:100,rankedPoints:20,completions:1}),'ba_match_history_v1':'[]'});
  for(let i=0;i<7;i+=1){storage.setItem('ba_profile_v1',JSON.stringify({xp:100+i,rankedPoints:20,completions:i}));createAutomaticBackup(i%2?'auto':'manual',storage,1000+i);}
  const list=listAutomaticBackups(storage);assert.equal(list.length,5);assert.equal(list[0].summary.xp,106);
  storage.setItem('ba_profile_v1',JSON.stringify({xp:999}));restoreAutomaticBackup(list[0].id,storage);assert.equal(JSON.parse(storage.getItem('ba_profile_v1')).xp,106);
  deleteAutomaticBackup(list[0].id,storage);assert.equal(listAutomaticBackups(storage).length,4);
});

test('Brain Coach v2 detects immediate backtracking and recent performance delta',()=>{
  const match={id:'m1',gameId:'maze',performance:90,hintsUsed:1,replay:[{type:'key',label:'ArrowUp'},{type:'key',label:'ArrowDown'},{type:'key',label:'ArrowLeft'},{type:'key',label:'ArrowRight'},{type:'key',label:'ArrowUp'},{type:'key',label:'ArrowDown'}]};
  const review=brainCoachReview(match,[match,{id:'m2',gameId:'maze',performance:80}], 'id');
  assert.equal(review.backtracks,3);assert.equal(review.performanceDelta,10);assert.ok(review.notes.length>=2);assert.match(review.focus,/persimpangan/i);
});

test('performance analytics summarizes range, PB and ranked RP',()=>{
  const now=Date.now();const matches=[{gameId:'maze',time:now,dateKey:'2026-10-01',mode:'ranked',outcome:'completed',performance:96,grade:'S',rankedDelta:12,isPersonalBest:true,durationMs:50000,replay:[]},{gameId:'maze',time:now-1000,dateKey:'2026-10-01',mode:'practice',outcome:'completed',performance:84,grade:'B',rankedDelta:0,durationMs:70000,replay:[]}];
  const stats=buildPerformanceAnalytics(matches,'30',now);assert.equal(stats.total,2);assert.equal(stats.winRate,100);assert.equal(stats.pbImproved,1);assert.equal(stats.rp,12);assert.equal(stats.perGame[0].game.id,'maze');
});

test('ranked integrity labels clean and recovered sessions',()=>{
  const base=createSessionIntegrity('ranked');assert.equal(integrityLabel(base,'id').status,'clean');assert.equal(integrityLabel({...base,recoveryCount:1},'id').status,'recovered');
});

test('v1.16 schema initializes pinned games from favorites',()=>{
  const storage=new MemoryStorage({'ba_data_schema':'15','ba_favorites_v2':JSON.stringify(['maze','sudoku','game2048'])});const result=migrateProgressData(storage);assert.equal(DATA_SCHEMA_VERSION,18);assert.equal(result.to,18);assert.deepEqual(JSON.parse(storage.getItem('ba_pinned_games_v2')),['maze','sudoku','game2048']);
});

test('v1.16 activity calendar route resolves and catalog stays 12 games',()=>{assert.equal(resolveRoute('#/activity-calendar'),'activity-calendar');assert.equal(resolveRoute('#/calendar'),'activity-calendar');assert.equal(GAMES.length,12);});
