import { createProgressBackup, importProgressBackup } from './backup.js';

export const AUTO_BACKUP_KEY = 'ba_auto_backups_v1';
export const MAX_AUTO_BACKUPS = 5;
export const AUTO_BACKUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

function readList(storage) {
  try {
    const raw = JSON.parse(storage.getItem(AUTO_BACKUP_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(item => item && item.id && item.payload?.format === 'brain-arena-backup').slice(0, MAX_AUTO_BACKUPS) : [];
  } catch {
    return [];
  }
}

function writeList(storage, list) {
  storage.setItem(AUTO_BACKUP_KEY, JSON.stringify(list.slice(0, MAX_AUTO_BACKUPS)));
  return list.slice(0, MAX_AUTO_BACKUPS);
}

function backupSummary(payload) {
  const parse = key => {
    try { return JSON.parse(payload.data?.[key] || 'null'); } catch { return null; }
  };
  const profile = parse('ba_profile_v1') || {};
  const matches = parse('ba_match_history_v1') || [];
  const season = parse('ba_season_v1') || {};
  return {
    xp: Math.max(0, Number(profile.xp) || 0),
    rankedPoints: Math.max(0, Number(profile.rankedPoints) || 0),
    completions: Math.max(0, Number(profile.completions) || 0),
    matches: Array.isArray(matches) ? matches.length : 0,
    seasonXp: Math.max(0, Number(season.xp) || 0),
  };
}

export function listAutomaticBackups(storage = window.localStorage) {
  return readList(storage);
}

export function createAutomaticBackup(reason = 'auto', storage = window.localStorage, now = Date.now()) {
  const payload = createProgressBackup(storage);
  if (payload.data) delete payload.data[AUTO_BACKUP_KEY];
  const entry = {
    id: `backup-${now.toString(36)}`,
    createdAt: now,
    reason,
    summary: backupSummary(payload),
    payload,
  };
  const previous = readList(storage).filter(item => item.id !== entry.id);
  writeList(storage, [entry, ...previous]);
  return entry;
}

export function automaticBackupDue(storage = window.localStorage, now = Date.now()) {
  const latest = readList(storage)[0];
  return !latest || now - Number(latest.createdAt || 0) >= AUTO_BACKUP_INTERVAL_MS;
}

export function restoreAutomaticBackup(id, storage = window.localStorage) {
  const entry = readList(storage).find(item => item.id === id);
  if (!entry) throw new Error('backup-not-found');
  return importProgressBackup(entry.payload, storage, true);
}

export function deleteAutomaticBackup(id, storage = window.localStorage) {
  const next = readList(storage).filter(item => item.id !== id);
  writeList(storage, next);
  return next;
}
