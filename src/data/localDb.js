export const LOCAL_DB_NAME='brain-arena-local';
export const LOCAL_DB_VERSION=1;
export const LOCAL_DB_STORES=['records','sync_queue','mutations','meta'];
const memoryStores=new Map(LOCAL_DB_STORES.map(name=>[name,new Map()]));
let openPromise=null;
function hasIndexedDb(){return typeof indexedDB!=='undefined'&&indexedDB&&typeof indexedDB.open==='function';}
function requestToPromise(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('indexeddb-request-failed'));});}
export function openLocalDb(){
  if(!hasIndexedDb()) return Promise.resolve(null);
  if(openPromise) return openPromise;
  openPromise=new Promise((resolve,reject)=>{
    let request;
    try { request=indexedDB.open(LOCAL_DB_NAME,LOCAL_DB_VERSION); } catch (error) { reject(error); return; }
    request.onupgradeneeded=()=>{const db=request.result;for(const name of LOCAL_DB_STORES) if(!db.objectStoreNames.contains(name)) db.createObjectStore(name,{keyPath:'id'});};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>{openPromise=null;reject(request.error||new Error('indexeddb-open-failed'));};
    request.onblocked=()=>{openPromise=null;reject(new Error('indexeddb-blocked'));};
  }).catch(error=>{openPromise=null;throw error;});
  return openPromise;
}
function memoryPut(store,value){const id=value?.id;if(id==null) throw new Error('indexeddb-record-id-required');memoryStores.get(store)?.set(String(id),structuredCloneSafe(value));return value;}
function structuredCloneSafe(value){try{return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));}catch{return value;}}
export async function dbPut(store,value){
  if(!LOCAL_DB_STORES.includes(store)) throw new Error(`unknown-store:${store}`);
  if(!hasIndexedDb()) return memoryPut(store,value);
  try{const db=await openLocalDb();const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('indexeddb-write-failed'));tx.onabort=()=>reject(tx.error||new Error('indexeddb-write-aborted'));});return value;}catch{return memoryPut(store,value);}
}
export async function dbGet(store,id){
  if(!LOCAL_DB_STORES.includes(store)) throw new Error(`unknown-store:${store}`);
  if(!hasIndexedDb()) return structuredCloneSafe(memoryStores.get(store)?.get(String(id))??null);
  try{const db=await openLocalDb();const tx=db.transaction(store,'readonly');return (await requestToPromise(tx.objectStore(store).get(id)))??null;}catch{return structuredCloneSafe(memoryStores.get(store)?.get(String(id))??null);}
}
export async function dbGetAll(store){
  if(!LOCAL_DB_STORES.includes(store)) throw new Error(`unknown-store:${store}`);
  if(!hasIndexedDb()) return [...(memoryStores.get(store)?.values()||[])].map(structuredCloneSafe);
  try{const db=await openLocalDb();const tx=db.transaction(store,'readonly');return await requestToPromise(tx.objectStore(store).getAll());}catch{return [...(memoryStores.get(store)?.values()||[])].map(structuredCloneSafe);}
}
export async function dbDelete(store,id){
  if(!LOCAL_DB_STORES.includes(store)) throw new Error(`unknown-store:${store}`);
  if(!hasIndexedDb()){memoryStores.get(store)?.delete(String(id));return true;}
  try{const db=await openLocalDb();const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('indexeddb-delete-failed'));});return true;}catch{memoryStores.get(store)?.delete(String(id));return true;}
}
export async function dbClear(store){
  if(!LOCAL_DB_STORES.includes(store)) throw new Error(`unknown-store:${store}`);
  if(!hasIndexedDb()){memoryStores.get(store)?.clear();return true;}
  try{const db=await openLocalDb();const tx=db.transaction(store,'readwrite');tx.objectStore(store).clear();await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('indexeddb-clear-failed'));});return true;}catch{memoryStores.get(store)?.clear();return true;}
}
export async function localDbStatus(){
  const supported=hasIndexedDb();
  if(!supported) return {supported:false,open:false,mode:'memory-fallback',stores:[...LOCAL_DB_STORES]};
  try{const db=await openLocalDb();return {supported:true,open:true,mode:'indexeddb',name:db.name,version:db.version,stores:[...db.objectStoreNames]};}
  catch(error){return {supported:true,open:false,mode:'error',error:String(error?.message||error),stores:[...LOCAL_DB_STORES]};}
}
export async function mirrorLegacyKey(key,storage=typeof window!=='undefined'?window.localStorage:null){
  if(!storage) return false;let raw;try{raw=storage.getItem(key);}catch{return false;}if(raw==null)return false;
  await dbPut('records',{id:`legacy:${key}`,kind:'legacy-mirror',key,raw,mirroredAt:Date.now()});return true;
}
export async function mirrorHeavyLegacyData(storage=typeof window!=='undefined'?window.localStorage:null){
  if(!storage) return {mirrored:0,keys:[]};
  const heavyPrefixes=['ba_matches','ba_match_history','ba_replay','ba_auto_backups','ba_named_save_slots','ba_notifications','ba_arena_run','ba_arena_cup','ba_activity','ba_statistics'];
  const keys=[];try{for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&heavyPrefixes.some(prefix=>key.startsWith(prefix)))keys.push(key);}}catch{}
  let mirrored=0;for(const key of keys){try{if(await mirrorLegacyKey(key,storage))mirrored++;}catch{}}
  try{await dbPut('meta',{id:'legacy-mirror-status',mirrored,keys,updatedAt:Date.now()});}catch{}
  return {mirrored,keys};
}
