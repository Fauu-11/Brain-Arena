import { dbDelete, dbGetAll, dbPut } from '../data/localDb.js';
import { getOrCreateGuestIdentity } from './guestIdentity.js';
function makeId(){try{return crypto.randomUUID();}catch{return `mutation-${Date.now()}-${Math.random().toString(16).slice(2)}`;}}
export async function recordMutation({type,entity,entityId=null,before=null,after=null,meta=null}={}){
  const item={id:makeId(),playerId:getOrCreateGuestIdentity().id,type:String(type||'UPDATE'),entity:String(entity||'unknown'),entityId:entityId==null?null:String(entityId),before,after,meta,createdAt:Date.now()};
  await dbPut('mutations',item);
  const all=await dbGetAll('mutations');
  if(all.length>500){const oldest=[...all].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)).slice(0,all.length-500);await Promise.allSettled(oldest.map(entry=>dbDelete('mutations',entry.id)));}
  return item;
}
export async function listMutations(limit=100){const all=await dbGetAll('mutations');return all.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,Math.max(1,limit));}
export async function mutationSummary(){const items=await listMutations(500);return {total:items.length,lastAt:items[0]?.createdAt||null,entities:[...new Set(items.map(i=>i.entity))]};}
