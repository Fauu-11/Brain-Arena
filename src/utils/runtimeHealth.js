export const RUNTIME_HEALTH_KEY = 'ba_runtime_health_v1';
export const LAST_CRASH_KEY = 'ba_last_crash_v1';
export const APP_VERSION = '1.19.0';

const safeParse = (value, fallback = null) => {
  try { return JSON.parse(value ?? '') ?? fallback; } catch { return fallback; }
};
const safeText = value => String(value ?? '').slice(0, 4000);
const route = () => typeof location !== 'undefined' ? (location.hash || '#/') : '#/';

export function readRuntimeHealth(storage = globalThis.localStorage) {
  if (!storage) return { starts:0, issues:0, lastStartAt:null, lastCleanExitAt:null, lastIssueAt:null };
  try {
    const value = safeParse(storage.getItem(RUNTIME_HEALTH_KEY), {});
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
}

function writeHealth(next, storage = globalThis.localStorage) {
  try { storage?.setItem(RUNTIME_HEALTH_KEY, JSON.stringify(next)); return true; } catch { return false; }
}

export function markRuntimeStart(storage = globalThis.localStorage, now = Date.now()) {
  const prev = readRuntimeHealth(storage);
  const next = {
    ...prev,
    starts: Math.max(0, Number(prev.starts) || 0) + 1,
    lastStartAt: now,
    currentSessionStartedAt: now,
    currentSessionClean: false,
    appVersion: APP_VERSION,
  };
  writeHealth(next, storage);
  return next;
}

export function markRuntimeCleanExit(storage = globalThis.localStorage, now = Date.now()) {
  const prev = readRuntimeHealth(storage);
  const next = { ...prev, lastCleanExitAt: now, currentSessionClean: true, appVersion: APP_VERSION };
  writeHealth(next, storage);
  return next;
}

export function recordRuntimeIssue(type, error, extra = {}, storage = globalThis.localStorage, now = Date.now()) {
  const message = safeText(error?.message || error || type || 'runtime-error');
  const stack = safeText(error?.stack || '');
  const crash = {
    time: now,
    type: safeText(type || 'runtime-error').slice(0, 80),
    message,
    stack,
    route: route(),
    version: APP_VERSION,
    ...Object.fromEntries(Object.entries(extra || {}).filter(([key]) => ['componentStack','source'].includes(key)).map(([key,value]) => [key, safeText(value)])),
  };
  try { storage?.setItem(LAST_CRASH_KEY, JSON.stringify(crash)); } catch {}
  const prev = readRuntimeHealth(storage);
  writeHealth({
    ...prev,
    issues: Math.max(0, Number(prev.issues) || 0) + 1,
    lastIssueAt: now,
    lastIssueType: crash.type,
    currentSessionClean: false,
    appVersion: APP_VERSION,
  }, storage);
  return crash;
}

export function installRuntimeGuards(storage = globalThis.localStorage) {
  if (typeof window === 'undefined') return () => {};
  markRuntimeStart(storage);
  const onError = event => {
    if (event?.error) recordRuntimeIssue('window-error', event.error, { source:event.filename || '' }, storage);
    else if (event?.message) recordRuntimeIssue('window-error', event.message, { source:event.filename || '' }, storage);
  };
  const onRejection = event => recordRuntimeIssue('unhandled-rejection', event?.reason || 'Unhandled promise rejection', {}, storage);
  const onPageHide = () => markRuntimeCleanExit(storage);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  window.addEventListener('pagehide', onPageHide);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    window.removeEventListener('pagehide', onPageHide);
  };
}
