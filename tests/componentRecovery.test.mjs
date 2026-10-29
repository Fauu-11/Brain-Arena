import {createServer} from 'vite';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {create,act} from 'react-test-renderer';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
test('12 games across all six difficulty presets restore after remount', {timeout:60000}, async()=>{
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let viewport=390;
const noop=()=>{};const values=new Map();
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
globalThis.document={hidden:false,querySelector:()=>null,addEventListener:noop,removeEventListener:noop,body:{}};
globalThis.window={innerWidth:viewport,innerHeight:844,location:{hash:''},addEventListener:noop,removeEventListener:noop,matchMedia:query=>({matches:query.includes('max-width:800px')?viewport<=800:true,addEventListener:noop,removeEventListener:noop})};
globalThis.MutationObserver=class{observe(){}disconnect(){}};
let server,renderer;
try{
 server=await createServer({root,configFile:false,server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'test-contexts',enforce:'pre',load(id){if(id.endsWith('/context/ArenaContext.jsx'))return 'export const useArena=()=>globalThis.__arenaTesting;';if(id.endsWith('/context/LanguageContext.jsx'))return "export const useLanguage=()=>({lang:'id'});";}}]});
 const checkpoint=await server.ssrLoadModule('/src/utils/gameCheckpoint.js');
 const rng=await server.ssrLoadModule('/src/utils/competitive.js');
 const clock=await server.ssrLoadModule('/src/utils/sessionClock.js');
 globalThis.__arenaTesting={favorites:[],toggleFavorite:noop,competitionSetup:{mode:'practice'},adaptiveForGame:()=>null,setPlayMode:noop,ensureCompetitionSetup:noop,setChallengeCode:noop,regenerateChallengeCode:noop,setSessionSchoolLevel:noop,setSessionUniversityDifficulty:noop,personalBestFor:()=>0,setNotice:noop,recoverySession:null,resumeRequestedId:null,discardRecovery:noop,beginGameSession:gid=>{const base=rng.createChallengeCode(gid,'smoke');const code=gid==='minesweeper'?rng.configuredChallengeCode(base,'sd','hard'):base;globalThis.__arenaTesting.currentSession={gameId:gid,challengeCode:code};rng.activateSeededRandom(code);clock.resetSessionClock();checkpoint.clearGameCheckpoint(gid);return {};}};
 const games=[['300','Game300'],['prime','GamePrime'],['pixel','GamePixel'],['mnm','GameMnM'],['cube','GameCube'],['rps','GameRPS'],['sudoku','GameSudoku'],['minesweeper','GameMinesweeper'],['maze','GameMaze'],['matrix','GameMemoryMatrix'],['nonogram','GameNonogram'],['game2048','Game2048']];
 for(const [gid,name] of games){
 for(const preset of [{level:0},{level:1},{level:2},{level:3,difficulty:0},{level:3,difficulty:1},{level:3,difficulty:2}]){
  viewport=preset.level===0?320:preset.level===1?360:preset.level===2?390:[768,1024,1440][preset.difficulty];window.innerWidth=viewport;
  checkpoint.clearGameCheckpoint(gid);
  window.location.hash='#/'+({rps:'suwit','300':'aritmatika'}[gid]||gid);
  const {default:Game}=await server.ssrLoadModule(`/src/games/${name}.jsx`);
  await act(async()=>{renderer=create(React.createElement(Game,{onBack:noop,onNavigate:noop}));});
  assert.ok(renderer.root.findAll(n=>n.props.className?.includes?.('play-setup-card')).length,`${gid}: setup renders`);
  assert.equal(renderer.root.findByProps({className:'play-guide-panel'}).props.open,viewport>800,`${gid}: guide defaults match viewport`);
  await act(async()=>renderer.root.findByProps({className:'play-levels'}).findAllByType('button')[preset.level].props.onClick());
  if(preset.level===3){
    if(!renderer.root.findAllByProps({className:'play-university-difficulty'}).length){
      const next=renderer.root.findAll(n=>n.type==='button'&&n.props.className?.includes?.('uw-btn-primary'))[0];
      await act(async()=>next.props.onClick());
    }
    const selector=renderer.root.findAllByProps({className:'play-university-difficulty'})[0];assert.ok(selector,`${gid}: university selector available`);
    await act(async()=>selector.findAllByType('button')[preset.difficulty].props.onClick());
  }
  for(let attempt=0;attempt<3&&!checkpoint.readGameCheckpoint(gid);attempt++){
   const buttons=renderer.root.findAll(n=>n.type==='button'&&n.props.className?.includes?.('uw-btn-primary'));
   assert.ok(buttons.length,`${gid}: start button exists`);
   const capture=renderer.root.findAll(n=>n.props.className==='play-setup-actions')[0];
   await act(async()=>{capture?.props.onClickCapture?.({target:{closest:()=>true},stopPropagation:noop});buttons[0].props.onClick();});
   if(gid==='matrix')break;
  }
  if(gid==='matrix')for(let tick=0;tick<12&&!checkpoint.readGameCheckpoint(gid);tick++)await act(async()=>{await new Promise(resolve=>setTimeout(resolve,300));});
  if(gid==='minesweeper'){
    const cells=renderer.root.findAll(n=>n.type==='button'&&n.props['data-ms-cell']);
    const opening=cells.find(n=>n.props.className.includes('ms-challenge-start'));assert.ok(opening);
    await act(async()=>cells.find(n=>n!==opening).props.onClick());assert.equal(checkpoint.readGameCheckpoint(gid).state.hasStarted,false);
    await act(async()=>opening.props.onClick());assert.equal(checkpoint.readGameCheckpoint(gid).state.hasStarted,true);
  }
  const saved=JSON.parse(JSON.stringify(checkpoint.readGameCheckpoint(gid)));
  assert.ok(checkpoint.validCheckpoint(saved,gid),`${gid}: playable board has valid checkpoint`);
  await act(async()=>renderer.unmount());
  await act(async()=>{renderer=create(React.createElement(Game,{onBack:noop,onNavigate:noop}));});
  await act(async()=>{assert.ok(checkpoint.restoreGameCheckpoint(saved,gid));});
  const restored=checkpoint.readGameCheckpoint(gid);
  assert.deepEqual(restored.state,saved.state,`${gid}: state round trip`);
  await act(async()=>renderer.unmount());renderer=null;
  assert.equal(restored.gameId,gid);
 }
 }
}finally{if(renderer)await act(async()=>renderer.unmount());await server?.close();}

});
