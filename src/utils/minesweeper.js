export function getNeighbors(index, rows, cols) {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const out = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
    }
  }
  return out;
}

function shuffled(values, rng) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createMinefield(rows, cols, mineCount, safeIndex, rng = Math.random) {
  const total = rows * cols;
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) throw new Error('Invalid board size');
  if (!Number.isInteger(mineCount) || mineCount < 0 || mineCount >= total) throw new Error('Invalid mine count');
  if (!Number.isInteger(safeIndex) || safeIndex < 0 || safeIndex >= total) throw new Error('Invalid safe index');

  // Prefer a 3x3 safe opening. On very dense custom boards, fall back to only
  // protecting the clicked cell so the requested mine count still fits.
  let protectedCells = new Set([safeIndex, ...getNeighbors(safeIndex, rows, cols)]);
  let candidates = Array.from({ length: total }, (_, i) => i).filter(i => !protectedCells.has(i));
  if (candidates.length < mineCount) {
    protectedCells = new Set([safeIndex]);
    candidates = Array.from({ length: total }, (_, i) => i).filter(i => !protectedCells.has(i));
  }

  const mines = new Set(shuffled(candidates, rng).slice(0, mineCount));
  return Array.from({ length: total }, (_, index) => ({
    mine: mines.has(index),
    adjacent: mines.has(index) ? 0 : getNeighbors(index, rows, cols).reduce((sum, n) => sum + (mines.has(n) ? 1 : 0), 0),
  }));
}

export function revealArea(board, rows, cols, startIndex, revealed = new Set(), flags = new Set()) {
  const next = new Set(revealed);
  if (!board[startIndex] || flags.has(startIndex) || next.has(startIndex)) return next;
  if (board[startIndex].mine) {
    next.add(startIndex);
    return next;
  }

  const queue = [startIndex];
  const queued = new Set(queue);
  while (queue.length) {
    const index = queue.shift();
    if (flags.has(index) || next.has(index) || board[index].mine) continue;
    next.add(index);
    if (board[index].adjacent !== 0) continue;
    for (const neighbor of getNeighbors(index, rows, cols)) {
      if (!queued.has(neighbor) && !next.has(neighbor) && !flags.has(neighbor) && !board[neighbor].mine) {
        queued.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return next;
}

export function chordReveal(board, rows, cols, index, revealed = new Set(), flags = new Set()) {
  const cell = board[index];
  if (!cell || !revealed.has(index) || cell.mine || cell.adjacent <= 0) return new Set(revealed);
  const neighbors = getNeighbors(index, rows, cols);
  const adjacentFlags = neighbors.reduce((sum, n) => sum + (flags.has(n) ? 1 : 0), 0);
  if (adjacentFlags !== cell.adjacent) return new Set(revealed);
  let next = new Set(revealed);
  for (const neighbor of neighbors) {
    if (!flags.has(neighbor)) next = revealArea(board, rows, cols, neighbor, next, flags);
  }
  return next;
}

export function formatMinesweeperTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
