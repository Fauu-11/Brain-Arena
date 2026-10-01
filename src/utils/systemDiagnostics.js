import { DATA_SCHEMA_VERSION, dataSchemaVersion } from './migration.js';
import { storageBreakdown } from './storageOptimizer.js';
import { inspectDataHealth } from './dataHealth.js';
import { readRuntimeHealth } from './runtimeHealth.js';
import { localDbStatus } from '../data/localDb.js';
import { syncQueueSummary } from './syncQueue.js';
import { mutationSummary } from './mutationJournal.js';
import { simulateCloudMigration } from './cloudReadiness.js';
import { readGuestIdentity } from './guestIdentity.js';
export const APP_VERSION='1.19.0';
export async function collectSystemDiagnostics(storage=window.localStorage){
  const storageInfo=storageBreakdown(storage);let cacheNames=[];try{cacheNames=typeof caches!=='undefined'?await caches.keys():[];}catch{}
  const sw={supported:'serviceWorker'in navigator,controlled:Boolean(navigator.serviceWorker?.controller),state:navigator.serviceWorker?.controller?.state||'none'};
  let estimate=null;try{estimate=await navigator.storage?.estimate?.();}catch{}
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||Boolean(navigator.standalone);
  const lastCrash=(()=>{try{return JSON.parse(storage.getItem('ba_last_crash_v1')||'null');}catch{return null;}})();
  const rollback=(()=>{try{const raw=JSON.parse(storage.getItem('ba_release_rollback_v1')||'null');return raw?{createdAt:raw.createdAt,from:raw.from,to:raw.to}:null;}catch{return null;}})();
  const dataHealth=inspectDataHealth(storage);const runtime=readRuntimeHealth(storage);
  const [indexedDb,syncQueue,mutations,cloudReadiness]=await Promise.all([localDbStatus(),syncQueueSummary(),mutationSummary(),simulateCloudMigration()]);
  const quota=Number(estimate?.quota)||0;const usage=Number(estimate?.usage)||0;
  return {
    appVersion:APP_VERSION,
    schema:{current:dataSchemaVersion(storage),expected:DATA_SCHEMA_VERSION,ok:dataSchemaVersion(storage)===DATA_SCHEMA_VERSION},
    storage:{bytes:storageInfo.total,keys:storageInfo.entries.length,quota:quota||null,usage:usage||null,usagePercent:quota?Math.round((usage/quota)*1000)/10:null},
    indexedDb,syncQueue,mutations,guestIdentity:readGuestIdentity(),cloudReadiness,
    dataHealth:{status:dataHealth.status,invalid:dataHealth.invalid.length,criticalInvalid:dataHealth.criticalInvalid.length},
    runtime:{starts:Number(runtime.starts)||0,issues:Number(runtime.issues)||0,lastStartAt:runtime.lastStartAt||null,lastCleanExitAt:runtime.lastCleanExitAt||null,lastIssueAt:runtime.lastIssueAt||null,lastIssueType:runtime.lastIssueType||null},
    serviceWorker:sw,caches:cacheNames,pwaStandalone:standalone,online:navigator.onLine,language:navigator.language,platform:navigator.platform||'',userAgent:navigator.userAgent,viewport:{width:window.innerWidth,height:window.innerHeight,dpr:window.devicePixelRatio||1},lastCrash,rollback,collectedAt:Date.now()
  };
}
