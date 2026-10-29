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
  const fields={codebreaker:['level','data'],lightsout:['level','data'],sequence:['level','data'],kakuro:['level','data'],slitherlink:['level','data'],game2048:['session','level','uni'],nonogram:['session','level','uni'],maze:['maze','position','visited'],minesweeper:['board','revealed','flags'],sudoku:['solution','cluesMask','userAnswers'],matrix:['pattern','selected','lives'],cube:['heights','level','history'],prime:['board','activePlayer','turnTimer'],mnm:['chips','tiles','aiMemory'],pixel:['cards','targets','solvedTargets'],'300':['pages','userAnswers','categories'],rps:['game']};
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
