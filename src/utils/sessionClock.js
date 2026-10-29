let gameStopped=false;
export function setGameStopped(value){gameStopped=Boolean(value);if(gameStopped){settle();clock.active=false;clock.runningSince=null;}}
let clock = { elapsedMs: 0, penaltyMs: 0, runningSince: null, active: false, suspended: false };
const now = () => Date.now();
function settle(at = now()) {
  if (clock.runningSince !== null) clock.elapsedMs += Math.max(0, at - clock.runningSince);
  clock.runningSince = clock.active && !clock.suspended ? at : null;
}
export function resetSessionClock(saved = {}) {
  gameStopped=false;
  clock = { elapsedMs: Math.max(0, Number(saved.elapsedMs)||0), penaltyMs: Math.max(0, Number(saved.penaltyMs)||0), runningSince:null, active:false, suspended:false };
}
export function setClockActivity(active) { settle(); clock.active=Boolean(active)&&!gameStopped; clock.runningSince=clock.active&&!clock.suspended?now():null; }
export function setClockSuspended(suspended) { settle(); clock.suspended=Boolean(suspended); clock.runningSince=clock.active&&!clock.suspended?now():null; }
export function addClockPenalty(ms) { clock.penaltyMs += Math.max(0, Number(ms)||0); }
export function readSessionClock() { return { elapsedMs:clock.elapsedMs+(clock.runningSince===null?0:Math.max(0,now()-clock.runningSince)), penaltyMs:clock.penaltyMs }; }
export function sessionDurationMs() { const value=readSessionClock();return value.elapsedMs+value.penaltyMs; }
export function gameSuspended() { return gameStopped || typeof document!=='undefined' && (document.hidden || Boolean(document.querySelector('dialog[open]'))); }
export function gameInterval(callback, ms) { return setInterval(()=>{if(!gameSuspended()) callback();},ms); }
export function gameTimeout(callback, ms) {
  let remaining=Math.max(0,ms), previous=now();
  const handle=setInterval(()=>{
    const current=now(),delta=Math.min(100,Math.max(0,current-previous));previous=current;
    if(gameSuspended())return;
    remaining-=delta;
    if(remaining<=0){clearInterval(handle);callback();}
  },Math.max(1,Math.min(40,ms||1)));
  return handle;
}
