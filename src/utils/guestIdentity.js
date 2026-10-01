import { readJSON, writeJSON } from './storage.js';
export const GUEST_IDENTITY_KEY='ba_guest_identity_v1';
function fallbackUuid(){const hex='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';return hex.replace(/[xy]/g,c=>{const r=Math.floor(Math.random()*16);return (c==='x'?r:(r&3)|8).toString(16);});}
export function generateGuestUuid(){try{return globalThis.crypto?.randomUUID?.()||fallbackUuid();}catch{return fallbackUuid();}}
export function getOrCreateGuestIdentity(){
  const existing=readJSON(GUEST_IDENTITY_KEY,null);
  if(existing?.id) return existing;
  const identity={id:generateGuestUuid(),type:'guest',createdAt:Date.now(),schema:1};writeJSON(GUEST_IDENTITY_KEY,identity);return identity;
}
export function readGuestIdentity(){return readJSON(GUEST_IDENTITY_KEY,null);}
