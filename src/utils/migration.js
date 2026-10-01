export const DATA_SCHEMA_VERSION = 15;
export const DATA_SCHEMA_KEY = 'ba_data_schema';
export const MIGRATION_LOG_KEY = 'ba_migration_log_v1';

function readRaw(storage,key){ try { return storage.getItem(key); } catch { return null; } }
function writeRaw(storage,key,value){ try { storage.setItem(key,value); return true; } catch { return false; } }
function readJSON(storage,key,fallback){ const raw=readRaw(storage,key); if(!raw) return fallback; try { return JSON.parse(raw); } catch { return fallback; } }

export function migrateProgressData(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) return { from:0,to:DATA_SCHEMA_VERSION,changed:false,steps:['storage-unavailable'] };
  const current=Math.max(0,Math.floor(Number(readRaw(storage,DATA_SCHEMA_KEY))||0));
  if (current>=DATA_SCHEMA_VERSION) return { from:current,to:current,changed:false,steps:[] };
  const steps=[];

  // v14 consolidates sidebar preference without deleting the legacy key.
  if (current < 14) {
    const existing=readJSON(storage,'ba_sidebar_layout_v2',null);
    if (!existing) {
      const collapsed=readRaw(storage,'ba_sidebar_collapsed')==='1';
      writeRaw(storage,'ba_sidebar_layout_v2',JSON.stringify({
        mode:collapsed?'compact':'full',
        groups:{ arena:true,competitive:true,progress:true,other:true,games:false },
        migratedAt:Date.now(),
      }));
      steps.push('sidebar-layout-v2');
    }
    if (!readRaw(storage,'ba_notifications_v1')) {
      writeRaw(storage,'ba_notifications_v1',JSON.stringify({read:{},createdAt:Date.now()}));
      steps.push('notification-state');
    }
  }

  if (current < 15) {
    const defaults={
      ba_onboarding_v1:null,
      ba_personal_goals_v1:[],
      ba_offline_games_v1:[],
    };
    for (const [key,value] of Object.entries(defaults)) {
      if (!readRaw(storage,key) && value !== null) { writeRaw(storage,key,JSON.stringify(value)); steps.push(`init-${key}`); }
    }
    const a11y=readJSON(storage,'ba_accessibility_v1',{});
    if (a11y && typeof a11y==='object') {
      writeRaw(storage,'ba_accessibility_v1',JSON.stringify({colorVision:'default',enhancedFocus:false,screenReaderHints:false,disableTimerPressure:false,...a11y}));
      steps.push('accessibility-v2');
    }
  }

  writeRaw(storage,DATA_SCHEMA_KEY,String(DATA_SCHEMA_VERSION));
  const log=readJSON(storage,MIGRATION_LOG_KEY,[]);
  const entry={from:current,to:DATA_SCHEMA_VERSION,time:Date.now(),steps};
  writeRaw(storage,MIGRATION_LOG_KEY,JSON.stringify([entry,...(Array.isArray(log)?log:[])].slice(0,20)));
  return { from:current,to:DATA_SCHEMA_VERSION,changed:true,steps };
}

export function dataSchemaVersion(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) return 0;
  return Math.max(0,Math.floor(Number(readRaw(storage,DATA_SCHEMA_KEY))||0));
}
