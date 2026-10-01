const sizeOf=value=>new Blob([String(value||'')]).size;
const keysMatching=(storage,predicate)=>{const out=[];for(let i=0;i<storage.length;i+=1){const key=storage.key(i);if(key&&predicate(key))out.push(key);}return out;};
export function storageBreakdown(storage=window.localStorage){
  const entries=[];let total=0;for(let i=0;i<storage.length;i+=1){const key=storage.key(i);if(!key)continue;const value=storage.getItem(key)||'';const bytes=sizeOf(key)+sizeOf(value);total+=bytes;entries.push({key,bytes});}
  const group=(name,pred)=>({name,bytes:entries.filter(e=>pred(e.key)).reduce((s,e)=>s+e.bytes,0),keys:entries.filter(e=>pred(e.key)).map(e=>e.key)});
  const groups=[
    group('replays',k=>k==='ba_match_history_v1'),
    group('backups',k=>k==='ba_auto_backups_v1'||k==='ba_named_save_slots_v1'),
    group('recovery',k=>k==='ba_recovery_session_v2'),
    group('profiles',k=>k.startsWith('ba_local_profile_slot_')||k==='ba_local_profiles_v1'),
    group('core',k=>k.startsWith('ba_')&&!['ba_match_history_v1','ba_auto_backups_v1','ba_named_save_slots_v1','ba_recovery_session_v2'].includes(k)&&!k.startsWith('ba_local_profile_slot_')),
  ];
  return {total,groups,entries};
}
export function compactReplayHistory(storage=window.localStorage){try{const list=JSON.parse(storage.getItem('ba_match_history_v1')||'[]');if(!Array.isArray(list))return 0;const next=list.map(item=>({...item,replay:[]}));storage.setItem('ba_match_history_v1',JSON.stringify(next));return list.reduce((n,item)=>n+(Array.isArray(item.replay)?item.replay.length:0),0);}catch{return 0;}}
export function clearStorageCategory(category,storage=window.localStorage){
  if(category==='replays')return compactReplayHistory(storage);
  if(category==='history'){storage.setItem('ba_match_history_v1','[]');storage.setItem('ba_recent_v2','[]');return 2;}
  if(category==='backups'){storage.setItem('ba_auto_backups_v1','[]');storage.setItem('ba_named_save_slots_v1','[]');return 2;}
  if(category==='recovery'){storage.removeItem('ba_recovery_session_v2');return 1;}
  return 0;
}
export async function clearBrainArenaCaches(){if(typeof caches==='undefined')return 0;const names=await caches.keys();const targets=names.filter(name=>/brain-arena|brainarena/i.test(name));await Promise.all(targets.map(name=>caches.delete(name)));return targets.length;}
export function bytesLabel(bytes){const n=Number(bytes)||0;if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024/1024).toFixed(2)} MB`;}
