import {shuffleValues} from './universityGameplay.js';
const sum=a=>a.reduce((s,n)=>s+n,0);
export function kakuroCandidates(puzzle,values,index){
 if(!puzzle.cells[index]?.white)return [];
 const groups=puzzle.runs.filter(run=>run.cells.includes(index));
 return Array.from({length:9},(_,i)=>i+1).filter(value=>groups.every(run=>{
  const filled=run.cells.filter(i=>i!==index&&values[i]).map(i=>Number(values[i]));if(filled.includes(value))return false;
  const remaining=run.cells.length-filled.length-1,target=run.sum-sum(filled)-value;
  const available=Array.from({length:9},(_,i)=>i+1).filter(n=>n!==value&&!filled.includes(n));
  if(remaining===0)return target===0;
  return remaining<=available.length&&sum(available.slice(0,remaining))<=target&&target<=sum(available.slice(-remaining));
 }));
}
export function kakuroValid(puzzle,values){return puzzle.cells.every((cell,i)=>!cell.white||(Number.isInteger(Number(values[i]))&&Number(values[i])>=1&&Number(values[i])<=9&&(!cell.given||Number(values[i])===cell.given)))&&puzzle.runs.every(run=>{const digits=run.cells.map(i=>Number(values[i]));return new Set(digits).size===digits.length&&sum(digits)===run.sum;});}
export function countKakuroSolutions(puzzle,limit=2,budget=12000){
 const values=puzzle.cells.map(cell=>cell.white?cell.given||0:0);let count=0,nodes=0,exhausted=false;
 function search(){if(count>=limit||exhausted)return;if(++nodes>budget){exhausted=true;return;}let selected=-1,options=null;
  for(let i=0;i<values.length;i++)if(puzzle.cells[i].white&&!values[i]){const candidates=kakuroCandidates(puzzle,values,i);if(!candidates.length)return;if(!options||candidates.length<options.length){selected=i;options=candidates;if(options.length===1)break;}}
  if(selected<0){if(kakuroValid(puzzle,values))count++;return;}
  for(const digit of options){values[selected]=digit;search();values[selected]=0;if(count>=limit||exhausted)break;}
 }
 search();return {count,exhausted,nodes};
}
export function makeKakuro(config,random){
 const size=1+config.blocks.reduce((s,n)=>s+n+1,0)-1;
 const cells=Array.from({length:size*size},()=>({white:false,clues:[]})),solution=Array(size*size).fill(0),runs=[];
 let rowStart=1;
 for(const height of config.blocks){let colStart=1;for(const width of config.blocks){
  const digits=shuffleValues([1,2,3,4,5,6,7,8,9],random),rowOffsets=shuffleValues(Array.from({length:height},(_,i)=>i),random),colOffsets=shuffleValues(Array.from({length:width},(_,i)=>i),random);
  const blockIndices=[];
  for(let r=0;r<height;r++)for(let c=0;c<width;c++){const index=(rowStart+r)*size+colStart+c;cells[index]={white:true,given:0,clues:[]};solution[index]=digits[(rowOffsets[r]+colOffsets[c])%9];blockIndices.push(index);}
  const blockRuns=[];
  for(let r=0;r<height;r++){const indices=Array.from({length:width},(_,c)=>(rowStart+r)*size+colStart+c);const run={cells:indices,sum:sum(indices.map(i=>solution[i]))};runs.push(run);blockRuns.push(run);cells[(rowStart+r)*size+colStart-1].clues.push({dir:'right',sum:run.sum});}
  for(let c=0;c<width;c++){const indices=Array.from({length:height},(_,r)=>(rowStart+r)*size+colStart+c);const run={cells:indices,sum:sum(indices.map(i=>solution[i]))};runs.push(run);blockRuns.push(run);cells[(rowStart-1)*size+colStart+c].clues.push({dir:'down',sum:run.sum});}
  // Solve each independent crossing region before accepting it. Add givens only
  // while uniqueness is unproved; a bounded search keeps generation responsive.
  const order=shuffleValues(blockIndices,random);let added=0;
  const localCells=cells.map((cell,i)=>blockIndices.includes(i)?cell:{white:false,clues:[]});
  while(added<order.length){const proof=countKakuroSolutions({cells:localCells,runs:blockRuns},2,5000);if(proof.count===1&&!proof.exhausted&&added>=Math.floor(order.length*config.givenRatio))break;const i=order[added++];cells[i].given=solution[i];}
  colStart+=width+1;
 }rowStart+=height+1;}
 return {size,cells,runs,solution};
}
export function rotateKakuro(puzzle){const count=puzzle.cells.length,opposite={right:'left',left:'right',down:'up',up:'down'};return {...puzzle,cells:[...puzzle.cells].reverse().map(cell=>({...cell,clues:(cell.clues||[]).map(clue=>({...clue,dir:opposite[clue.dir]}))})),solution:[...puzzle.solution].reverse(),runs:puzzle.runs.map(run=>({...run,cells:run.cells.map(i=>count-1-i)}))};}
