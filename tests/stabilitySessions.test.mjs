import {challengeOpeningIndex,createMinefield} from '../src/utils/minesweeper.js';
import {mulberry32,challengeSeed} from '../src/utils/competitive.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import React, {useState} from 'react';
import {create,act} from 'react-test-renderer';
import {useGameCheckpoint} from '../src/hooks/useGameCheckpoint.js';
import {encodeState,decodeState,registerCheckpoint,readGameCheckpoint,restoreGameCheckpoint,validCheckpoint,clearGameCheckpoint,gameChallengeOptions} from '../src/utils/gameCheckpoint.js';
import {resetSessionClock,setClockActivity,setClockSuspended,sessionDurationMs,addClockPenalty} from '../src/utils/sessionClock.js';
import {sessionRandom,activateSeededRandom,restoreNativeRandom,randomSnapshot,restoreRandomSnapshot,createChallengeCode,configuredChallengeCode,challengeConfiguration,validateChallengeCode} from '../src/utils/competitive.js';
import {initialGameOption} from '../src/utils/sessionRules.js';

test('active clock excludes pause, offline time and includes explicit penalties',()=>{
  const native=Date.now;let time=1000;Date.now=()=>time;
  try{
    resetSessionClock();setClockActivity(true);time+=2000;assert.equal(sessionDurationMs(),2000);
    setClockSuspended(true);time+=60000;assert.equal(sessionDurationMs(),2000);
    setClockSuspended(false);time+=3000;setClockActivity(false);time+=5000;assert.equal(sessionDurationMs(),5000);
    addClockPenalty(4000);assert.equal(sessionDurationMs(),9000);
    resetSessionClock({elapsedMs:5000,penaltyMs:4000});time+=90000;assert.equal(sessionDurationMs(),9000);
  }finally{Date.now=native;resetSessionClock();}
});
test('random generator resumes from saved state instead of repeating the opening',()=>{
  activateSeededRandom(createChallengeCode('maze','rng-checkpoint'));sessionRandom('maze');sessionRandom('maze');
  const saved=randomSnapshot();const expected=Array.from({length:12},()=>sessionRandom('maze'));
  restoreNativeRandom();assert.equal(restoreRandomSnapshot(saved),true);
  assert.deepEqual(Array.from({length:12},()=>sessionRandom('maze')),expected);restoreNativeRandom();
});
test('versioned challenge round-trips level, difficulty, generator rules and arithmetic options',()=>{
  const options={mode:'war_setup',difficulty:'hard',warPagesCount:7,practiceQuestionsCount:50,categories:{factorial:true,root:false}};
  const code=configuredChallengeCode(createChallengeCode('300','full-config'),'universitas','impossible',options);
  const config=challengeConfiguration(code);
  assert.deepEqual(config,{schoolLevel:'universitas',universityDifficulty:'impossible',rulesVersion:1,options});
  assert.equal(validateChallengeCode(code,'300').valid,true);
  assert.equal(validateChallengeCode(code,'maze').valid,false);
  assert.equal(validateChallengeCode(code.replace('-1-1-','-1-9-'),'300').valid,false);
  assert.equal(validateChallengeCode(code+'-BAD','300').valid,false);
  globalThis.localStorage={getItem:()=>JSON.stringify({challengeCodes:{'300':code}})};
  try{assert.equal(initialGameOption('300','warPagesCount',10),7);assert.deepEqual(initialGameOption('300','categories',{root:true,other:true}),{root:false,other:true});}finally{delete globalThis.localStorage;}
});
test('checkpoint JSON restores Sets, board position, inputs and rejects foreign/corrupt schemas',()=>{
  activateSeededRandom(createChallengeCode('maze','restore'));resetSessionClock({elapsedMs:1234});
  const state={maze:[1,2,3],position:2,visited:new Set([0,2]),moves:4};let restored;
  registerCheckpoint('maze',state,value=>{restored=value;},true,false);
  const snapshot=JSON.parse(JSON.stringify(readGameCheckpoint('maze')));
  assert.equal(validCheckpoint(snapshot,'maze'),true);
  registerCheckpoint('maze',{maze:[],position:0,visited:new Set()},value=>{restored=value;},false,false);
  assert.equal(restoreGameCheckpoint(snapshot,'maze'),true);
  assert.deepEqual(restored,state);assert.equal(sessionDurationMs(),1234);
  assert.equal(restoreGameCheckpoint(snapshot,'sudoku'),false);
  assert.equal(validCheckpoint({...snapshot,version:99},'maze'),false);
  assert.equal(validCheckpoint({...snapshot,state:{}},'maze'),false);
  clearGameCheckpoint('maze');assert.equal(readGameCheckpoint('maze'),null);restoreNativeRandom();
});
test('React checkpoint hook survives unmount/remount and restores a mid-game Nonogram board',async()=>{
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const start={level:'sd',uni:'hard',session:{state:'playing',puzzle:{size:5,cells:Array(25).fill(false)},marks:Array(25).fill(0),moves:0},elapsed:9,mode:'cross'};
  let update,current,root;
  function Harness(){const [state,setState]=useState(start);update=setState;current=state;useGameCheckpoint('nonogram',state,setState,state.session.state==='playing',state.session.state==='playing');return React.createElement('span',null,state.elapsed);}
  try{
    activateSeededRandom(createChallengeCode('nonogram','react-restore'));resetSessionClock();
    await act(async()=>{root=create(React.createElement(Harness));});
    await act(async()=>{update(previous=>({...previous,elapsed:17,session:{...previous.session,marks:previous.session.marks.map((v,i)=>i===4?2:v),moves:1}}));});
    const saved=JSON.parse(JSON.stringify(readGameCheckpoint('nonogram')));
    await act(async()=>{root.unmount();});
    await act(async()=>{root=create(React.createElement(Harness));});
    assert.equal(current.session.moves,0);
    await act(async()=>{assert.equal(restoreGameCheckpoint(saved,'nonogram'),true);});
    assert.equal(current.session.moves,1);assert.equal(current.session.marks[4],2);assert.equal(current.elapsed,17);assert.equal(current.mode,'cross');
  }finally{if(root)await act(async()=>root.unmount());restoreNativeRandom();resetSessionClock();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
test('transient animation retains the previous stable checkpoint instead of an unreplayable callback',()=>{
  activateSeededRandom(createChallengeCode('cube','stable'));resetSessionClock();
  const before={heights:[1,2],level:2,history:[],answerInput:'3',timer:12};let restored;
  registerCheckpoint('cube',before,value=>{restored=value;},true,true);
  registerCheckpoint('cube',{...before,feedback:'wrong'},value=>{restored=value;},false,false);
  const saved=readGameCheckpoint('cube');assert.equal(restoreGameCheckpoint(saved,'cube'),true);assert.deepEqual(restored,before);restoreNativeRandom();resetSessionClock();
});
test('checkpoint serialization does not mutate game state and options omit board answers',()=>{
  const state={selected:new Set([1]),nested:{marks:[0,1]}};assert.deepEqual(decodeState(encodeState(state)),state);
  registerCheckpoint('300',{mode:'war_setup',categories:{root:true},warPagesCount:3,pages:['secret'],userAnswers:{answer:2},difficulty:'hard',practiceQuestionsCount:10},()=>{},false,false);
  assert.deepEqual(gameChallengeOptions('300'),{difficulty:'hard',warPagesCount:3,practiceQuestionsCount:10,categories:{root:true},mode:'war_setup'});
});

test('seeded sessions leave Math.random alone and unrelated games cannot consume their sequence',()=>{
  const native=Math.random;const code=createChallengeCode('maze','isolated');activateSeededRandom(code);
  const a=[sessionRandom('maze'),sessionRandom('maze')];activateSeededRandom(code);
  assert.equal(Math.random,native);sessionRandom('prime');Math.random();
  assert.deepEqual([sessionRandom('maze'),sessionRandom('maze')],a);restoreNativeRandom();
});

test('versioned Minesweeper challenges use the same marked opening and mine layout',()=>{
  const code=configuredChallengeCode(createChallengeCode('minesweeper','opening'),'sd','hard');
  const index=challengeOpeningIndex(9,9,code);assert.equal(index,40);
  const a=createMinefield(9,9,10,index,mulberry32(challengeSeed(code)));
  Math.random();const b=createMinefield(9,9,10,index,mulberry32(challengeSeed(code)));
  assert.deepEqual(a,b);assert.equal(a[index].mine,false);
  assert.equal(challengeOpeningIndex(9,9,'BA-MINESWEEPER-ABCD'),null);
});
