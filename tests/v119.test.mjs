import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DATA_SCHEMA_VERSION, migrateProgressData } from '../src/utils/migration.js';
import { generateGuestUuid, getOrCreateGuestIdentity } from '../src/utils/guestIdentity.js';
import { DEFAULT_FEATURE_FLAGS, getFeatureFlags } from '../src/utils/featureFlags.js';
import { dbClear, dbGetAll, dbPut, localDbStatus } from '../src/data/localDb.js';
import { enqueueSyncMutation, listSyncQueue, syncQueueSummary } from '../src/utils/syncQueue.js';
import { recordMutation, mutationSummary } from '../src/utils/mutationJournal.js';
import { buildNormalizedPlayerModel, validateNormalizedPlayerModel } from '../src/utils/normalizedModel.js';

class MemoryStorage {
  constructor(initial={}){this.map=new Map(Object.entries(initial));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

test('v1.19 migration advances schema and creates cloud-readiness markers',()=>{
  const storage=new MemoryStorage({'ba_data_schema':'18','ba_profile_v1':'{}'});
  const result=migrateProgressData(storage);
  assert.equal(DATA_SCHEMA_VERSION,19);
  assert.equal(result.to,19);
  assert.ok(result.steps.includes('feature-flags-v1'));
  assert.ok(result.steps.includes('guest-identity-v1'));
  assert.ok(result.steps.includes('supabase-readiness-v19'));
  assert.equal(JSON.parse(storage.getItem('ba_supabase_readiness_v19')).syncQueue,true);
});

test('guest UUID generator creates UUID-shaped persistent identity',()=>{
  const generated=generateGuestUuid();
  assert.ok(generated.length>=16);
  const first=getOrCreateGuestIdentity();
  const second=getOrCreateGuestIdentity();
  assert.equal(first.id,second.id);
  assert.equal(first.type,'guest');
});

test('v1.19 feature flags keep online capabilities disabled by default',()=>{
  const flags=getFeatureFlags();
  assert.equal(flags.cloudSync,false);
  assert.equal(flags.onlineProfile,false);
  assert.equal(flags.globalLeaderboard,false);
  assert.equal(flags.social,false);
  assert.equal(flags.indexedDbLayer,true);
  assert.deepEqual(Object.keys(DEFAULT_FEATURE_FLAGS).sort(),Object.keys(flags).sort());
});

test('IndexedDB local layer provides a memory fallback in node tests',async()=>{
  await dbClear('records');
  await dbPut('records',{id:'test-record',kind:'test',value:42});
  const all=await dbGetAll('records');
  const status=await localDbStatus();
  assert.equal(all[0].value,42);
  assert.equal(status.mode,'memory-fallback');
});

test('sync queue stores deferred mutations for future cloud adapter',async()=>{
  await dbClear('sync_queue');
  const item=await enqueueSyncMutation({type:'UPDATE_PROFILE',entity:'profile',entityId:'guest',payload:{xp:100}});
  const list=await listSyncQueue();
  const summary=await syncQueueSummary();
  assert.equal(item.status,'deferred');
  assert.equal(list.length,1);
  assert.equal(summary.pending,1);
});

test('mutation journal records local mutations',async()=>{
  await dbClear('mutations');
  await recordMutation({type:'UPDATE',entity:'progress',entityId:'guest',after:{xp:200}});
  const summary=await mutationSummary();
  assert.equal(summary.total,1);
  assert.ok(summary.entities.includes('progress'));
});

test('normalized player model is valid for Supabase migration format',()=>{
  const model=buildNormalizedPlayerModel();
  const result=validateNormalizedPlayerModel(model);
  assert.equal(model.schema,19);
  assert.equal(result.valid,true);
  assert.ok(model.identity.id);
  assert.ok(Array.isArray(model.matches));
});

test('v1.19 release sources include CI hardening and versioned PWA',()=>{
  const sw=fs.readFileSync(new URL('../public/service-worker.js',import.meta.url),'utf8');
  const workflow=fs.readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
  const releaseCheck=fs.readFileSync(new URL('../scripts/check-release.mjs',import.meta.url),'utf8');
  assert.match(sw,/1\.19\.1/);
  assert.match(workflow,/npm run check:release/);
  assert.match(workflow,/npm test/);
  assert.match(workflow,/npm run lint/);
  assert.match(workflow,/npm run build/);
  assert.match(releaseCheck,/schema-v19/);
});
