const SAFE_PREFIXES = ['ba_','maze_best_','minesweeper_','sudoku_','matrix_','memory_matrix_','brainarena_'];
const SAFE_EXACT = new Set(['arena_lang','language']);
const MAX_KEYS = 300;
const MAX_VALUE = 500000;
const EXCLUDED_KEYS = new Set(['ba_auto_backups_v1','ba_local_profiles_v1','ba_active_local_profile_v1','ba_named_save_slots_v1','ba_release_rollback_v1']);
const EXCLUDED_PREFIXES = ['ba_local_profile_slot_'];

const allowedKey = key => { const value=String(key); return !EXCLUDED_KEYS.has(value) && !EXCLUDED_PREFIXES.some(prefix=>value.startsWith(prefix)) && (SAFE_EXACT.has(value) || SAFE_PREFIXES.some(prefix=>value.startsWith(prefix))); };
export const isBackupKeyAllowed = allowedKey;

export function createProgressBackup(storage = window.localStorage) {
  const data = {};
  for (let i=0;i<storage.length && Object.keys(data).length<MAX_KEYS;i+=1) {
    const key = storage.key(i);
    if (!key || !allowedKey(key)) continue;
    const value = storage.getItem(key);
    if (typeof value === 'string' && value.length <= MAX_VALUE) data[key] = value;
  }
  return { format:'brain-arena-backup',version:1,appVersion:'1.17.0',exportedAt:new Date().toISOString(),data };
}

export function validateProgressBackup(raw) {
  if (!raw || raw.format !== 'brain-arena-backup' || raw.version !== 1 || !raw.data || typeof raw.data !== 'object' || Array.isArray(raw.data)) throw new Error('invalid-backup');
  const entries = Object.entries(raw.data);
  if (entries.length > MAX_KEYS) throw new Error('too-many-keys');
  for (const [key,value] of entries) {
    if (!allowedKey(key) || typeof value !== 'string' || value.length > MAX_VALUE) throw new Error('invalid-entry');
  }
  return true;
}

export function importProgressBackup(raw, storage = window.localStorage, replace = false) {
  validateProgressBackup(raw);
  if (replace) {
    const toRemove=[];
    for (let i=0;i<storage.length;i+=1) { const key=storage.key(i); if (key && allowedKey(key)) toRemove.push(key); }
    toRemove.forEach(key=>storage.removeItem(key));
  }
  for (const [key,value] of Object.entries(raw.data)) storage.setItem(key,value);
  return Object.keys(raw.data).length;
}
