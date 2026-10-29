import {createServer} from 'vite';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {create,act} from 'react-test-renderer';
import assert from 'node:assert/strict';
test('real session provider recovers, finalizes once and charges Ranked resets', {timeout:15000}, async()=>{
const noop=()=>{};const values=new Map();
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.localStorage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
globalThis.document={hidden:false,querySelector:()=>null,addEventListener:noop,removeEventListener:noop,body:{},documentElement:{dataset:{},style:{setProperty:noop},classList:{toggle:noop}}};
globalThis.window={localStorage,location:{hash:'#/maze-escape'},addEventListener:noop,removeEventListener:noop,dispatchEvent:noop,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop})};
globalThis.MutationObserver=class{observe(){}disconnect(){}};
let server,root,api;
try{
 server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),configFile:false,server:{middlewareMode:true,hmr:false,ws:false}});
 const {ArenaProvider,useArena}=await server.ssrLoadModule('/src/context/ArenaContext.jsx');
 const cp=await server.ssrLoadModule('/src/utils/gameCheckpoint.js');
 const c=await server.ssrLoadModule('/src/utils/competitive.js');
 const clock=await server.ssrLoadModule('/src/utils/sessionClock.js');
 function Harness(){api=useArena();return null;}
 await act(async()=>{root=create(React.createElement(ArenaProvider,null,React.createElement(Harness)));});
 await act(async()=>{api.ensureCompetitionSetup('maze');api.setSessionSchoolLevel('maze','sd');api.beginGameSession('maze');});
 cp.registerCheckpoint('maze',{maze:[1,2],position:1,visited:new Set([0,1])},noop,true,true);
 await act(async()=>{api.leaveGameSession();});
 assert.ok(cp.validCheckpoint(api.recoverySession.boardCheckpoint,'maze'));
 await act(async()=>api.resumeRecovery());
 let resumed;await act(async()=>{resumed=api.beginGameSession('maze');});
 assert.ok(resumed.resumeCheckpoint);
 assert.ok(cp.restoreGameCheckpoint(resumed.resumeCheckpoint,'maze'));
 await act(async()=>{api.setPlayMode('ranked');api.prepareFreshSession('maze');});
 const firstId=api.currentSession.id;
 let reward;await act(async()=>{reward=api.recordGameCompletion('maze',{outcome:'completed'});});
 assert.ok(reward);const xp=api.profile.xp;
 await act(async()=>api.recordGameCompletion('maze',{outcome:'completed'}));assert.equal(api.profile.xp,xp);
 await act(async()=>api.prepareFreshSession('maze'));
 assert.notEqual(api.currentSession.id,firstId);
 await act(async()=>api.restartGameSession('maze'));
 assert.equal(api.matches[0].outcome,'loss');assert.equal(api.currentSession.active,true);
 const code=c.configuredChallengeCode(c.createChallengeCode('maze','new'),'universitas','impossible');
 await act(async()=>api.setChallengeCode('maze',code));assert.equal(api.competitionSetup.schoolLevels.maze,'universitas');
 clock.resetSessionClock();
}finally{if(root)await act(async()=>root.unmount());await server?.close();}

});
