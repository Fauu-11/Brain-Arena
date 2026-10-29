import {useCallback,useEffect,useRef,useState} from 'react';
import {useArena} from '../context/ArenaContext.jsx';
import {gameInterval} from '../utils/sessionClock.js';
import {variantFor} from '../utils/universityGameplay.js';
export function useUniversityGameplay(gameId,level,playing){
 const {currentSession,failGameSession}=useArena();
 const enabled=level==='universitas'&&currentSession?.gameId===gameId;
 const sessionId=enabled?currentSession.id:null;
 const id=enabled?currentSession.universityVariant:null;
 const [clock,setClock]=useState({id:null,seconds:0});
 const seconds=clock.id===sessionId?clock.seconds:0;
 const active=Boolean(enabled&&playing&&currentSession.active&&!currentSession.failure);
 useEffect(()=>{if(!active)return;const timer=gameInterval(()=>setClock(old=>({id:sessionId,seconds:(old.id===sessionId?old.seconds:0)+1})),1000);return()=>clearInterval(timer);},[active,sessionId]);
 const fail=useCallback(reason=>failGameSession?.(gameId,reason),[failGameSession,gameId]);
 return {id,variant:variantFor(gameId,id),sessionId,seconds,active,failed:Boolean(currentSession?.gameId===gameId&&currentSession.failure),fail};
}
// Delay scheduled changes until a board is at a safe interaction boundary.
export function useUniversityEvent(mode,id,period,ready,callback){
 const latest=useRef(callback);latest.current=callback;
 const last=useRef({session:null,bucket:0});const bucket=Math.floor(mode.seconds/period);
 useEffect(()=>{
  if(last.current.session!==mode.sessionId)last.current={session:mode.sessionId,bucket:0};
  if(mode.id!==id||!mode.active||!ready||bucket<=last.current.bucket)return;
  last.current.bucket=bucket;latest.current();
 },[mode.id,mode.active,mode.sessionId,bucket,id,ready]);
}
