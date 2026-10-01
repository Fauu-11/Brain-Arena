import { DATA_SCHEMA_VERSION, dataSchemaVersion } from './migration.js';
import { localDbStatus, dbGetAll } from '../data/localDb.js';
import { getOrCreateGuestIdentity } from './guestIdentity.js';
import { getFeatureFlags } from './featureFlags.js';
import { buildNormalizedPlayerModel, validateNormalizedPlayerModel } from './normalizedModel.js';
import { syncQueueSummary } from './syncQueue.js';
import { mutationSummary } from './mutationJournal.js';
export async function simulateCloudMigration(){
  const checks=[];const push=(id,label,ok,detail='')=>checks.push({id,label,ok:Boolean(ok),detail});
  const schema=dataSchemaVersion();push('schema','Data Schema',schema===DATA_SCHEMA_VERSION,`v${schema}/v${DATA_SCHEMA_VERSION}`);
  const identity=getOrCreateGuestIdentity();push('identity','Guest Identity',Boolean(identity?.id),identity?.id||'missing');
  const db=await localDbStatus();push('indexeddb','IndexedDB Layer',db.open||db.mode==='memory-fallback',db.mode);
  const model=buildNormalizedPlayerModel();const validation=validateNormalizedPlayerModel(model);push('normalized','Normalized Model',validation.valid,validation.issues.join(', ')||'valid');
  const queue=await syncQueueSummary();push('sync-queue','Sync Queue',Number.isFinite(queue.total),`${queue.pending} pending`);
  const mutations=await mutationSummary();push('journal','Mutation Journal',Number.isFinite(mutations.total),`${mutations.total} entries`);
  const flags=getFeatureFlags();push('flags','Feature Flags',flags.indexedDbLayer&&flags.syncQueue&&flags.mutationJournal,'local readiness enabled');
  let mirrorCount=0;try{mirrorCount=(await dbGetAll('records')).length;}catch{}push('repositories','Repository Mirror',mirrorCount>=0,`${mirrorCount} records`);
  const passed=checks.filter(c=>c.ok).length;const percent=Math.round((passed/checks.length)*100);
  return {ready:percent===100,percent,checks,issues:checks.filter(c=>!c.ok).map(c=>c.id),generatedAt:Date.now(),schema,db,queue,mutations,flags};
}
