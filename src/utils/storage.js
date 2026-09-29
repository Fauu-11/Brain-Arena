// Preserve existing record/preference keys. A memory fallback keeps games usable
// when localStorage is blocked (private browsing, quota, browser policies).
const memory = new Map();
export function readText(key, fallback = null) {
  try { const value = localStorage.getItem(key); return value === null ? (memory.get(key) ?? fallback) : value; }
  catch { return memory.get(key) ?? fallback; }
}
export function writeText(key, value) {
  const text = String(value); memory.set(key, text);
  try { localStorage.setItem(key, text); return true; }
  catch { window.dispatchEvent(new CustomEvent('ba-storage-unavailable')); return false; }
}
export function readJSON(key, fallback) {
  try { const value = JSON.parse(readText(key, 'null')); return value ?? fallback; }
  catch { return fallback; }
}
export function writeJSON(key, value) { return writeText(key, JSON.stringify(value)); }
export function storageAvailable() {
  try { const key = '__ba_storage_check__'; localStorage.setItem(key, '1'); localStorage.removeItem(key); return true; }
  catch { return false; }
}
