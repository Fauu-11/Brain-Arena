export function sampleMemoryCells(total, count, rng = Math.random) {
  if (!Number.isInteger(total) || total < 1 || total > 4096) throw new RangeError('total must be an integer between 1 and 4096.');
  if (!Number.isInteger(count) || count < 1 || count > total) throw new RangeError('count must be between 1 and total.');
  if (typeof rng !== 'function') throw new TypeError('rng must be a function.');
  const pool = Array.from({ length: total }, (_, index) => index);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const raw = Number(rng());
    const normalized = Number.isFinite(raw) ? Math.max(0, Math.min(0.999999999, raw)) : 0;
    const j = Math.floor(normalized * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function memoryRoundTarget(startTargets, round, totalCells, growth = 1) {
  const start = Math.max(1, Math.floor(startTargets));
  const currentRound = Math.max(1, Math.floor(round));
  const increment = Math.max(0, Math.floor(growth));
  return Math.min(totalCells, start + (currentRound - 1) * increment);
}
