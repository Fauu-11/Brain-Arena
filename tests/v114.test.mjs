import test from 'node:test';
import assert from 'node:assert/strict';
import { DATA_SCHEMA_VERSION, migrateProgressData } from '../src/utils/migration.js';
import { postGameInsights } from '../src/utils/insights.js';
import { buildNotificationFeed } from '../src/utils/notifications.js';

function fakeStorage(seed={}) {
  const map=new Map(Object.entries(seed));
  return { getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),dump:()=>Object.fromEntries(map) };
}

test('v1.14 migration preserves legacy sidebar choice and advances schema',()=>{
  const storage=fakeStorage({ba_sidebar_collapsed:'1'});
  const result=migrateProgressData(storage);
  assert.equal(result.to,DATA_SCHEMA_VERSION);
  assert.equal(storage.getItem('ba_data_schema'),String(DATA_SCHEMA_VERSION));
  const layout=JSON.parse(storage.getItem('ba_sidebar_layout_v2'));
  assert.equal(layout.mode,'compact');
  assert.equal(layout.groups.arena,true);
});

test('v1.14 migration is idempotent',()=>{
  const storage=fakeStorage({ba_data_schema:String(DATA_SCHEMA_VERSION),ba_sidebar_layout_v2:'{"mode":"full"}'});
  const result=migrateProgressData(storage);
  assert.equal(result.changed,false);
  assert.equal(JSON.parse(storage.getItem('ba_sidebar_layout_v2')).mode,'full');
});

test('post-game insights surface PB, no-hint and ranked feedback',()=>{
  const items=postGameInsights({performance:97,durationMs:80000,previousBestMs:100000,isPersonalBest:true,hintsUsed:0,mode:'ranked',rankedDelta:22},'id');
  assert.ok(items.some(item=>item.title.includes('Personal')));
  assert.ok(items.some(item=>item.title.includes('Performa')));
  assert.ok(items.length<=3);
});

test('notification feed includes recovery and ready mission',()=>{
  const feed=buildNotificationFeed({dateKey:'2026-10-01',dailyCompleted:false,todayChallenge:{rewardXp:150},missionCards:[{complete:true,claimed:false,claimKey:'x',rewardXp:80,title:{id:'Tes',en:'Test'}}],season:{xp:0,claimed:{}},currentSeason:{id:'s',rewards:[]},achievements:{unlocked:{}},recoverySession:{id:'s1',gameId:'maze',lastSavedAt:1}});
  assert.ok(feed.some(item=>item.type==='recovery'));
  assert.ok(feed.some(item=>item.type==='mission'));
  assert.ok(feed.some(item=>item.type==='daily'));
});
