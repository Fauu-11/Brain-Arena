import { createProgressBackup, importProgressBackup } from './backup.js';

export const LOCAL_PROFILE_REGISTRY_KEY='ba_local_profiles_v1';
export const ACTIVE_LOCAL_PROFILE_KEY='ba_active_local_profile_v1';
const SLOT_PREFIX='ba_local_profile_slot_';
const MAX_PROFILES=6;

const safeJson=(text,fallback)=>{try{return JSON.parse(text??'')??fallback;}catch{return fallback;}};
const idFor=(seed=Date.now())=>`profile-${Number(seed).toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const normalizeName=value=>String(value||'').replace(/\s+/g,' ').trim().slice(0,24)||'Pemain Lokal';

function registry(storage){
  const raw=safeJson(storage.getItem(LOCAL_PROFILE_REGISTRY_KEY),[]);
  return Array.isArray(raw)?raw.filter(item=>item&&typeof item.id==='string').slice(0,MAX_PROFILES):[];
}
function writeRegistry(storage,list){ storage.setItem(LOCAL_PROFILE_REGISTRY_KEY,JSON.stringify(list.slice(0,MAX_PROFILES))); return list.slice(0,MAX_PROFILES); }
function slotKey(id){return `${SLOT_PREFIX}${id}`;}
function readSlot(storage,id){return safeJson(storage.getItem(slotKey(id)),null);}
function writeSlot(storage,id,payload){storage.setItem(slotKey(id),JSON.stringify(payload));return payload;}
function blankPayload(name){
  return {format:'brain-arena-backup',version:1,appVersion:'1.19.0',exportedAt:new Date().toISOString(),data:{
    ba_profile_v1:JSON.stringify({name:normalizeName(name),xp:0,rankedPoints:0,completions:0,playDates:[],perGame:{},xpEvents:[],completionEvents:[]}),
    ba_favorites_v2:'[]',ba_pinned_games_v2:'[]',ba_recent_v2:'[]',ba_daily_v1:JSON.stringify({completedByDate:{}}),ba_match_history_v1:'[]',ba_personal_bests_v1:'{}',ba_game_completion_v1:'{}',ba_notifications_v1:JSON.stringify({read:{}}),ba_personal_goals_v1:'[]'
  }};
}

export function ensureLocalProfiles(storage=window.localStorage,now=Date.now()){
  let list=registry(storage);
  let active=storage.getItem(ACTIVE_LOCAL_PROFILE_KEY);
  if(!list.length){
    const current=createProgressBackup(storage);
    const profile=safeJson(current.data?.ba_profile_v1,'')||{};
    const id='profile-main';
    list=[{id,name:normalizeName(profile.name||'Pemain Lokal'),createdAt:now,lastActiveAt:now}];
    writeRegistry(storage,list); writeSlot(storage,id,current); storage.setItem(ACTIVE_LOCAL_PROFILE_KEY,id); active=id;
  }
  if(!list.some(item=>item.id===active)){active=list[0].id;storage.setItem(ACTIVE_LOCAL_PROFILE_KEY,active);}
  return {profiles:list,activeId:active};
}

export function listLocalProfiles(storage=window.localStorage){ return ensureLocalProfiles(storage); }

export function saveActiveLocalProfile(storage=window.localStorage,now=Date.now()){
  const {profiles,activeId}=ensureLocalProfiles(storage,now);
  const payload=createProgressBackup(storage);
  writeSlot(storage,activeId,payload);
  const profile=safeJson(payload.data?.ba_profile_v1,'')||{};
  const next=profiles.map(item=>item.id===activeId?{...item,name:normalizeName(profile.name||item.name),lastActiveAt:now}:item);
  writeRegistry(storage,next);
  return next.find(item=>item.id===activeId);
}

export function createLocalProfile(name,storage=window.localStorage,now=Date.now()){
  const state=ensureLocalProfiles(storage,now); if(state.profiles.length>=MAX_PROFILES) throw new Error('profile-limit');
  saveActiveLocalProfile(storage,now);
  const id=idFor(now); const meta={id,name:normalizeName(name),createdAt:now,lastActiveAt:0};
  writeRegistry(storage,[...registry(storage),meta]); writeSlot(storage,id,blankPayload(meta.name)); return meta;
}

export function renameLocalProfile(id,name,storage=window.localStorage){
  const list=registry(storage); if(!list.some(item=>item.id===id)) return null;
  const normalized=normalizeName(name); const next=list.map(item=>item.id===id?{...item,name:normalized}:item); writeRegistry(storage,next);
  const payload=readSlot(storage,id); if(payload?.data?.ba_profile_v1){const profile=safeJson(payload.data.ba_profile_v1,{})||{};payload.data.ba_profile_v1=JSON.stringify({...profile,name:normalized});writeSlot(storage,id,payload);}
  if(storage.getItem(ACTIVE_LOCAL_PROFILE_KEY)===id){const profile=safeJson(storage.getItem('ba_profile_v1'),{})||{};storage.setItem('ba_profile_v1',JSON.stringify({...profile,name:normalized}));}
  return next.find(item=>item.id===id);
}

export function switchLocalProfile(id,storage=window.localStorage,now=Date.now()){
  const state=ensureLocalProfiles(storage,now); if(!state.profiles.some(item=>item.id===id)) throw new Error('profile-not-found');
  if(state.activeId===id) return id;
  saveActiveLocalProfile(storage,now);
  const payload=readSlot(storage,id)||blankPayload(state.profiles.find(item=>item.id===id)?.name);
  importProgressBackup(payload,storage,true);
  storage.setItem(ACTIVE_LOCAL_PROFILE_KEY,id);
  const next=registry(storage).map(item=>item.id===id?{...item,lastActiveAt:now}:item); writeRegistry(storage,next);
  return id;
}

export function deleteLocalProfile(id,storage=window.localStorage){
  const state=ensureLocalProfiles(storage); if(state.activeId===id) throw new Error('active-profile');
  const next=state.profiles.filter(item=>item.id!==id); writeRegistry(storage,next); storage.removeItem(slotKey(id)); return next;
}

export function activeLocalProfile(storage=window.localStorage){const state=ensureLocalProfiles(storage);return state.profiles.find(item=>item.id===state.activeId)||null;}
export function profileSlotKey(id){return slotKey(id);}
export function localProfileStorageKeys(storage=window.localStorage){return [LOCAL_PROFILE_REGISTRY_KEY,ACTIVE_LOCAL_PROFILE_KEY,...registry(storage).map(item=>slotKey(item.id))];}
