import test from 'node:test';
import assert from 'node:assert/strict';
import { initialGameSetting, cubeResult, belongsToStage } from '../src/utils/sessionRules.js';
import { performanceForRun, rankedDeltaFor } from '../src/utils/competitive.js';
test('launcher level and difficulty hydrate only valid saved choices',()=>{
  globalThis.localStorage={getItem:()=>JSON.stringify({schoolLevels:{cube:'universitas',maze:'invalid'},universityDifficulties:{cube:'impossible'}})};
  try {
    assert.equal(initialGameSetting('cube','schoolLevels','sma'),'universitas');
    assert.equal(initialGameSetting('cube','universityDifficulties','hard'),'impossible');
    assert.equal(initialGameSetting('maze','schoolLevels','sd'),'sd');
  } finally {delete globalThis.localStorage;}
});
test('cube session completion requires at least three correct answers',()=>{
  for(let correct=0;correct<=5;correct++) {
    const result=cubeResult(correct);
    assert.equal(result.outcome,correct>=3?'completed':'loss');
    assert.equal(result.accuracy,correct/5);
    const performance=performanceForRun({...result,durationMs:1000});
    if(correct===0) assert.equal(rankedDeltaFor({...result,grade:performance.grade}),-12);
    if(correct===3) assert.ok(performance.score<=60);
  }
});
test('practice and unrelated sessions cannot advance an active competition',()=>{
  const cup={id:'cup-1',status:'active',mode:'ranked',index:0,stages:[{gameId:'cube',challengeCode:'BA-CUBE-ABCD'}]};
  const session={arenaCupId:'cup-1',gameId:'cube',challengeCode:'BA-CUBE-ABCD',mode:'ranked'};
  assert.equal(belongsToStage(session,cup,'arenaCupId'),true);
  for(const change of [{mode:'practice'},{arenaCupId:null},{gameId:'maze'},{challengeCode:'BA-CUBE-OTHER'}]) assert.equal(belongsToStage({...session,...change},cup,'arenaCupId'),false);
  assert.equal(belongsToStage(session,{...cup,status:'champion'},'arenaCupId'),false);
  const custom={...cup,stages:[{...cup.stages[0],schoolLevel:'universitas',universityDifficulty:'impossible'}]};
  assert.equal(belongsToStage({...session,schoolLevel:'sd'},custom,'arenaCupId'),false);
  assert.equal(belongsToStage({...session,schoolLevel:'universitas',universityDifficulty:'impossible'},custom,'arenaCupId'),true);
});
