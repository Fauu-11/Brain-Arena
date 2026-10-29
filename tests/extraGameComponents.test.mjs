import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import React from 'react';import {act,create} from 'react-test-renderer';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';
test('five new games support every level, all 15 Universitas rules and complete playable win paths',{timeout:60000},async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;const root=fileURLToPath(new URL('../',import.meta.url)),noop=()=>{},storage=new Map(),queue=new Map();let timerId=-10000,renderer,serial=0;
 const clear=globalThis.clearTimeout;globalThis.clearTimeout=id=>queue.has(id)?queue.delete(id):clear(id);
 globalThis.__extraTimers={schedule:cb=>{const id=--timerId;queue.set(id,cb);return id;}};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 globalThis.document={hidden:false,querySelector:()=>null,addEventListener:noop,removeEventListener:noop,body:{}};globalThis.window={innerWidth:360,innerHeight:800,location:{hash:''},addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop})};globalThis.MutationObserver=class{observe(){}disconnect(){}};
 const hooks=fs.readFileSync(`${root}src/hooks/useUniversityGameplay.js`,'utf8'),clockSource=fs.readFileSync(`${root}src/utils/sessionClock.js`,'utf8');
 const server=await createServer({root,configFile:false,server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'extra-game-fixtures',enforce:'pre',load(id){if(id.endsWith('/context/ArenaContext.jsx'))return 'export const useArena=()=>globalThis.__extraArena;';if(id.endsWith('/context/LanguageContext.jsx'))return "export const useLanguage=()=>({lang:'id'});";if(id.endsWith('/hooks/useUniversityGameplay.js'))return "import {useEffect,useRef} from 'react';export const useUniversityGameplay=()=>globalThis.__extraMode;\n"+hooks.slice(hooks.indexOf('// Delay'));if(id.endsWith('/utils/sessionClock.js'))return clockSource.slice(0,clockSource.indexOf('export function gameTimeout'))+'export function gameTimeout(callback){return globalThis.__extraTimers.schedule(callback);}';}}]});
 try{
  const games=await server.ssrLoadModule('/src/games/ExtraGames.jsx'),engine=await server.ssrLoadModule('/src/utils/universityGameplay.js'),cp=await server.ssrLoadModule('/src/utils/gameCheckpoint.js'),rng=await server.ssrLoadModule('/src/utils/competitive.js');
  const rules=await server.ssrLoadModule('/src/utils/newGameRules.js');
  const names={codebreaker:'GameCodeBreaker',lightsout:'GameLightsOut',sequence:'GameSequenceRecall',kakuro:'GameKakuro',slitherlink:'GameSlitherlink'};
  for(const [id,name] of Object.entries(names))for(const option of [...['sd','smp','sma','sma-plus'].map(level=>({level,variant:null})),...engine.UNIVERSITY_GAMEPLAY[id].map(variant=>({level:'universitas',variant}))]){
   const {level,variant}=option;storage.set('ba_game_settings_v2',JSON.stringify({[id]:level}));window.location.hash=`#/${id}`;queue.clear();cp.clearGameCheckpoint(id);
   globalThis.__extraMode={id:variant?.id,variant,sessionId:`test-${++serial}`,seconds:0,active:!!variant,failed:false,fail:noop};
   globalThis.__extraArena={currentSession:null,setNotice:noop,setSessionSchoolLevel:noop,recordGameCompletion:noop,beginGameSession:()=>{const code=rng.configuredChallengeCode(rng.createChallengeCode(id,`${level}-${variant?.id}`),level,'impossible');rng.activateSeededRandom(code);engine.setUniversityVariant(id,variant?.id);globalThis.__extraArena.currentSession={gameId:id,schoolLevel:level,active:true,challengeCode:code};}};
   globalThis.__extraArena.prepareFreshSession=()=>globalThis.__extraArena.beginGameSession();
   const Game=games[name],repaint=async()=>act(async()=>renderer.update(React.createElement(Game,{onBack:noop,onNavigate:noop,testTick:Math.random()})));
   const seconds=async n=>{globalThis.__extraMode={...globalThis.__extraMode,seconds:n};await repaint();};
   const data=()=>cp.readGameCheckpoint(id)?.state.data;
   await act(async()=>{renderer=create(React.createElement(Game,{onBack:noop,onNavigate:noop}));});
   assert.equal(renderer.root.findByProps({className:'play-levels simple-levels'}).findAllByType('button').length,5);
   await act(async()=>{renderer.root.findByProps({className:'play-setup-actions'}).props.onClickCapture({target:{closest:()=>true}});renderer.root.findAll(n=>n.type==='button'&&n.props.className==='uw-btn uw-btn-primary')[0].props.onClick();});
   assert.ok(cp.validCheckpoint(cp.readGameCheckpoint(id),id),`${id} ${level}: valid board`);
   if(variant)assert.ok(renderer.root.findAllByProps({'data-university-variant':variant.id}).length);
   if(id==='codebreaker'){
    if(variant?.id==='unique-code')assert.equal(new Set(data().secret).size,6);
    if(variant?.id==='limited-guesses'){
     assert.equal(data().attempts,7);const wrong=data().secret.split('').map(c=>String((Number(c)+1)%10)).join('');
     for(let i=0;i<7;i++){await act(async()=>renderer.root.findByProps({id:'code-guess'}).props.onChange({target:{value:wrong}}));await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault:noop}));}
     assert.ok(JSON.stringify(renderer.toJSON()).includes('Tantangan berakhir.'));
     await act(async()=>renderer.root.findAll(n=>n.type==='button'&&n.children.includes('Main lagi'))[0].props.onClick());assert.equal(data().history.length,0);
    }
    if(variant?.id==='fading-feedback'){
     let wrong=data().secret.split('').map(c=>String((Number(c)+1)%10)).join('');
     await act(async()=>renderer.root.findByProps({id:'code-guess'}).props.onChange({target:{value:wrong}}));await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault:noop}));await seconds(5);assert.ok(JSON.stringify(renderer.toJSON()).includes('Petunjuk disembunyikan'));
    }
    const secret=data().secret;await act(async()=>renderer.root.findByProps({id:'code-guess'}).props.onChange({target:{value:secret}}));await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault:noop}));
   }
   if(id==='lightsout'){
    if(variant?.id==='rotating-lights'){const before=[...data().board];await seconds(20);assert.deepEqual(data().board,[...before].reverse());}
    if(variant?.id==='alternating-lights'){const before=data().moves;await act(async()=>renderer.root.findAll(n=>n.type==='button'&&n.props['data-light']!==undefined&&n.props.disabled)[0].props.onClick());assert.equal(data().moves,before);}
    const solution=[...data().solution];for(const index of solution){let button=renderer.root.findByProps({'data-light':index});if(button.props.disabled){await seconds(globalThis.__extraMode.seconds+10);button=renderer.root.findByProps({'data-light':index});}await act(async()=>button.props.onClick());}
   }
   if(id==='sequence'){
    for(let round=0;round<rules.NEW_GAME_PRESETS.sequence[level].rounds;round++){
     for(let step=0;step<40&&renderer.root.findAll(n=>n.props['data-game']===id)[0].props['data-state']!=='playing';step++){assert.ok(queue.size);await act(async()=>{const [key,cb]=queue.entries().next().value;queue.delete(key);cb();});}
     assert.equal(data().phase,'playing');
     if(round===0&&variant?.id==='reverse-sequence'){
      const expectedFirst=rules.sequenceAnswer(data().sequence,rules.NEW_GAME_PRESETS.sequence[level].symbols,variant.id)[0],wrong=expectedFirst%10+1;
      await act(async()=>renderer.root.findByProps({'data-sequence-number':wrong}).props.onClick());
      for(let step=0;step<40&&renderer.root.findAll(n=>n.props['data-game']===id)[0].props['data-state']!=='playing';step++)await act(async()=>{const [key,cb]=queue.entries().next().value;queue.delete(key);cb();});
      assert.equal(data().lives,2);
     }
     const expected=rules.sequenceAnswer(data().sequence,rules.NEW_GAME_PRESETS.sequence[level].symbols,variant?.id);
     for(const number of expected)await act(async()=>renderer.root.findByProps({'data-sequence-number':number}).props.onClick());
     if(renderer.root.findAllByProps({className:'play-result'}).length)break;
    }
   }
   if(id==='kakuro'){
    if(variant?.id==='rotating-sums'){const before=[...data().puzzle.solution];await seconds(20);assert.deepEqual(data().puzzle.solution,[...before].reverse());}
    if(variant?.id==='fading-sums'){await seconds(12);assert.ok(renderer.root.findAllByProps({className:'kakuro-clue'}).flatMap(n=>n.findAllByType('span')).every(n=>n.children.join('').includes('?')));}
    const puzzle=data().puzzle;for(let index=0;index<puzzle.cells.length;index++)if(puzzle.cells[index].white&&!puzzle.cells[index].given){await act(async()=>renderer.root.findByProps({'data-kakuro-cell':index}).props.onClick());const digit=puzzle.solution[index];await act(async()=>renderer.root.findByProps({className:'extra-keypad'}).findAllByType('button').find(n=>n.children.some(value=>String(value)===String(digit))).props.onClick());
     if(variant?.id==='permanent-sums'){await act(async()=>renderer.root.findByProps({'aria-label':'Hapus angka'}).props.onClick());assert.equal(data().values[index],digit);}
    }
    await act(async()=>renderer.root.findAll(n=>n.type==='button'&&n.children.includes('Periksa papan'))[0].props.onClick());
   }
   if(id==='slitherlink'){
    if(variant?.id==='rotating-loop')await seconds(20);
    if(variant?.id==='fading-loop-clues'){await seconds(12);assert.ok(renderer.root.findAllByProps({className:'slither-clue'}).every(n=>n.children.length===0||n.children.includes('?')));}
    const solution=[...data().puzzle.solution];for(let index=0;index<solution.length;index++)if(solution[index]===1&&data().marks[index]!==1){await act(async()=>renderer.root.findByProps({'data-loop-edge':index}).props.onClick());if(variant?.id==='permanent-loop'){await act(async()=>renderer.root.findByProps({'data-loop-edge':index}).props.onClick());assert.equal(data().marks[index],1);}}
    await act(async()=>renderer.root.findAll(n=>n.type==='button'&&n.children.includes('Periksa'))[0].props.onClick());
   }
   assert.ok(renderer.root.findAllByProps({className:'play-result'}).length,`${id}/${level}/${variant?.id}: solved through controls`);
   assert.ok(JSON.stringify(renderer.toJSON()).includes('Tantangan selesai!'));
   await act(async()=>renderer.unmount());renderer=null;
  }
 }finally{if(renderer)await act(async()=>renderer.unmount());globalThis.clearTimeout=clear;await server.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
