import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_GAME_PRESETS,makeCode,codeFeedback,makeLights,lightsMove,extendSequence,sequenceAnswer} from '../src/utils/newGameRules.js';
import {makeKakuro,kakuroValid,countKakuroSolutions,rotateKakuro} from '../src/utils/kakuro.js';
import {makeSlitherlink,slitherValid,countLoopSolutions,rotateSlitherlink,singleLoop,loopTopology} from '../src/utils/slitherlink.js';
import {mulberry32} from '../src/utils/competitive.js';
import {rotate180} from '../src/utils/universityGameplay.js';
for(const [level,config] of Object.entries(NEW_GAME_PRESETS.codebreaker))test(`Code Breaker ${level}: valid random codes and duplicate-aware feedback`,()=>{
 for(let seed=0;seed<40;seed++){const code=makeCode(config,mulberry32(seed));assert.equal(code.length,config.length);assert.ok([...code].every(c=>Number(c)<config.symbols));if(config.unique)assert.equal(new Set(code).size,config.length);assert.deepEqual(codeFeedback(code,code),{exact:config.length,misplaced:0});}
 assert.deepEqual(codeFeedback('1123','1214'),{exact:1,misplaced:2});assert.deepEqual(codeFeedback('1234','1111'),{exact:1,misplaced:0});assert.deepEqual(codeFeedback('0012','2000'),{exact:1,misplaced:2});
});
for(const [level,config] of Object.entries(NEW_GAME_PRESETS.lightsout))test(`Lights Out ${level}: every generated board has a known valid solution`,()=>{
 for(let seed=0;seed<30;seed++){const p=makeLights(config,mulberry32(seed));assert.ok(p.board.some(Boolean));let board=p.board;for(const index of p.solution)board=lightsMove(board,config.size,index);assert.ok(board.every(v=>!v));const rotated=rotate180(p.board);let solved=rotated;for(const index of p.solution)solved=lightsMove(solved,config.size,p.board.length-1-index);assert.ok(solved.every(v=>!v));}
});
for(const [level,config] of Object.entries(NEW_GAME_PRESETS.sequence))test(`Sequence Recall ${level}: bounded sequences and exact answer transforms`,()=>{
 let sequence=[];const random=mulberry32(18);for(let i=0;i<config.start+config.rounds-1;i++)sequence=extendSequence(sequence,config.symbols,random);
 assert.ok(sequence.every((v,i)=>v>=1&&v<=config.symbols&&(!i||v!==sequence[i-1])));assert.deepEqual(sequenceAnswer(sequence,config.symbols,'reverse-sequence'),[...sequence].reverse());assert.deepEqual(sequenceAnswer([config.symbols,1],config.symbols,'offset-sequence'),[1,2]);
});
for(const [level,config] of Object.entries(NEW_GAME_PRESETS.kakuro))test(`Kakuro ${level}: generated sums have exactly one solution, retained after rotation`,()=>{
 for(let seed=0;seed<12;seed++){
  const puzzle=makeKakuro(config,mulberry32(seed));assert.ok(kakuroValid(puzzle,puzzle.solution));const proof=countKakuroSolutions(puzzle);assert.equal(proof.exhausted,false);assert.equal(proof.count,1);
  assert.ok(puzzle.cells.some(c=>c.white&&!c.given));assert.ok(puzzle.runs.every(run=>run.cells.length>=2));
  const rotated=rotateKakuro(puzzle);assert.ok(kakuroValid(rotated,rotate180(puzzle.solution)));assert.deepEqual(rotateKakuro(rotated),puzzle);
  const wrong=[...puzzle.solution];wrong[puzzle.cells.findIndex(c=>c.white&&!c.given)]=0;assert.equal(kakuroValid(puzzle,wrong),false);
 }
});
for(const [level,config] of Object.entries(NEW_GAME_PRESETS.slitherlink))test(`Slitherlink ${level}: one unique loop, valid locked anchors and reversible geometry`,()=>{
 for(let seed=0;seed<12;seed++){
  const p=makeSlitherlink(config,mulberry32(seed));assert.ok(p.clues.every(c=>c===null||c>=0&&c<=3));assert.ok(slitherValid(p,p.solution));const proof=countLoopSolutions(p);assert.equal(proof.exhausted,false);assert.equal(proof.count,1);
  const rotated=rotateSlitherlink(p,p.solution);assert.ok(slitherValid(rotated.puzzle,rotated.marks));const back=rotateSlitherlink(rotated.puzzle,rotated.marks);assert.deepEqual(back.puzzle,p);assert.deepEqual(back.marks,p.solution);
  assert.equal(slitherValid(p,Array(p.solution.length).fill(0)),false);
 }
});
test('Slitherlink rejects multiple disconnected loops even when every vertex has degree two',()=>{
 const topology=loopTopology(3);const lines=topology.edges.map(([a,b])=>[0,1,4,5].includes(a)&&[0,1,4,5].includes(b)||[10,11,14,15].includes(a)&&[10,11,14,15].includes(b)?1:0);assert.equal(singleLoop(topology,lines),false);
});
