import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalProfile, ensureLocalProfiles, switchLocalProfile } from '../src/utils/localProfiles.js';
import { createSaveSlot, listSaveSlots, restoreSaveSlot } from '../src/utils/saveSlots.js';
import { createArenaCup, applyArenaCupResult } from '../src/utils/arenaCup.js';
import { storageBreakdown, compactReplayHistory } from '../src/utils/storageOptimizer.js';
import { DATA_SCHEMA_VERSION, migrateProgressData } from '../src/utils/migration.js';
import { resolveRoute, GAMES } from '../src/data/games.js';

class MemoryStorage { constructor(initial={}){this.map=new Map(Object.entries(initial));} get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;} getItem(k){return this.map.has(k)?this.map.get(k):null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);} }
const profile=(name,xp)=>JSON.stringify({name,xp,rankedPoints:0,completions:0,playDates:[],perGame:{},xpEvents:[],completionEvents:[]});

test('v1.17 multi local profiles isolate player progress',()=>{
  const storage=new MemoryStorage({'ba_profile_v1':profile('Fauzi',1200),'ba_data_schema':'17'});
  const initial=ensureLocalProfiles(storage,1000);assert.equal(initial.profiles.length,1);assert.equal(initial.activeId,'profile-main');
  const second=createLocalProfile('Guest',storage,2000);switchLocalProfile(second.id,storage,3000);
  assert.equal(JSON.parse(storage.getItem('ba_profile_v1')).name,'Guest');assert.equal(JSON.parse(storage.getItem('ba_profile_v1')).xp,0);
  storage.setItem('ba_profile_v1',profile('Guest',75));switchLocalProfile('profile-main',storage,4000);
  assert.equal(JSON.parse(storage.getItem('ba_profile_v1')).name,'Fauzi');assert.equal(JSON.parse(storage.getItem('ba_profile_v1')).xp,1200);
});

test('v1.17 named save slots restore progress while keeping slot registry',()=>{
  const storage=new MemoryStorage({'ba_profile_v1':profile('Player',500),'ba_data_schema':'17'});
  const slot=createSaveSlot('Before ranked',storage,1000);storage.setItem('ba_profile_v1',profile('Player',900));restoreSaveSlot(slot.id,storage);
  assert.equal(JSON.parse(storage.getItem('ba_profile_v1')).xp,500);assert.equal(listSaveSlots(storage).length,1);
});

test('Arena Cup advances through seven bracket stages and crowns champion',()=>{
  let cup=createArenaCup({mode:'practice'},1000);assert.equal(cup.stages.length,7);assert.equal(cup.status,'active');
  for(let i=0;i<7;i+=1){const stage=cup.stages[cup.index];cup=applyArenaCupResult(cup,{id:`m${i}`,gameId:stage.gameId,time:2000+i,outcome:'completed',performance:90,grade:'A',durationMs:10000});}
  assert.equal(cup.status,'champion');assert.equal(cup.index,6);assert.ok(cup.champion);
});

test('storage optimizer reports categories and can compact replay actions',()=>{
  const storage=new MemoryStorage({'ba_profile_v1':profile('Player',1),'ba_match_history_v1':JSON.stringify([{id:'m',replay:[{t:1},{t:2}]}]),'ba_auto_backups_v1':'[]'});
  const before=storageBreakdown(storage);assert.ok(before.total>0);assert.equal(compactReplayHistory(storage),2);assert.deepEqual(JSON.parse(storage.getItem('ba_match_history_v1'))[0].replay,[]);
});

test('v1.17 migration creates new defaults and release rollback snapshot',()=>{
  const storage=new MemoryStorage({'ba_data_schema':'16','ba_profile_v1':profile('Player',321)});const result=migrateProgressData(storage);assert.equal(DATA_SCHEMA_VERSION,17);assert.equal(result.to,17);assert.equal(JSON.parse(storage.getItem('ba_controller_settings_v1')).enabled,true);assert.ok(storage.getItem('ba_release_rollback_v1'));
});

test('v1.17 routes resolve and catalog remains 12 games',()=>{
  for(const route of ['profiles','showcase','share-result','arena-cup','practice-lab','save-slots','storage-center','diagnostics','controls']) assert.equal(resolveRoute(`#/${route}`),route);
  assert.equal(GAMES.length,12);
});
