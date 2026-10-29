import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {create,act} from 'react-test-renderer';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
test('focused shell has three destinations, working filters/settings, and randomized Universitas sessions',{timeout:30000},async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const noop=()=>{};const values=new Map([['ba_profile_v1','{"xp":123,"rankedPoints":40}']]);
 const memory={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
 globalThis.localStorage=memory;
 globalThis.document={hidden:false,querySelector:()=>null,addEventListener:noop,removeEventListener:noop,body:{style:{}},documentElement:{dataset:{},style:{setProperty:noop,removeProperty:noop},classList:{toggle:noop}}};
 globalThis.window={localStorage:memory,innerWidth:390,innerHeight:844,navigator:{standalone:false},location:{hash:'#/games',href:'http://localhost/#/games'},addEventListener:noop,removeEventListener:noop,dispatchEvent:noop,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop})};
 globalThis.location=window.location;globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=noop;globalThis.MutationObserver=class{observe(){}disconnect(){}};
 const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),configFile:false,server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'modal-fixture',enforce:'pre',load(id){if(id.endsWith('/components/Dialog.jsx'))return "export default function Dialog(){return null;}";}}]});
 let renderer,api,selected;
 try{
  const {ArenaProvider,useArena}=await server.ssrLoadModule('/src/context/ArenaContext.jsx');
  const {LanguageProvider}=await server.ssrLoadModule('/src/context/LanguageContext.jsx');
  const {default:Layout}=await server.ssrLoadModule('/src/components/Layout.jsx');
  const {SoloEndCard}=await server.ssrLoadModule('/src/components/GameShell.jsx');
  const {UNIVERSITY_GAMEPLAY}=await server.ssrLoadModule('/src/utils/universityGameplay.js');
  const {gameSuspended}=await server.ssrLoadModule('/src/utils/sessionClock.js');
  function Harness(){api=useArena();return null;}
  const wrap=child=>React.createElement(LanguageProvider,null,React.createElement(ArenaProvider,null,React.createElement(Harness),child));
  for(const page of ['Home','Settings','Guides','TipsPage']){
   const {default:Page}=await server.ssrLoadModule(`/src/pages/${page}.jsx`);
   await act(async()=>{renderer=create(wrap(React.createElement(Layout,{currentView:page==='Home'?'games':page.toLowerCase(),onViewChange:value=>{selected=value;}},React.createElement(Page,{onSelectGame:value=>{selected=value;},onNavigate:noop,gameId:'maze'}))));});
   const tabs=renderer.root.findByProps({className:'simple-mobile-tabs'}).findAllByType('button');
   assert.equal(tabs.length,3);assert.equal(api.profile,undefined);assert.equal(api.levelInfo,undefined);assert.equal(api.rankInfo,undefined);
   await act(async()=>tabs[0].props.onClick());assert.equal(selected,'games');
   if(page==='Home'){
    assert.equal(renderer.root.findAll(n=>n.type==='article'&&String(n.props.className).includes('simple-game-card')).length,17);
    await act(async()=>renderer.root.findByProps({id:'catalog-search'}).props.onChange({target:{value:'Sudoku'}}));
    assert.equal(renderer.root.findAll(n=>n.type==='article'&&String(n.props.className).includes('simple-game-card')).length,1);
    const content=JSON.stringify(renderer.toJSON());assert.doesNotMatch(content,/\bXP\b|Ranked|Daily|profil|Profile/);
   }
   if(page==='Settings'){
    await act(async()=>api.updateAccessibility('theme','dark'));assert.equal(document.documentElement.dataset.baEffectiveTheme,'dark');
    const before=api.muted;await act(async()=>api.toggleSound());assert.equal(api.muted,!before);assert.equal(window.__BA_MUTED__,!before);
   }
   await act(async()=>renderer.unmount());renderer=null;
  }
  // All games draw an actual rule, avoid an immediate repeat, and reset failures.
  await act(async()=>{renderer=create(wrap(null));});
  for(const gameId of Object.keys(UNIVERSITY_GAMEPLAY)){
    await act(async()=>api.setSessionSchoolLevel(gameId,'universitas'));
    let previous=null;
    for(let run=0;run<6;run++){
      await act(async()=>api.beginGameSession(gameId));
      assert.ok(UNIVERSITY_GAMEPLAY[gameId].some(v=>v.id===api.currentSession.universityVariant));
      assert.notEqual(api.currentSession.universityVariant,previous);previous=api.currentSession.universityVariant;
    }
  }
  await act(async()=>api.failGameSession('maze',{id:'Stopped',en:'Stopped'}));
  // A failure for another game cannot affect the active arithmetic session.
  assert.equal(api.currentSession.active,true);
  const activeId=api.currentSession.gameId;
  await act(async()=>api.failGameSession(activeId,{id:'Stopped',en:'Stopped'}));
  assert.equal(api.currentSession.active,false);assert.ok(api.currentSession.failure);assert.equal(gameSuspended(),true);
  await act(async()=>api.beginGameSession(activeId));assert.equal(api.currentSession.failure,undefined);assert.equal(gameSuspended(),false);
  await act(async()=>api.setSessionSchoolLevel(activeId,'sma'));
  await act(async()=>api.beginGameSession(activeId));assert.equal(api.currentSession.universityVariant,null);
  await act(async()=>renderer.update(wrap(React.createElement(SoloEndCard,{heading:'Solved',lang:'id',onBack:noop,onPlayAgain:noop}))));
  assert.equal(api.currentSession.active,false);
  await act(async()=>renderer.unmount());renderer=null;
  // Settings are the only new storage; old user data is neither updated nor silently deleted.
  assert.equal(values.get('ba_profile_v1'),'{"xp":123,"rankedPoints":40}');
  for(const key of values.keys())assert.ok(['ba_profile_v1','ba_game_settings_v2','ba_accessibility_v1','ba_muted','uw_lang'].includes(key),key);
 }finally{if(renderer)await act(async()=>renderer.unmount());await server.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
