import { createProgressBackup, importProgressBackup } from './backup.js';
export const SAVE_SLOT_KEY='ba_named_save_slots_v1';
const MAX_SLOTS=10;
const read=(storage)=>{try{const raw=JSON.parse(storage.getItem(SAVE_SLOT_KEY)||'[]');return Array.isArray(raw)?raw.filter(x=>x&&x.id&&x.payload?.format==='brain-arena-backup').slice(0,MAX_SLOTS):[];}catch{return[];}};
const write=(storage,list)=>{storage.setItem(SAVE_SLOT_KEY,JSON.stringify(list.slice(0,MAX_SLOTS)));return list.slice(0,MAX_SLOTS);};
const summary=payload=>{const parse=k=>{try{return JSON.parse(payload.data?.[k]||'null');}catch{return null;}};const p=parse('ba_profile_v1')||{};const m=parse('ba_match_history_v1')||[];return{xp:Number(p.xp)||0,rankedPoints:Number(p.rankedPoints)||0,completions:Number(p.completions)||0,matches:Array.isArray(m)?m.length:0};};
export function listSaveSlots(storage=window.localStorage){return read(storage);}
export function createSaveSlot(label='Save Slot',storage=window.localStorage,now=Date.now()){const payload=createProgressBackup(storage);const item={id:`slot-${now.toString(36)}`,label:String(label||'Save Slot').trim().slice(0,40)||'Save Slot',createdAt:now,updatedAt:now,summary:summary(payload),payload};return write(storage,[item,...read(storage)])[0];}
export function renameSaveSlot(id,label,storage=window.localStorage){const next=read(storage).map(item=>item.id===id?{...item,label:String(label||item.label).trim().slice(0,40)||item.label}:item);write(storage,next);return next.find(x=>x.id===id)||null;}
export function overwriteSaveSlot(id,storage=window.localStorage,now=Date.now()){const payload=createProgressBackup(storage);const next=read(storage).map(item=>item.id===id?{...item,updatedAt:now,summary:summary(payload),payload}:item);write(storage,next);return next.find(x=>x.id===id)||null;}
export function restoreSaveSlot(id,storage=window.localStorage){const item=read(storage).find(x=>x.id===id);if(!item)throw new Error('slot-not-found');return importProgressBackup(item.payload,storage,true);}
export function deleteSaveSlot(id,storage=window.localStorage){return write(storage,read(storage).filter(x=>x.id!==id));}
export function exportSaveSlot(id,storage=window.localStorage){const item=read(storage).find(x=>x.id===id);if(!item)throw new Error('slot-not-found');return item.payload;}
