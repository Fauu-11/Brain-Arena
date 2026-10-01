const SNAPSHOT_KEY='ba_restore_point_v1';
const QUARANTINE_KEY='ba_corrupt_quarantine_v1';
const TEXT_KEYS=new Set(['ba_data_schema','ba_sidebar_collapsed','arena_lang','language']);

function safeKeys(storage){const out=[];if(!storage)return out;try{for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith('ba_'))out.push(k);}}catch{}return out.sort();}
export function brainArenaKeys(storage=globalThis.localStorage){return safeKeys(storage);}

function expectsJson(key,value){
  if(TEXT_KEYS.has(key))return false;
  if(key===QUARANTINE_KEY)return true;
  return value.startsWith('{')||value.startsWith('[');
}

export function inspectDataHealth(storage=globalThis.localStorage){
  const keys=brainArenaKeys(storage);const items=[];let bytes=0;
  for(const key of keys){
    let value='';try{value=storage.getItem(key)??'';}catch{value='';}
    bytes+=key.length+value.length;let valid=true;let kind='text';
    if(expectsJson(key,value)){
      if(TEXT_KEYS.has(key)){kind='text';}
      else {kind='json';try{JSON.parse(value);}catch{valid=false;}}
    }
    items.push({key,valid,kind,size:value.length,critical:['ba_profile_v1','ba_match_history_v1','ba_data_schema','ba_local_profiles_v1'].includes(key)});
  }
  const invalid=items.filter(x=>!x.valid);
  return{keys:items,total:items.length,invalid,bytes,status:invalid.length?'warning':'healthy',criticalInvalid:invalid.filter(x=>x.critical)};
}

export function createRestorePoint(storage=globalThis.localStorage){
  const data={createdAt:Date.now(),values:{}};
  for(const key of brainArenaKeys(storage)){if(key!==SNAPSHOT_KEY)data.values[key]=storage.getItem(key);}
  storage.setItem(SNAPSHOT_KEY,JSON.stringify(data));return data;
}
export function loadRestorePoint(storage=globalThis.localStorage){try{return JSON.parse(storage.getItem(SNAPSHOT_KEY)||'null');}catch{return null;}}
export function restorePoint(storage=globalThis.localStorage){const snap=loadRestorePoint(storage);if(!snap?.values)return 0;let count=0;for(const [k,v] of Object.entries(snap.values)){storage.setItem(k,String(v));count++;}return count;}

export function quarantineInvalidData(storage=globalThis.localStorage,now=Date.now()){
  const report=inspectDataHealth(storage);if(!report.invalid.length)return {count:0,items:[]};
  const previous=(()=>{try{const raw=JSON.parse(storage.getItem(QUARANTINE_KEY)||'[]');return Array.isArray(raw)?raw:[];}catch{return [];}})();
  const items=report.invalid.map(item=>({key:item.key,value:storage.getItem(item.key)??'',capturedAt:now}));
  storage.setItem(QUARANTINE_KEY,JSON.stringify([...items,...previous].slice(0,30)));
  return {count:items.length,items};
}

export function repairInvalidData(storage=globalThis.localStorage){
  const report=inspectDataHealth(storage);if(!report.invalid.length)return 0;
  createRestorePoint(storage);quarantineInvalidData(storage);
  for(const item of report.invalid){if(item.key!==QUARANTINE_KEY)storage.removeItem(item.key);}
  return report.invalid.filter(item=>item.key!==QUARANTINE_KEY).length;
}

export function corruptionQuarantine(storage=globalThis.localStorage){try{const raw=JSON.parse(storage.getItem(QUARANTINE_KEY)||'[]');return Array.isArray(raw)?raw:[];}catch{return [];}}
