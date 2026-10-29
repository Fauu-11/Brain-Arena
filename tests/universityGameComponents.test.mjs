import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {act,create} from 'react-test-renderer';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const names={'300':'Game300',prime:'GamePrime',pixel:'GamePixel',mnm:'GameMnM',cube:'GameCube',rps:'GameRPS',sudoku:'GameSudoku',minesweeper:'GameMinesweeper',maze:'GameMaze',matrix:'GameMemoryMatrix',nonogram:'GameNonogram',game2048:'Game2048'};
test('all 36 Universitas variations change their game input, board, visibility, or ending rule',{timeout:60000},async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const noop=()=>{},values=new Map();
 globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
 globalThis.document={hidden:false,querySelector:()=>null,addEventListener:noop,removeEventListener:noop,body:{}};
 globalThis.window={innerWidth:390,innerHeight:844,location:{hash:''},addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop})};
 globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=noop;
 globalThis.MutationObserver=class{observe(){}disconnect(){}};
 const realHooks=fs.readFileSync(`${root}src/hooks/useUniversityGameplay.js`,'utf8');
 const clockSource=fs.readFileSync(`${root}src/utils/sessionClock.js`,'utf8');
 const server=await createServer({root,configFile:false,server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'controlled-session-fixture',enforce:'pre',load(id){
  if(id.endsWith('/components/Dialog.jsx'))return "import React from 'react';export default function Dialog({open,children}){return open?React.createElement('section',{'data-modal-fixture':true},children):null;}";
  if(id.endsWith('/context/ArenaContext.jsx'))return 'export const useArena=()=>globalThis.__arenaVariantTest;';
  if(id.endsWith('/context/LanguageContext.jsx'))return "export const useLanguage=()=>({lang:'id'});";
  if(id.endsWith('/hooks/useUniversityGameplay.js'))return "import {useEffect,useRef} from 'react';export const useUniversityGameplay=()=>globalThis.__modeVariantTest;\n"+realHooks.slice(realHooks.indexOf('// Delay'));
  if(id.endsWith('/utils/sessionClock.js'))return clockSource.replace('let remaining=Math.max(0,ms)', 'let remaining=Math.max(0,Math.min(ms,20))');
 }}]});
 let renderer;
 try{
  const engine=await server.ssrLoadModule('/src/utils/universityGameplay.js');
  const checkpoint=await server.ssrLoadModule('/src/utils/gameCheckpoint.js');
  const rng=await server.ssrLoadModule('/src/utils/competitive.js');
  const clock=await server.ssrLoadModule('/src/utils/sessionClock.js');
  let serial=0;
  for(const [gid,variants] of Object.entries(engine.UNIVERSITY_GAMEPLAY).filter(([id])=>names[id]))for(const variant of variants){
   const failures=[];let Game,tick=0;
   values.set('ba_game_settings_v2',JSON.stringify({[gid]:'universitas'}));
   window.location.hash=`#/${gid}`;checkpoint.clearGameCheckpoint(gid);clock.resetSessionClock();
   globalThis.__modeVariantTest={id:variant.id,variant,sessionId:`case-${++serial}`,seconds:0,active:true,failed:false,fail:reason=>{failures.push(reason);globalThis.__arenaVariantTest.currentSession={...globalThis.__arenaVariantTest.currentSession,active:false,failure:reason};}};
   globalThis.__arenaVariantTest={currentSession:null,setNotice:noop,recordGameCompletion:noop,setSessionSchoolLevel:noop,beginGameSession:()=>{
    const code=rng.configuredChallengeCode(rng.createChallengeCode(gid,variant.id),'universitas','impossible');rng.activateSeededRandom(code);engine.setUniversityVariant(gid,variant.id);clock.resetSessionClock();
    globalThis.__arenaVariantTest.currentSession={id:`case-${serial}`,active:true,gameId:gid,schoolLevel:'universitas',universityVariant:variant.id,challengeCode:code};return globalThis.__arenaVariantTest.currentSession;
   }};
   ({default:Game}=await server.ssrLoadModule(`/src/games/${names[gid]}.jsx`));
   const repaint=async()=>act(async()=>renderer.update(React.createElement(Game,{onBack:noop,onNavigate:noop,testTick:++tick})));
   const seconds=async value=>{globalThis.__modeVariantTest={...globalThis.__modeVariantTest,seconds:value};await repaint();};
   const saved=()=>JSON.parse(JSON.stringify(checkpoint.readGameCheckpoint(gid)));
   const restore=async change=>{const snapshot=saved();assert.ok(snapshot,`${gid}/${variant.id}: snapshot`);change(snapshot.state);await act(async()=>assert.ok(checkpoint.restoreGameCheckpoint(snapshot,gid)));};
   await act(async()=>{renderer=create(React.createElement(Game,{onBack:noop,onNavigate:noop}));});
   // The actual setup's capture handler starts the session before its target button runs.
   const start=async()=>{
    const buttons=renderer.root.findAll(n=>n.type==='button'&&String(n.props.className).includes('uw-btn-primary'));
    const alternate=['prime','mnm'].includes(gid)?renderer.root.findAll(n=>n.type==='button'&&String(n.props.className).includes('uw-btn-secondary'))[0]:null;
    const actions=renderer.root.findAllByProps({className:'play-setup-actions'})[0];
    await act(async()=>{actions?.props.onClickCapture({target:{closest:()=>true}});(alternate||buttons[0]).props.onClick();});
   };
   await start();if(gid==='300')await start();
   if(gid==='matrix')await act(async()=>new Promise(resolve=>setTimeout(resolve,90)));
   assert.ok(renderer.root.findAll(n=>n.props['data-university-variant']===variant.id).length,`${gid}/${variant.id}: active rule visible`);
   const cells=className=>renderer.root.findByProps({className}).findAllByType('button');
   if(gid==='maze'){
    const before=saved().state;
    if(variant.id==='fatal-wall'){
     const walls=before.maze[before.position],direction=[['up',1],['right',2],['down',4],['left',8]].find(([,bit])=>walls&bit)[0];
     await act(async()=>renderer.root.findByProps({className:direction}).props.onClick());assert.equal(failures.length,1);
    }else if(variant.id==='vanishing-walls'){
     await seconds(8);assert.ok(renderer.root.findAll(n=>String(n.props.className).startsWith('maze-cell')).every(n=>!JSON.stringify(n.props.style).includes('#75628a')));
     await seconds(60);assert.ok(renderer.root.findAll(n=>String(n.props.className).startsWith('maze-cell')).some(n=>JSON.stringify(n.props.style).includes('#75628a')));
    }else{await seconds(20);const after=saved().state;assert.notDeepEqual(after.maze,before.maze);assert.equal(after.position,before.position);assert.equal(after.target,before.target);}
   }
   if(gid==='game2048'){
    await restore(s=>{s.session.board=[2,...Array(15).fill(0)];});
    if(variant.id==='heavy-spawn'){
     await act(async()=>renderer.root.findByProps({'aria-label':'Kanan'}).props.onClick());assert.equal(saved().state.session.board.filter(v=>v===4).length,1);
    }else if(variant.id==='hidden-values'){
     await seconds(6);assert.ok(renderer.root.findByProps({className:'g2048-board'}).findAll(n=>n.type==='div'&&n.children.includes('?')).length);
    }else{
     const before=saved().state.session.moves;await act(async()=>renderer.root.findByProps({'aria-label':'Atas'}).props.onClick());assert.equal(saved().state.session.moves,before);await seconds(20);assert.equal(renderer.root.findByProps({'aria-label':'Kanan'}).props.disabled,true);
    }
   }
   if(gid==='nonogram'){
    const board=cells('nonogram-grid');
    if(variant.id==='permanent-ink'){
     await act(async()=>board[0].props.onClick());await act(async()=>cells('nonogram-grid')[0].props.onContextMenu({preventDefault:noop}));assert.equal(saved().state.session.marks[0],1);
    }else if(variant.id==='hidden-clues'){
     await seconds(10);assert.ok(renderer.root.findByProps({className:'nonogram-col-clues'}).findAllByType('span').every(n=>n.children[0]==='·'));
    }else{
     await act(async()=>board[0].props.onClick());const before=saved().state.session;await seconds(20);assert.deepEqual(saved().state.session.puzzle.cells,[...before.puzzle.cells].reverse());assert.equal(saved().state.session.marks.at(-1),1);
    }
   }
   if(gid==='matrix'){
    await restore(s=>{s.pattern={__baType:'Set',values:[0,2,8]};s.selected={__baType:'Set',values:[]};});
    const index=variant.id==='mirror-recall'?63:variant.id==='inverse-recall'?1:2;
    await act(async()=>renderer.root.findAll(n=>n.type==='button'&&n.props['data-matrix-cell'])[index].props.onClick());
    const state=saved().state;if(variant.id==='ordered-recall')assert.equal(renderer.root.findAll(n=>n.type==='button'&&String(n.props.className).includes('wrong')).length,1);else assert.ok(state.selected.values.includes(index));
   }
   if(gid==='sudoku'){
    await restore(s=>{s.phase='playing';});const before=saved().state;
    const index=before.cluesMask.findIndex(v=>!v);
    if(variant.id==='perfect-entry'){
     await act(async()=>renderer.root.findByProps({'data-sudoku-cell':index}).props.onClick());
     const wrong=before.solution[index]%9+1;
     await act(async()=>cells('sudoku-keypad').find(n=>n.children.some(value=>String(value)===String(wrong))).props.onClick());assert.equal(failures.length,1);
    }else if(variant.id==='fading-entries'){
     await restore(s=>{s.userAnswers[index]='5';s.selectedCell=null;});await seconds(3);assert.ok(renderer.root.findByProps({'data-sudoku-cell':index}).props['aria-label'].endsWith('·'));
    }else{await seconds(20);assert.deepEqual(saved().state.solution,[...before.solution].reverse());assert.deepEqual(saved().state.cluesMask,[...before.cluesMask].reverse());}
   }
   if(gid==='minesweeper'){
    let board=renderer.root.findAll(n=>n.type==='button'&&n.props['data-ms-cell']);const opening=board.find(n=>n.props.className.includes('ms-challenge-start'));
    await act(async()=>opening.props.onClick());const state=saved().state;
    const safe=state.board.findIndex((cell,index)=>!cell.mine&&!state.revealed.values.includes(index));
    board=renderer.root.findAll(n=>n.type==='button'&&n.props['data-ms-cell']);
    if(variant.id==='fading-numbers'){
     await seconds(8);assert.ok(renderer.root.findAll(n=>n.type==='button'&&n.props['data-ms-cell']).some(n=>String(n.props['aria-label']).includes('angka disembunyikan')));
    }else{
     await act(async()=>board[safe].props.onContextMenu({preventDefault:noop}));
     if(variant.id==='precise-flags')assert.equal(failures.length,1);else assert.equal(saved().state.flags.values.length,0);
    }
   }
   if(gid==='prime'){
    const before=saved().state;
    if(variant.id==='prime-or-lose'){
     const index=before.board.findIndex(cell=>!cell.isPrime&&!cell.isHidden);await act(async()=>cells('prime-board')[index].props.onClick());assert.ok(renderer.root.findAllByProps({className:'play-result'}).length);
    }else if(variant.id==='hidden-numbers'){
     await seconds(8);assert.ok(cells('prime-board').every(n=>String(n.props['aria-label']).endsWith('?')));
    }else{await seconds(20);assert.notDeepEqual(saved().state.board.map(c=>c.value),before.board.map(c=>c.value));}
   }
   if(gid==='pixel'){
    const before=saved().state;
    if(variant.id==='fatal-overlap'){
     await restore(s=>{s.cards[0].grid=Array(15).fill(false);s.cards[1].grid=Array(15).fill(false);s.cards[0].grid[0]=s.cards[1].grid[0]=true;s.selectedCardIdxs=[0,1];});assert.equal(failures.length,1);
    }else if(variant.id==='hidden-targets'){
     await seconds(8);const targetDisplays=renderer.root.findAll(n=>n.type?.name==='MatrixDisplay').slice(0,before.targets.length);assert.ok(targetDisplays.length);assert.ok(targetDisplays.every(n=>n.props.grid.every(value=>!value)));
    }else{await seconds(20);assert.notDeepEqual(saved().state.cards.map(c=>c.id),before.cards.map(c=>c.id));}
   }
   if(gid==='cube'){
    const before=saved().state;
    if(variant.id==='perfect-count'){
     await act(async()=>renderer.root.findAllByType('input')[0].props.onChange({target:{value:'-1'}}));await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault:noop}));assert.equal(failures.length,1);
    }else if(variant.id==='memory-stack'){
     await restore(s=>{s.timer=16;});assert.equal(renderer.root.findAll(n=>n.type?.name==='IsoCube').length,0);
    }else{await seconds(5);assert.deepEqual(saved().state.heights,engine.rotateSquare90(before.heights,before.gridSize));}
   }
   if(gid==='mnm'){
    const before=saved().state;
    if(variant.id==='brief-memory'){await seconds(6);assert.ok(saved().state.chips.every(c=>!c.isFlipped));}
    else{
     await restore(s=>{s.phase='match';s.chips=s.chips.map(c=>({...c,isFlipped:false}));s.isTimerActive=true;});
     if(variant.id==='perfect-pairs'){
      const first=before.chips.find(c=>c.number),second=before.chips.find(c=>c.number&&c.number!==first.number);
      const click=async chip=>act(async()=>renderer.root.findAll(n=>n.type==='button'&&String(n.props['aria-label']).startsWith(`Keping ${chip.index+1}:`))[0].props.onClick({stopPropagation:noop}));
      await click(first);await click(second);assert.ok(renderer.root.findAllByProps({className:'play-result'}).length);
     }else{await seconds(20);const after=saved().state;assert.notDeepEqual(after.tiles,before.tiles);assert.deepEqual(after.chips.map(c=>c.number),before.chips.map(c=>c.number));}
    }
   }
   if(gid==='rps'){
    if(variant.id==='brief-net'){await seconds(6);await act(async()=>new Promise(resolve=>setTimeout(resolve,90)));assert.equal(saved().state.game.phase,'playing');}
    else{
     await restore(s=>{s.game.phase='playing';s.game.status=variant.id==='sudden-duel'?'feedback':'planning';s.game.battle=variant.id==='sudden-duel'?{delta:-1,player:1}:null;});
     if(variant.id==='sudden-duel')assert.ok(renderer.root.findAllByProps({className:'play-result'}).length);
     else{const before=saved().state.game.board;await seconds(20);assert.notDeepEqual(saved().state.game.board,before);assert.deepEqual([...saved().state.game.board].sort(),[...before].sort());}
    }
   }
   if(gid==='300'){
    if(variant.id==='perfect-arithmetic'){
     await act(async()=>renderer.root.findByProps({className:'arithmetic-practice'}).findByType('input').props.onChange({target:{value:'wrong'}}));await act(async()=>renderer.root.findByProps({className:'arithmetic-practice'}).props.onSubmit({preventDefault:noop}));assert.equal(failures.length,1);
    }else if(variant.id==='offset-arithmetic'){assert.ok(saved().state.practiceQuestion.offset>=2);}
    else{await seconds(180);assert.equal(failures.length,1);}
   }
   await repaint();
   if(failures.length)assert.ok(renderer.root.findAllByProps({className:'play-result'}).length,`${gid}: failure has a result panel`);
   await act(async()=>renderer.unmount());renderer=null;
  }
 }finally{if(renderer)await act(async()=>renderer.unmount());await server.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
