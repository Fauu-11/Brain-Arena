import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DATA_SCHEMA_VERSION, migrateProgressData } from '../src/utils/migration.js';
import { importProgressBackup } from '../src/utils/backup.js';
import { inspectDataHealth, repairInvalidData, corruptionQuarantine } from '../src/utils/dataHealth.js';
import { markRuntimeStart, markRuntimeCleanExit, recordRuntimeIssue, readRuntimeHealth } from '../src/utils/runtimeHealth.js';

class MemoryStorage {
  constructor(initial={}){this.map=new Map(Object.entries(initial));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

class OneShotFailStorage extends MemoryStorage {
  constructor(initial,failKey){super(initial);this.failKey=failKey;this.failed=false;}
  setItem(k,v){if(k===this.failKey&&!this.failed){this.failed=true;throw new Error('quota');}super.setItem(k,v);}
}

test('v1.18 migration advances schema and installs stability markers',()=>{
  const storage=new MemoryStorage({'ba_data_schema':'17','ba_profile_v1':JSON.stringify({xp:42})});
  const result=migrateProgressData(storage);
  assert.equal(DATA_SCHEMA_VERSION,19);
  assert.equal(result.to,19);
  assert.ok(result.steps.includes('runtime-health-v1'));
  assert.equal(JSON.parse(storage.getItem('ba_stability_release_v18')).transactionalBackup,true);
  assert.equal(JSON.parse(storage.getItem('ba_release_rollback_v1')).to,19);
});

test('v1.18 backup import rolls back partial writes after a storage failure',()=>{
  const original=JSON.stringify({xp:50,name:'Stable'});
  const storage=new OneShotFailStorage({'ba_profile_v1':original,'ba_favorites_v2':'["maze"]'},'ba_favorites_v2');
  const backup={format:'brain-arena-backup',version:1,data:{ba_profile_v1:JSON.stringify({xp:999}),ba_favorites_v2:'["sudoku"]'}};
  assert.throws(()=>importProgressBackup(backup,storage,true),/backup-import-rolled-back/);
  assert.equal(storage.getItem('ba_profile_v1'),original);
  assert.equal(storage.getItem('ba_favorites_v2'),'["maze"]');
});

test('v1.18 data repair quarantines broken JSON before removing it',()=>{
  const storage=new MemoryStorage({'ba_profile_v1':'{"xp":100','ba_favorites_v2':'["maze"]','other_app':'{bad'});
  const before=inspectDataHealth(storage);
  assert.equal(before.invalid.length,1);
  assert.equal(repairInvalidData(storage),1);
  assert.equal(storage.getItem('ba_profile_v1'),null);
  assert.equal(storage.getItem('other_app'),'{bad');
  assert.equal(corruptionQuarantine(storage)[0].key,'ba_profile_v1');
});

test('v1.18 runtime health tracks starts, issues and clean exits',()=>{
  const storage=new MemoryStorage();
  markRuntimeStart(storage,100);
  recordRuntimeIssue('test-error',new Error('boom'),{},storage,150);
  markRuntimeCleanExit(storage,200);
  const health=readRuntimeHealth(storage);
  assert.equal(health.starts,1);
  assert.equal(health.issues,1);
  assert.equal(health.lastCleanExitAt,200);
  assert.equal(health.currentSessionClean,true);
});

test('v1.18 service worker uses versioned core and runtime caches',()=>{
  const source=fs.readFileSync(new URL('../public/service-worker.js',import.meta.url),'utf8');
  assert.match(source,/1\.19\.0/);
  assert.match(source,/brain-arena-runtime/);
  assert.match(source,/staleWhileRevalidate/);
  assert.match(source,/networkFirst/);
});
