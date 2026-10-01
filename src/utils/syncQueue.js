import { dbDelete, dbGetAll, dbPut } from '../data/localDb.js';
const VALID_STATUS=new Set(['pending','syncing','synced','failed','deferred']);
function id(){try{return crypto.randomUUID();}catch{return `sync-${Date.now()}-${Math.random().toString(16).slice(2)}`;}}
export async function enqueueSyncMutation({type,entity,entityId=null,payload=null,status='deferred'}={}){
  const item={id:id(),type:String(type||'UPSERT'),entity:String(entity||'unknown'),entityId:entityId==null?null:String(entityId),payload,createdAt:Date.now(),updatedAt:Date.now(),retryCount:0,status:VALID_STATUS.has(status)?status:'deferred'};
  await dbPut('sync_queue',item);return item;
}
export async function listSyncQueue(){return (await dbGetAll('sync_queue')).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));}
export async function updateSyncItem(item,patch={}){const next={...item,...patch,updatedAt:Date.now()};if(!VALID_STATUS.has(next.status))next.status='failed';await dbPut('sync_queue',next);return next;}
export async function retrySyncItem(item){return updateSyncItem(item,{status:'deferred',retryCount:(Number(item.retryCount)||0)+1,lastError:null});}
export async function removeSyncItem(id){return dbDelete('sync_queue',id);}
export async function syncQueueSummary(){const items=await listSyncQueue();return {total:items.length,pending:items.filter(i=>i.status==='pending'||i.status==='deferred').length,failed:items.filter(i=>i.status==='failed').length,synced:items.filter(i=>i.status==='synced').length};}

export async function enqueueStorageMutation(key,text){
  const items=await listSyncQueue();
  const existing=[...items].reverse().find(item=>item.status==='deferred'&&item.entity==='local-storage'&&item.entityId===key);
  const payload={key,value:text,updatedAt:Date.now()};
  if(existing) return updateSyncItem(existing,{type:'UPSERT_LOCAL',payload});
  return enqueueSyncMutation({type:'UPSERT_LOCAL',entity:'local-storage',entityId:key,payload,status:'deferred'});
}
