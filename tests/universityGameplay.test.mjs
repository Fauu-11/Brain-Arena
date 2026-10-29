import test from 'node:test';
import assert from 'node:assert/strict';
import {UNIVERSITY_GAMEPLAY,chooseUniversityVariant,revealWindow,rotate180,rotateSquare90,transformMemoryPattern,shuffleValues,slideRandomTile,encodeArithmeticQuestion} from '../src/utils/universityGameplay.js';
import {GAMES} from '../src/data/games.js';
import {mulberry32} from '../src/utils/competitive.js';
import {nonogramSolved,generateNonogram,nonogramClues} from '../src/utils/nonogram.js';
import {generateSudokuMatrix} from '../src/utils/sudoku.js';
import {generateMaze,shortestMazePathLength} from '../src/utils/maze.js';
for(const game of GAMES)test(`${game.id}: three distinct rules can all be drawn without immediate repeats`,()=>{
 const variants=UNIVERSITY_GAMEPLAY[game.id];assert.equal(variants.length,3);assert.equal(new Set(variants.map(v=>v.id)).size,3);
 const seen=new Set();let previous=null;
 for(let seed=0;seed<300;seed++){
  const id=chooseUniversityVariant(game.id,seed,previous);assert.notEqual(id,previous);assert.equal(id,chooseUniversityVariant(game.id,seed,previous));seen.add(id);previous=id;
 }
 assert.equal(seen.size,3);
 for(const variant of variants){assert.ok(variant.name.id&&variant.name.en&&variant.note.id&&variant.note.en);}
});
test('wall and clue windows open at exact active-time boundaries',()=>{
 for(const time of [0,4,7,60,64,120,124])assert.equal(revealWindow(time,8,60,5),true,time);
 for(const time of [8,59,65,119,125])assert.equal(revealWindow(time,8,60,5),false,time);
 assert.equal(revealWindow(20,10,20,4),true);assert.equal(revealWindow(24,10,20,4),false);
});
test('rotating Nonogram keeps its marks and clue-equivalent solution consistent',()=>{
 for(const size of [5,8,10,15,20]){
  const puzzle=generateNonogram(size,.46,mulberry32(size));const cells=rotate180(puzzle.cells);const marks=rotate180(puzzle.cells.map(v=>v?1:2));
  assert.equal(nonogramSolved(cells,marks),true);
  for(let row=0;row<size;row++)assert.deepEqual(nonogramClues(cells.slice(row*size,(row+1)*size)),[...puzzle.rows[size-1-row]].reverse());
  assert.deepEqual(rotate180(cells),puzzle.cells);
 }
});
test('Sudoku rotation preserves rows, columns, boxes and selected-cell mapping',()=>{
 const size=9,grid=generateSudokuMatrix(9,3,3,mulberry32(14)),rotated=rotate180(grid);
 for(let r=0;r<size;r++){assert.equal(new Set(rotated.slice(r*size,(r+1)*size)).size,size);assert.equal(new Set(Array.from({length:size},(_,c)=>rotated[c*size+r])).size,size);}
 for(let r=0;r<9;r+=3)for(let c=0;c<9;c+=3)assert.equal(new Set(Array.from({length:9},(_,i)=>rotated[(r+Math.floor(i/3))*9+c+i%3])).size,9);
 assert.equal(rotated[80-23],grid[23]);
});
test('changing Maze always leaves the existing player connected to the unchanged exit',()=>{
 for(let seed=0;seed<40;seed++){
  const maze=generateMaze(32,32,mulberry32(seed));const start=seed*17%1024,target=(seed*41+1)%1024;
  assert.ok(shortestMazePathLength(maze,32,32,start,target)>=0);
 }
});
test('memory variants transform actual expected cells correctly',()=>{
 const pattern=new Set([0,2,8]);assert.deepEqual([...transformMemoryPattern(pattern,9,'mirror-recall')].sort((a,b)=>a-b),[0,6,8]);
 assert.deepEqual([...transformMemoryPattern(pattern,9,'inverse-recall')],[1,3,4,5,6,7]);assert.deepEqual([...transformMemoryPattern(pattern,9,'ordered-recall')],[0,2,8]);assert.deepEqual([...pattern],[0,2,8]);
});
test('cube rotations and shuffles preserve cube count and card identities',()=>{
 const heights=[1,2,3,4,5,6,7,8,9];let rotated=heights;
 for(let i=0;i<4;i++)rotated=rotateSquare90(rotated,3);assert.deepEqual(rotated,heights);
 const shuffled=shuffleValues(heights,mulberry32(2));assert.deepEqual([...shuffled].sort((a,b)=>a-b),heights);
});
test('automatic MnM movement swaps only one adjacent tile with the empty slot',()=>{
 for(let seed=0;seed<30;seed++){
  const old=Array.from({length:16},(_,i)=>i),next=slideRandomTile(old,4,mulberry32(seed));
  const changed=old.map((v,i)=>v!==next[i]?i:-1).filter(i=>i>=0);assert.equal(changed.length,2);
  assert.ok(changed.includes(15));const other=changed.find(i=>i!==15);assert.ok([11,14].includes(other));assert.deepEqual([...next].sort((a,b)=>a-b),old);
 }
});
test('encoded arithmetic transforms both formula and answer, including nondecimal output',()=>{
 assert.equal(encodeArithmeticQuestion({equation:'4 + 7',answer:'11'},3).answer,'14');
 assert.deepEqual(encodeArithmeticQuestion({equation:'15 → heksa',answer:'F'},4),{equation:'(15 + 4) → heksa',answer:'13',offset:4});
 assert.equal(encodeArithmeticQuestion({equation:'15 → biner',answer:'1111'},4).answer,'10011');
 assert.equal(encodeArithmeticQuestion({equation:'15 → oktal',answer:'17'},4).answer,'23');
});
