import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleMemoryCells, memoryRoundTarget } from '../src/utils/memoryMatrix.js';

function seeded(seed = 1234) { return () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; }; }

test('memory patterns contain unique valid cell indexes', () => {
  for (const [total, count] of [[9,3],[16,6],[25,9],[36,12],[49,16],[64,28]]) {
    const cells = sampleMemoryCells(total, count, seeded(total + count));
    assert.equal(cells.length, count);
    assert.equal(new Set(cells).size, count);
    assert.ok(cells.every(index => index >= 0 && index < total));
  }
});

test('round target grows predictably and is capped to the matrix', () => {
  assert.equal(memoryRoundTarget(3,1,9,1),3);
  assert.equal(memoryRoundTarget(3,5,9,1),7);
  assert.equal(memoryRoundTarget(12,9,64,2),28);
  assert.equal(memoryRoundTarget(60,10,64,3),64);
});

test('invalid memory pattern requests fail explicitly', () => {
  assert.throws(() => sampleMemoryCells(0,1), RangeError);
  assert.throws(() => sampleMemoryCells(9,10), RangeError);
  assert.throws(() => sampleMemoryCells(9,0), RangeError);
});
