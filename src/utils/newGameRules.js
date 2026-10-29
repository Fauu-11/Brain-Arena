import {shuffleValues} from './universityGameplay.js';
export const NEW_GAME_IDS=['codebreaker','lightsout','sequence','kakuro','slitherlink'];
export const NEW_GAME_PRESETS={
 codebreaker:{sd:{length:3,symbols:4,attempts:12,unique:true},smp:{length:4,symbols:6,attempts:12,unique:true},sma:{length:4,symbols:8,attempts:12},'sma-plus':{length:5,symbols:9,attempts:12},universitas:{length:6,symbols:10,attempts:12}},
 lightsout:{sd:{size:3,presses:4},smp:{size:4,presses:8},sma:{size:5,presses:12},'sma-plus':{size:5,presses:18},universitas:{size:6,presses:26}},
 sequence:{sd:{symbols:4,start:3,rounds:4,beat:850},smp:{symbols:6,start:4,rounds:5,beat:750},sma:{symbols:8,start:5,rounds:6,beat:650},'sma-plus':{symbols:9,start:6,rounds:7,beat:550},universitas:{symbols:10,start:7,rounds:8,beat:450}},
 kakuro:{sd:{blocks:[2],givenRatio:.5},smp:{blocks:[3],givenRatio:.2},sma:{blocks:[2,2],givenRatio:0},'sma-plus':{blocks:[3,3],givenRatio:0},universitas:{blocks:[4,4],givenRatio:0}},
 slitherlink:{sd:{size:3,anchorRatio:.2,hiddenRatio:0},smp:{size:4,anchorRatio:.1,hiddenRatio:.1},sma:{size:5,anchorRatio:0,hiddenRatio:.2},'sma-plus':{size:6,anchorRatio:0,hiddenRatio:.3},universitas:{size:7,anchorRatio:0,hiddenRatio:.4}},
};
export function makeCode(config,random,unique=config.unique){const pool=Array.from({length:config.symbols},(_,i)=>String(i));return unique?shuffleValues(pool,random).slice(0,config.length).join(''):Array.from({length:config.length},()=>pool[Math.floor(random()*pool.length)]).join('');}
export function codeFeedback(code,guess){let exact=0;const left={},right={};for(let i=0;i<code.length;i++){if(code[i]===guess[i])exact++;else{left[code[i]]=(left[code[i]]||0)+1;right[guess[i]]=(right[guess[i]]||0)+1;}}const misplaced=Object.keys(left).reduce((sum,k)=>sum+Math.min(left[k],right[k]||0),0);return {exact,misplaced};}
export function lightsMove(board,size,index){const next=[...board];const r=Math.floor(index/size),c=index%size;for(const [rr,cc] of [[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]])if(rr>=0&&rr<size&&cc>=0&&cc<size)next[rr*size+cc]=!next[rr*size+cc];return next;}
export function makeLights(config,random){const solution=shuffleValues(Array.from({length:config.size**2},(_,i)=>i),random).slice(0,config.presses);let board=Array(config.size**2).fill(false);for(const index of solution)board=lightsMove(board,config.size,index);if(!board.some(Boolean)){board=lightsMove(board,config.size,0);const at=solution.indexOf(0);if(at<0)solution.push(0);else solution.splice(at,1);}return {board,solution};}
export function extendSequence(sequence,symbols,random){let value=1+Math.floor(random()*(symbols-(sequence.length?1:0)));if(sequence.length&&value>=sequence.at(-1))value++;return [...sequence,value];}
export function sequenceAnswer(sequence,symbols,variant){if(variant==='reverse-sequence')return [...sequence].reverse();if(variant==='offset-sequence')return sequence.map(n=>n%symbols+1);return [...sequence];}
