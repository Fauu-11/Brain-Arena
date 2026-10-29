import { readSessionClock, resetSessionClock, setClockActivity } from './sessionClock.js';
import { randomSnapshot, restoreRandomSnapshot } from './competitive.js';
const games = new Map();
export const CHECKPOINT_VERSION=1;
export function encodeState(value) {
  return JSON.parse(JSON.stringify(value, (_key,item)=>item instanceof Set?{__baType:'Set',values:[...item]}:item));
}
export function decodeState(value) {
  return JSON.parse(JSON.stringify(value),(_key,item)=>item?.__baType==='Set'&&Array.isArray(item.values)?new Set(item.values):item);
}
export function registerCheckpoint(gameId, state, restore, stable, active) {
  const previous=games.get(gameId);
  const next={restore,stable,current:state, saved:previous?.saved??null};
  setClockActivity(active);
  if(stable) next.saved={version:CHECKPOINT_VERSION,gameId,state:encodeState(state),clock:readSessionClock(),random:randomSnapshot()};
  games.set(gameId,next);
}
export function clearGameCheckpoint(gameId) { const entry=games.get(gameId);if(entry)entry.saved=null; }
export function readGameCheckpoint(gameId) { const entry=games.get(gameId);if(!entry?.saved)return null;return entry.stable?{...entry.saved,clock:readSessionClock(),random:randomSnapshot()}:entry.saved; }
export function validCheckpoint(snapshot, gameId) {
  const fields={game2048:['session','level','uni'],nonogram:['session','level','uni'],maze:['maze','position','visited'],minesweeper:['board','revealed','flags'],sudoku:['solution','cluesMask','userAnswers'],matrix:['pattern','selected','lives'],cube:['heights','level','history'],prime:['board','activePlayer','turnTimer'],mnm:['chips','tiles','aiMemory'],pixel:['cards','targets','solvedTargets'],'300':['pages','userAnswers','categories'],rps:['game']};
  if(!fields[gameId]||!snapshot?.state||!fields[gameId].every(key=>Object.hasOwn(snapshot.state,key)))return false;
  return Boolean(snapshot?.version===CHECKPOINT_VERSION && snapshot.gameId===gameId && snapshot.state && typeof snapshot.state==='object' && !Array.isArray(snapshot.state) && snapshot.clock && Number.isFinite(snapshot.clock.elapsedMs) && snapshot.clock.elapsedMs>=0 && snapshot.random?.code && Number.isInteger(snapshot.random?.state));
}
export function restoreGameCheckpoint(snapshot, gameId) {
  const entry=games.get(gameId);
  if(!entry?.restore||!validCheckpoint(snapshot,gameId)) return false;
  resetSessionClock(snapshot.clock);
  restoreRandomSnapshot(snapshot.random);
  entry.restore(decodeState(snapshot.state));
  entry.saved=snapshot;
  return true;
}

export function gameChallengeOptions(gameId) {
  const state=games.get(gameId)?.current??{}; const options={};
  if(gameId==='300')for(const key of ['difficulty','warPagesCount','practiceQuestionsCount','categories'])if(state[key]!==undefined)options[key]=state[key];
  if(['prime','mnm','300'].includes(gameId)&&['pvp','pve','practice_setup','war_setup'].includes(state.mode))options.mode=state.mode;
  return options;
}
export function applyChallengeConfiguration(gameId, config) {
  const entry=games.get(gameId);if(!entry||entry.stable)return;
  const state={...entry.current};
  for(const key of ['schoolLevel','level'])if(typeof state[key]==='string')state[key]=config.schoolLevel;
  if(gameId==='prime')state.difficulty=config.schoolLevel;
  for(const key of ['uni','universityDifficulty'])if(key in state)state[key]=config.universityDifficulty;
  for(const [key,value] of Object.entries(config.options))if(key in state)state[key]=key==='categories'?{...state[key],...value}:value;
  if(gameId==='rps')state.game={...state.game,level:config.schoolLevel,universityDifficulty:config.universityDifficulty};
  entry.restore(state);
}
