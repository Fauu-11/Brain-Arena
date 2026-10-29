import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {act,create} from 'react-test-renderer';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
test('gameplay clocks pause for tab, dialog, local pause and failure; deferred shifts run once',async()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;let dialog=false,mode;
 globalThis.document={hidden:false,querySelector:()=>dialog?{}:null};
 const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),configFile:false,server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'timer-context',enforce:'pre',load(id){if(id.endsWith('/context/ArenaContext.jsx'))return 'export const useArena=()=>globalThis.__timerContext;';}}]});
 const {useUniversityGameplay,useUniversityEvent}=await server.ssrLoadModule('/src/hooks/useUniversityGameplay.js');
 const clock=await server.ssrLoadModule('/src/utils/sessionClock.js');
 const originalInterval=globalThis.setInterval,originalClear=globalThis.clearInterval;
 const timers=new Map();let timerId=0,renderer,events=0;
 globalThis.setInterval=(callback)=>{const id=++timerId;timers.set(id,callback);return id;};globalThis.clearInterval=id=>timers.delete(id);
 globalThis.__timerContext={currentSession:{id:'first',gameId:'maze',active:true,universityVariant:'shifting-maze'},failGameSession:()=>{globalThis.__timerContext.currentSession={...globalThis.__timerContext.currentSession,active:false,failure:{id:'lost'}};clock.setGameStopped(true);}};
 function Harness({playing=true,ready=true,eventMode=null}){mode=useUniversityGameplay('maze','universitas',playing);useUniversityEvent(eventMode||mode,'shifting-maze',20,ready,()=>{events++;});return null;}
 const render=async props=>act(async()=>{if(renderer)renderer.update(React.createElement(Harness,props));else renderer=create(React.createElement(Harness,props));});
 const tick=async()=>act(async()=>{for(const callback of [...timers.values()])callback();});
 try{
  clock.resetSessionClock();await render({});await tick();assert.equal(mode.seconds,1);
  document.hidden=true;await tick();assert.equal(mode.seconds,1);document.hidden=false;
  dialog=true;await tick();assert.equal(mode.seconds,1);dialog=false;
  await render({playing:false});assert.equal(timers.size,0);await tick();assert.equal(mode.seconds,1);
  await render({});await tick();assert.equal(mode.seconds,2);
  clock.setClockActivity(true);await act(async()=>mode.fail({id:'lost'}));await render({});
  const now=Date.now;const frozen=clock.sessionDurationMs();try{Date.now=()=>now()+60000;clock.setClockActivity(true);assert.equal(clock.sessionDurationMs(),frozen);}finally{Date.now=now;}await tick();assert.equal(mode.seconds,2);assert.equal(timers.size,0);
  clock.resetSessionClock();globalThis.__timerContext.currentSession={id:'second',gameId:'maze',active:true,universityVariant:'shifting-maze'};await render({});assert.equal(mode.seconds,0);await tick();assert.equal(mode.seconds,1);
  const eventMode={id:'shifting-maze',sessionId:'event',seconds:20,active:true};
  await render({ready:false,eventMode});assert.equal(events,0);
  await render({ready:true,eventMode});assert.equal(events,1);await render({ready:true,eventMode:{...eventMode}});assert.equal(events,1);
  await render({ready:true,eventMode:{...eventMode,seconds:40}});assert.equal(events,2);
  await render({ready:true,eventMode:{...eventMode,sessionId:'new-event',seconds:0}});assert.equal(events,2);
 }finally{if(renderer)await act(async()=>renderer.unmount());globalThis.setInterval=originalInterval;globalThis.clearInterval=originalClear;clock.resetSessionClock();await server.close();delete globalThis.IS_REACT_ACT_ENVIRONMENT;}
});
