import { DATA_SCHEMA_VERSION, dataSchemaVersion } from './migration.js';
import { storageBreakdown } from './storageOptimizer.js';
export const APP_VERSION='1.17.0';
export async function collectSystemDiagnostics(storage=window.localStorage){
  const storageInfo=storageBreakdown(storage);let cacheNames=[];try{cacheNames=typeof caches!=='undefined'?await caches.keys():[];}catch{}
  let sw={supported:'serviceWorker'in navigator,controlled:Boolean(navigator.serviceWorker?.controller),state:navigator.serviceWorker?.controller?.state||'none'};
  let estimate=null;try{estimate=await navigator.storage?.estimate?.();}catch{}
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||Boolean(navigator.standalone);
  const lastCrash=(()=>{try{return JSON.parse(storage.getItem('ba_last_crash_v1')||'null');}catch{return null;}})();
  const rollback=(()=>{try{const raw=JSON.parse(storage.getItem('ba_release_rollback_v1')||'null');return raw?{createdAt:raw.createdAt,from:raw.from,to:raw.to}:null;}catch{return null;}})();
  return {appVersion:APP_VERSION,schema:{current:dataSchemaVersion(storage),expected:DATA_SCHEMA_VERSION},storage:{bytes:storageInfo.total,keys:storageInfo.entries.length,quota:estimate?.quota||null,usage:estimate?.usage||null},serviceWorker:sw,caches:cacheNames,pwaStandalone:standalone,online:navigator.onLine,language:navigator.language,platform:navigator.platform||'',userAgent:navigator.userAgent,viewport:{width:window.innerWidth,height:window.innerHeight,dpr:window.devicePixelRatio||1},lastCrash,rollback,collectedAt:Date.now()};
}
