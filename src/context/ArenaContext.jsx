import {chooseUniversityVariant,setUniversityVariant} from '../utils/universityGameplay.js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { gameById } from '../data/games.js';
import { normalizeLevel, GAME_SETTINGS_KEY } from '../data/difficulties.js';
import { readJSON, readText, writeJSON, writeText, storageAvailable } from '../utils/storage.js';
import { activateSeededRandom, configuredChallengeCode, createChallengeCode, restoreNativeRandom } from '../utils/competitive.js';
import { resetSessionClock, setClockSuspended, setGameStopped } from '../utils/sessionClock.js';
import { clearGameCheckpoint } from '../utils/gameCheckpoint.js';
const ArenaContext=createContext(null);
const defaults={theme:'system',reducedMotion:false,highContrast:false,largeText:false};
export function ArenaProvider({children}) {
  const [muted,setMuted]=useState(()=>readText('ba_muted')==='true');
  const [notice,setNotice]=useState('');
  const [settings,setSettings]=useState(()=>readJSON(GAME_SETTINGS_KEY,{}));
  const settingsRef=useRef(settings);
  const [accessibility,setAccessibility]=useState(()=>({...defaults,...readJSON('ba_accessibility_v1',{})}));
  const [currentSession,setCurrentSession]=useState(null);
  const sessionRef=useRef(null);
  const lastVariants=useRef({});
  const setSessionSchoolLevel=useCallback((gameId,level)=>{
    if(!gameById(gameId))return;
    const safe=normalizeLevel(level);
    if(settingsRef.current[gameId]===safe)return;
    const next={...settingsRef.current,[gameId]:safe};
    settingsRef.current=next;setSettings(next);writeJSON(GAME_SETTINGS_KEY,next);
  },[]);
  const beginGameSession=useCallback(gameId=>{
    if(!gameById(gameId))return null;
    const schoolLevel=normalizeLevel(settingsRef.current[gameId]);
    const challengeCode=configuredChallengeCode(createChallengeCode(gameId),schoolLevel,'impossible');
    activateSeededRandom(challengeCode);resetSessionClock();clearGameCheckpoint(gameId);
    const universityVariant=schoolLevel==='universitas'?chooseUniversityVariant(gameId,challengeCode,lastVariants.current[gameId]):null;
    if(universityVariant)lastVariants.current[gameId]=universityVariant;
    setUniversityVariant(gameId,universityVariant);
    const session={universityVariant,id:crypto.randomUUID(),gameId,schoolLevel,universityDifficulty:'impossible',challengeCode,active:true};
    sessionRef.current=session;setCurrentSession(session);return session;
  },[]);
  const leaveGameSession=useCallback(()=>{
    sessionRef.current=null;setCurrentSession(null);setUniversityVariant(null,null);restoreNativeRandom();resetSessionClock();
  },[]);
  const recordGameCompletion=useCallback(()=>{
    const current=sessionRef.current;if(!current?.active)return;
    const next={...current,active:false};sessionRef.current=next;setCurrentSession(next);setGameStopped(true);
  },[]);
  const failGameSession=useCallback((gameId,reason)=>{
    const current=sessionRef.current;if(!current?.active||current.gameId!==gameId)return;
    const next={...current,active:false,failure:reason};sessionRef.current=next;setCurrentSession(next);setGameStopped(true);
  },[]);
  const toggleSound=useCallback(()=>setMuted(value=>{writeText('ba_muted',!value);return !value;}),[]);
  const updateAccessibility=useCallback((key,value)=>{
    if(!Object.hasOwn(defaults,key))return;
    setAccessibility(old=>{const next={...old,[key]:key==='theme'&&['system','light','dark'].includes(value)?value:key==='theme'?'system':Boolean(value)};writeJSON('ba_accessibility_v1',next);return next;});
  },[]);
  useEffect(()=>{
    window.__BA_MUTED__=muted;
    if(typeof CustomEvent!=='undefined')window.dispatchEvent(new CustomEvent('ba-sound-toggle',{detail:{muted}}));
  },[muted]);
  useEffect(()=>{
    if(!notice)return;const timer=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(timer);
  },[notice]);
  useEffect(()=>{
    const root=document.documentElement;
    const media=window.matchMedia('(prefers-color-scheme: dark)');
    const sync=()=>{root.dataset.baEffectiveTheme=accessibility.theme==='system'?(media.matches?'dark':'light'):accessibility.theme;root.classList.toggle('reduce-motion',accessibility.reducedMotion);root.classList.toggle('ba-reduced-motion',accessibility.reducedMotion);root.classList.toggle('high-contrast',accessibility.highContrast);root.classList.toggle('large-text',accessibility.largeText);};
    sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);
  },[accessibility]);
  useEffect(()=>{
    const sync=()=>setClockSuspended(document.hidden||Boolean(document.querySelector('dialog[open]')));
    const observer=new MutationObserver(sync);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open'],childList:true});
    document.addEventListener('visibilitychange',sync);sync();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);setClockSuspended(false);};
  },[]);
  const value=useMemo(()=>({muted,toggleSound,notice,setNotice,settings,accessibility,updateAccessibility,storageOk:storageAvailable(),currentSession,beginGameSession,restartGameSession:beginGameSession,prepareFreshSession:beginGameSession,leaveGameSession,recordGameCompletion,failGameSession,setSessionSchoolLevel}),[muted,toggleSound,notice,settings,accessibility,updateAccessibility,currentSession,beginGameSession,leaveGameSession,recordGameCompletion,failGameSession,setSessionSchoolLevel]);
  return <ArenaContext.Provider value={value}>{children}</ArenaContext.Provider>;
}
// The hook shares the provider API.
// eslint-disable-next-line react/only-export-components
export function useArena(){return useContext(ArenaContext);}
