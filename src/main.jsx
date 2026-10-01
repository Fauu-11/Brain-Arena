import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './arena.css';
import './game-theme.css';
import App from './App.jsx';
import { migrateProgressData } from './utils/migration.js';
import { ensureLocalProfiles, saveActiveLocalProfile } from './utils/localProfiles.js';
import { installRuntimeGuards } from './utils/runtimeHealth.js';
import { bootstrapLocalDataLayer } from './data/bootstrap.js';
import { enqueueStorageMutation } from './utils/syncQueue.js';
import { recordMutation } from './utils/mutationJournal.js';

migrateProgressData();
installRuntimeGuards();
try { ensureLocalProfiles(); } catch {}

const syncablePrefixes=['ba_profile','ba_progress','ba_rank','ba_achievements','ba_missions','ba_mastery','ba_season','ba_personal_goals','ba_favorites','ba_pinned_games','ba_matches','ba_competition_setup','ba_accessibility','ba_showcase'];
window.addEventListener('ba-storage-write',event=>{
  const key=event.detail?.key;
  if(!key||!syncablePrefixes.some(prefix=>key.startsWith(prefix)))return;
  const text=event.detail?.text??null;
  const task=async()=>{
    await Promise.allSettled([
      enqueueStorageMutation(key,text),
      recordMutation({type:'LOCAL_WRITE',entity:'local-storage',entityId:key,meta:{bytes:String(text??'').length}}),
    ]);
  };
  const schedule=window.requestIdleCallback||(cb=>setTimeout(cb,250));
  schedule(()=>task());
});

window.addEventListener('pagehide',()=>{ try { saveActiveLocalProfile(); } catch {} });
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);

const schedule=window.requestIdleCallback||(cb=>setTimeout(cb,900));
schedule(()=>bootstrapLocalDataLayer().catch(()=>{}));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const workerUrl = new URL('service-worker.js', document.baseURI);
    navigator.serviceWorker.register(workerUrl.href).catch(() => {});
  });
}
