import { createProgressBackup, importProgressBackup } from './backup.js';
export const RELEASE_ROLLBACK_KEY='ba_release_rollback_v1';
export function createReleaseRollback(from,to,storage=window.localStorage,now=Date.now()){
  const payload=createProgressBackup(storage);const snapshot={createdAt:now,from,to,payload};storage.setItem(RELEASE_ROLLBACK_KEY,JSON.stringify(snapshot));return snapshot;
}
export function getReleaseRollback(storage=window.localStorage){try{return JSON.parse(storage.getItem(RELEASE_ROLLBACK_KEY)||'null');}catch{return null;}}
export function restoreReleaseRollback(storage=window.localStorage){const snap=getReleaseRollback(storage);if(!snap?.payload)throw new Error('rollback-not-found');return importProgressBackup(snap.payload,storage,true);}
export function clearReleaseRollback(storage=window.localStorage){storage.removeItem(RELEASE_ROLLBACK_KEY);}
