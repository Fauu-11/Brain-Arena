import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {create,act} from 'react-test-renderer';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';

test('all feature pages mount inside the mobile shell; bottom tabs and quick options remain usable',{timeout:30000},async()=>{
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  let width=390;
  const noop=()=>{};const values=new Map([['ba_onboarding_v1','{"completedAt":1}']]);
  const memory={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
  globalThis.localStorage=memory;
  globalThis.document={hidden:false,querySelector:()=>null,addEventListener:noop,removeEventListener:noop,body:{style:{}},documentElement:{dataset:{},style:{setProperty:noop,removeProperty:noop},classList:{toggle:noop}}};
  const media=query=>{const min=/min-width:\s*(\d+)/.exec(query),max=/max-width:\s*(\d+)/.exec(query);return{matches:min?width>=Number(min[1]):max?width<=Number(max[1]):false,addEventListener:noop,removeEventListener:noop};};
  globalThis.window={localStorage:memory,innerWidth:width,innerHeight:844,navigator:{standalone:false},location:{hash:'#/home',href:'http://localhost/#/home'},addEventListener:noop,removeEventListener:noop,dispatchEvent:noop,matchMedia:media};
  globalThis.location=window.location;
  globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=noop;
  globalThis.MutationObserver=class{observe(){}disconnect(){}};
  const root=fileURLToPath(new URL('../',import.meta.url));let renderer,api,selected;
  const server=await createServer({root,configFile:false,server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'modal-component-fixture',enforce:'pre',load(id){if(id.endsWith('/components/Dialog.jsx'))return "import React from 'react';export default function Dialog({open,title,children}){return open?React.createElement('section',{'data-test-dialog':title},children):null;}";}}]});
  try{
    const {ArenaProvider,useArena}=await server.ssrLoadModule('/src/context/ArenaContext.jsx');
    const {LanguageProvider}=await server.ssrLoadModule('/src/context/LanguageContext.jsx');
    const {default:Layout}=await server.ssrLoadModule('/src/components/Layout.jsx');
    const {routeHash}=await server.ssrLoadModule('/src/data/games.js');
    function Harness(){api=useArena();return null;}
    const pages=['Home','Challenges','Progress','Activity','Guides','DailyChallenge','Profile','Achievements','Missions','Leaderboard','Rank','CustomizeProfile','Statistics','ActivityCalendar','Season','Events','Mastery','Settings','ArenaRun','MatchHistory','ReplayViewer','GameCompletion','Feedback','ChallengeShare','ArenaBuilder','DailyArchive','DataHealth','OfflineManager','Goals','LocalProfiles','Showcase','ResultCard','ArenaCup','PracticeLab','SaveSlots','StorageCenter','SystemDiagnostics','CloudReadiness','Controls','TipsPage'];
    const routes={Home:'home',DailyChallenge:'daily',CustomizeProfile:'customize',ActivityCalendar:'activity-calendar',ArenaRun:'arena-run',MatchHistory:'history',ReplayViewer:'replay',GameCompletion:'completion',ChallengeShare:'challenge',ArenaBuilder:'arena-builder',DailyArchive:'daily-archive',DataHealth:'data-health',OfflineManager:'offline',LocalProfiles:'profiles',ResultCard:'share-result',ArenaCup:'arena-cup',PracticeLab:'practice-lab',SaveSlots:'save-slots',StorageCenter:'storage-center',SystemDiagnostics:'diagnostics',CloudReadiness:'cloud-readiness',TipsPage:'tips-maze'};
    for(const page of pages){
      const view=routes[page]||page.toLowerCase();window.location.hash=routeHash(view);
      const {default:Page}=await server.ssrLoadModule(`/src/pages/${page}.jsx`);
      const content=React.createElement(Page,{onNavigate:v=>{selected=v;},onSelectGame:v=>{selected=v;},view:'home',gameId:'maze',onBack:noop});
      const tree=React.createElement(LanguageProvider,null,React.createElement(ArenaProvider,null,React.createElement(Harness),React.createElement(Layout,{currentView:view,onViewChange:v=>{selected=v;}},content)));
      await act(async()=>{renderer=create(tree);});
      assert.equal(renderer.root.findAll(n=>n.type==='main'&&n.props.id==='main-content').length,1,page);
      const tabs=renderer.root.findByProps({className:'mobile-tabbar'});
      assert.equal(tabs.findAllByType('button').length,5,page);
      await act(async()=>tabs.findAllByType('button')[1].props.onClick());assert.equal(selected,'games');
      assert.ok(api.profile);
      if(page==='Home'){
        await act(async()=>renderer.root.findByProps({className:'icon-button mobile-tools-button'}).props.onClick());
        const sheet=renderer.root.findByProps({'data-test-dialog':'Opsi cepat'});
        assert.ok(sheet.findAllByType('button').length>=5);
        const sound=sheet.findAllByType('button').find(n=>n.props['aria-pressed']!==undefined);
        const before=api.muted;await act(async()=>sound.props.onClick());assert.equal(api.muted,!before);
      }
      await act(async()=>renderer.unmount());renderer=null;
    }
    const {default:Home}=await server.ssrLoadModule('/src/pages/Home.jsx');
    for(const viewport of [320,360,430,568,768,1024,1440]){
      width=viewport;window.innerWidth=viewport;
      await act(async()=>{renderer=create(React.createElement(LanguageProvider,null,React.createElement(ArenaProvider,null,React.createElement(Layout,{currentView:'home',onViewChange:noop},React.createElement(Home,{onSelectGame:noop})))));});
      assert.ok(renderer.root.findByProps({className:'mobile-tabbar'}));
      await act(async()=>renderer.unmount());renderer=null;
    }
  }finally{if(renderer)await act(async()=>renderer.unmount());await server.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
