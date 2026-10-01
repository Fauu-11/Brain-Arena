import { createReleaseRollback, restoreReleaseRollback } from './releaseSafety.js';

export const DATA_SCHEMA_VERSION = 19;
export const DATA_SCHEMA_KEY = 'ba_data_schema';
export const MIGRATION_LOG_KEY = 'ba_migration_log_v1';

function readRaw(storage,key){ try { return storage.getItem(key); } catch { return null; } }
function writeRaw(storage,key,value){ try { storage.setItem(key,value); return true; } catch { return false; } }
function readJSON(storage,key,fallback){ const raw=readRaw(storage,key); if(!raw) return fallback; try { return JSON.parse(raw); } catch { return fallback; } }

function performMigration(storage,current){
  const steps=[];

  if (current < 14) {
    const existing=readJSON(storage,'ba_sidebar_layout_v2',null);
    if (!existing) {
      const collapsed=readRaw(storage,'ba_sidebar_collapsed')==='1';
      writeRaw(storage,'ba_sidebar_layout_v2',JSON.stringify({mode:collapsed?'compact':'full',groups:{arena:true,competitive:true,progress:true,other:true,games:false},migratedAt:Date.now()}));
      steps.push('sidebar-layout-v2');
    }
    if (!readRaw(storage,'ba_notifications_v1')) {writeRaw(storage,'ba_notifications_v1',JSON.stringify({read:{},createdAt:Date.now()}));steps.push('notification-state');}
  }

  if (current < 15) {
    const defaults={ba_onboarding_v1:null,ba_personal_goals_v1:[],ba_offline_games_v1:[]};
    for (const [key,value] of Object.entries(defaults)) if (!readRaw(storage,key) && value !== null) {writeRaw(storage,key,JSON.stringify(value));steps.push(`init-${key}`);}
    const a11y=readJSON(storage,'ba_accessibility_v1',{});
    if (a11y && typeof a11y==='object') {writeRaw(storage,'ba_accessibility_v1',JSON.stringify({colorVision:'default',enhancedFocus:false,screenReaderHints:false,disableTimerPressure:false,...a11y}));steps.push('accessibility-v2');}
  }

  if (current < 16) {
    if (!readRaw(storage,'ba_pinned_games_v2')) {const favorites=readJSON(storage,'ba_favorites_v2',[]);writeRaw(storage,'ba_pinned_games_v2',JSON.stringify(Array.isArray(favorites)?favorites.slice(0,4):[]));steps.push('pinned-games-v2');}
    if (!readRaw(storage,'ba_auto_backups_v1')) {writeRaw(storage,'ba_auto_backups_v1',JSON.stringify([]));steps.push('automatic-backups-v1');}
    const setup=readJSON(storage,'ba_competition_setup_v1',{});
    if (setup && typeof setup==='object' && !setup.searchFilters) {writeRaw(storage,'ba_competition_setup_v1',JSON.stringify({...setup,searchFilters:{status:'all',difficulty:'all'}}));steps.push('search-filter-v2');}
  }

  if (current < 17) {
    const defaults={
      ba_named_save_slots_v1:[],
      ba_showcase_v1:{featuredGame:null,featuredMatch:null,showRank:true,showStreak:true,showMastery:true},
      ba_arena_cup_v1:null,
      ba_controller_settings_v1:{enabled:true,vibration:false},
    };
    for (const [key,value] of Object.entries(defaults)) if (!readRaw(storage,key) && value !== null) {writeRaw(storage,key,JSON.stringify(value));steps.push(`init-${key}`);}
    if (!readRaw(storage,'ba_release_migration_v17')) {writeRaw(storage,'ba_release_migration_v17',JSON.stringify({migratedAt:Date.now(),from:current,to:17}));steps.push('release-safety-v1');}
  }

  if (current < 18) {
    const health=readJSON(storage,'ba_runtime_health_v1',{});
    if (!readRaw(storage,'ba_runtime_health_v1')) {
      writeRaw(storage,'ba_runtime_health_v1',JSON.stringify({starts:0,issues:0,lastStartAt:null,lastCleanExitAt:null,lastIssueAt:null,appVersion:'1.18.0'}));
      steps.push('runtime-health-v1');
    } else if (health && typeof health==='object') {
      writeRaw(storage,'ba_runtime_health_v1',JSON.stringify({starts:0,issues:0,lastStartAt:null,lastCleanExitAt:null,lastIssueAt:null,...health,appVersion:'1.18.0'}));
      steps.push('runtime-health-normalize');
    }
    if (!readRaw(storage,'ba_stability_release_v18')) {
      writeRaw(storage,'ba_stability_release_v18',JSON.stringify({migratedAt:Date.now(),from:current,to:18,transactionalBackup:true,pwaCache:'v1.18.0'}));
      steps.push('stability-release-v18');
    }
  }


  if (current < 19) {
    if (!readRaw(storage,'ba_feature_flags_v1')) {
      writeRaw(storage,'ba_feature_flags_v1',JSON.stringify({cloudSync:false,onlineProfile:false,globalLeaderboard:false,social:false,supabaseAdapter:false,indexedDbLayer:true,syncQueue:true,mutationJournal:true}));
      steps.push('feature-flags-v1');
    }
    if (!readRaw(storage,'ba_guest_identity_v1')) {
      const fallback=`guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      let id=fallback;
      try { id=globalThis.crypto?.randomUUID?.()||fallback; } catch {}
      writeRaw(storage,'ba_guest_identity_v1',JSON.stringify({id,type:'guest',createdAt:Date.now(),schema:1}));
      steps.push('guest-identity-v1');
    }
    if (!readRaw(storage,'ba_supabase_readiness_v19')) {
      writeRaw(storage,'ba_supabase_readiness_v19',JSON.stringify({migratedAt:Date.now(),from:current,to:19,indexedDb:true,repositories:true,syncQueue:true,mutationJournal:true,normalizedModel:true,featureFlags:true}));
      steps.push('supabase-readiness-v19');
    }
    const health=readJSON(storage,'ba_runtime_health_v1',{});
    if (health && typeof health==='object') {
      writeRaw(storage,'ba_runtime_health_v1',JSON.stringify({...health,appVersion:'1.19.1'}));
      steps.push('runtime-health-v19');
    }
  }

  if (!writeRaw(storage,DATA_SCHEMA_KEY,String(DATA_SCHEMA_VERSION))) throw new Error('schema-write-failed');
  const log=readJSON(storage,MIGRATION_LOG_KEY,[]);
  const entry={from:current,to:DATA_SCHEMA_VERSION,time:Date.now(),steps,status:'ok'};
  writeRaw(storage,MIGRATION_LOG_KEY,JSON.stringify([entry,...(Array.isArray(log)?log:[])].slice(0,20)));
  return {from:current,to:DATA_SCHEMA_VERSION,changed:true,steps};
}

export function migrateProgressData(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) return { from:0,to:DATA_SCHEMA_VERSION,changed:false,steps:['storage-unavailable'] };
  const current=Math.max(0,Math.floor(Number(readRaw(storage,DATA_SCHEMA_KEY))||0));
  if (current>=DATA_SCHEMA_VERSION) return { from:current,to:current,changed:false,steps:[] };
  if (current>0) {
    try { createReleaseRollback(current,DATA_SCHEMA_VERSION,storage); }
    catch { /* migration can continue if backup storage is unavailable */ }
  }
  try { return performMigration(storage,current); }
  catch (error) {
    try { restoreReleaseRollback(storage); } catch {}
    const log=readJSON(storage,MIGRATION_LOG_KEY,[]);
    writeRaw(storage,MIGRATION_LOG_KEY,JSON.stringify([{from:current,to:DATA_SCHEMA_VERSION,time:Date.now(),steps:[],status:'rolled-back',error:String(error?.message||error)},...(Array.isArray(log)?log:[])].slice(0,20)));
    return {from:current,to:current,changed:false,steps:['rollback'],error:String(error?.message||error),rolledBack:true};
  }
}

export function dataSchemaVersion(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) return 0;
  return Math.max(0,Math.floor(Number(readRaw(storage,DATA_SCHEMA_KEY))||0));
}
