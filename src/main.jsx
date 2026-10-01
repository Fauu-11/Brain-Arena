import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './arena.css';
import './game-theme.css';
import App from './App.jsx';
import { migrateProgressData } from './utils/migration.js';
import { ensureLocalProfiles, saveActiveLocalProfile } from './utils/localProfiles.js';
import { installRuntimeGuards } from './utils/runtimeHealth.js';
migrateProgressData();
installRuntimeGuards();
try { ensureLocalProfiles(); } catch {}
window.addEventListener('pagehide',()=>{ try { saveActiveLocalProfile(); } catch {} });
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const workerUrl = new URL('service-worker.js', document.baseURI);
    navigator.serviceWorker.register(workerUrl.href).catch(() => {});
  });
}
