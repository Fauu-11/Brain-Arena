import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './arena.css';
import './game-theme.css';
import App from './App.jsx';
import { migrateProgressData } from './utils/migration.js';
migrateProgressData();
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const workerUrl = new URL('service-worker.js', document.baseURI);
    navigator.serviceWorker.register(workerUrl.href).catch(() => {});
  });
}
