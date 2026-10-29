import test from 'node:test';
import assert from 'node:assert/strict';
import {generateNonogram,nonogramClues,nonogramSolved} from '../src/utils/nonogram.js';
import {addRandomTile,canMove2048,create2048,move2048} from '../src/utils/game2048.js';
import {generateSudokuMatrix} from '../src/utils/sudoku.js';
import {mulberry32} from '../src/utils/competitive.js';
test('Nonogram clues and solved-state support clue-equivalent solutions', () => {
  assert.deepEqual(nonogramClues([true,true,false,true]),[2,1]);
  assert.deepEqual(nonogramClues([false,false]),[0]);
  let seed=7; const random=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const puzzle=generateNonogram(5,.4,random);
  assert.equal(puzzle.cells.length,25);
  assert.equal(puzzle.rows.length,5);
  assert.equal(puzzle.cols.length,5);
  const exact=puzzle.cells.map(v=>v?1:2);
  assert.equal(nonogramSolved(puzzle.cells,exact),true);
  const empty=Array(25).fill(0);
  assert.equal(nonogramSolved(puzzle.cells,empty),false);
});

test('2048 move engine merges correctly and detects locked boards', () => {
  const board=[2,2,4,4, 0,0,0,0, 2,2,2,0, 0,0,0,0];
  const left=move2048(board,'left');
  assert.equal(left.moved,true);
  assert.deepEqual(left.board.slice(0,4),[4,8,0,0]);
  assert.deepEqual(left.board.slice(8,12),[4,2,0,0]);
  assert.equal(left.score,16);
  const locked=[2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2];
  assert.equal(canMove2048(locked),false);
  const seeded=()=>0;
  const created=create2048(seeded);
  assert.equal(created.filter(Boolean).length,2);
  const added=addRandomTile(Array(16).fill(0),seeded);
  assert.equal(added.filter(Boolean).length,1);
});


test('Sudoku solutions remain valid for all supported box shapes',()=>{
 for(const [size,boxRows,boxCols] of [[4,2,2],[6,2,3],[9,3,3]])for(let seed=0;seed<30;seed++){
  const grid=generateSudokuMatrix(size,boxRows,boxCols,mulberry32(seed));
  for(let row=0;row<size;row++)assert.equal(new Set(grid.slice(row*size,(row+1)*size)).size,size);
  for(let col=0;col<size;col++)assert.equal(new Set(Array.from({length:size},(_,row)=>grid[row*size+col])).size,size);
  for(let row=0;row<size;row+=boxRows)for(let col=0;col<size;col+=boxCols){const values=[];for(let dr=0;dr<boxRows;dr++)for(let dc=0;dc<boxCols;dc++)values.push(grid[(row+dr)*size+col+dc]);assert.equal(new Set(values).size,size);}
 }
});
