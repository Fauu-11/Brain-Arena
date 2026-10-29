import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressBackup, importProgressBackup } from '../src/utils/backup.js';
function memory(entries) {
  const data = new Map(entries);
  return { get length() { return data.size; }, key: i => [...data.keys()][i] ?? null, getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k) };
}
test('backup export rejects an oversized key instead of silently losing it', () => {
  const original = 'x'.repeat(500001);
  const storage = memory([['ba_match_history_v1', original]]);
  assert.throws(() => createProgressBackup(storage), /backup-too-large/);
  assert.equal(storage.getItem('ba_match_history_v1'), original);
});
test('backup export rejects too many eligible keys instead of truncating progress', () => {
  const storage = memory(Array.from({ length: 301 }, (_, i) => [`ba_test_${i}`, String(i)]));
  assert.throws(() => createProgressBackup(storage), /backup-too-large/);
  assert.equal(storage.length, 301);
});
test('failed replace import restores existing values larger than export limit', () => {
  const original = 'x'.repeat(500001);
  const storage = memory([['ba_match_history_v1', original], ['ba_profile_v1', '{"xp":12}']]);
  const set = storage.setItem;
  let failOnce = true;
  storage.setItem = (k, v) => { if (k === 'ba_profile_v1' && failOnce) { failOnce = false; throw new Error('quota'); } return set(k, v); };
  assert.throws(() => importProgressBackup({ format: 'brain-arena-backup', version: 1, data: { ba_profile_v1: '{"xp":99}' } }, storage, true), /backup-import-rolled-back/);
  assert.equal(storage.getItem('ba_match_history_v1'), original);
  assert.equal(storage.getItem('ba_profile_v1'), '{"xp":12}');
});
test('failed merge import restores all pre-existing eligible keys, including beyond 300', () => {
  const storage = memory(Array.from({ length: 301 }, (_, i) => [`ba_test_${i}`, String(i)]));
  const set = storage.setItem;
  let failOnce = true;
  storage.setItem = (k, v) => { if (failOnce) { failOnce = false; throw new Error('quota'); } return set(k, v); };
  assert.throws(() => importProgressBackup({ format: 'brain-arena-backup', version: 1, data: { ba_test_0: 'new' } }, storage), /backup-import-rolled-back/);
  assert.equal(storage.length, 301);
  for (let i = 0; i < 301; i++) assert.equal(storage.getItem(`ba_test_${i}`), String(i));
});
