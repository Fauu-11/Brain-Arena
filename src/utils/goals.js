import { readJSON, writeJSON } from './storage.js';
import { localDateKey, shiftDateKey } from './progression.js';
const KEY='ba_personal_goals_v1';
export const GOAL_TYPES=[
 {id:'sessions',label:{id:'Selesaikan sesi',en:'Complete sessions'},unit:{id:'sesi',en:'sessions'},defaultTarget:5},
 {id:'xp',label:{id:'Raih XP',en:'Earn XP'},unit:{id:'XP',en:'XP'},defaultTarget:1000},
 {id:'ranked',label:{id:'Main Ranked',en:'Play Ranked'},unit:{id:'match',en:'matches'},defaultTarget:3},
 {id:'daily',label:{id:'Daily Challenge',en:'Daily Challenges'},unit:{id:'hari',en:'days'},defaultTarget:3},
];
export function loadGoals(){const raw=readJSON(KEY,[]);return Array.isArray(raw)?raw.filter(Boolean):[];}
export function saveGoals(goals){const next=(Array.isArray(goals)?goals:[]).slice(0,12);writeJSON(KEY,next);return next;}
export function createGoal({type='sessions',target,gameId='all',days=7}={}){const def=GOAL_TYPES.find(x=>x.id===type)||GOAL_TYPES[0];const start=localDateKey();return{id:`goal-${Date.now().toString(36)}`,type:def.id,target:Math.max(1,Math.floor(Number(target)||def.defaultTarget)),gameId,createdAt:Date.now(),startDate:start,endDate:shiftDateKey(start,Math.max(1,Math.min(30,Number(days)||7))),completedAt:null};}
export function goalProgress(goal,profile={},daily={},matches=[]){if(!goal)return 0;const gameOk=x=>goal.gameId==='all'||x?.gameId===goal.gameId;let value=0;if(goal.type==='sessions')value=(profile.completionEvents||[]).filter(x=>gameOk(x)&&x.dateKey>=goal.startDate&&x.dateKey<=goal.endDate).length;else if(goal.type==='xp')value=(profile.xpEvents||[]).filter(x=>gameOk(x)&&x.dateKey>=goal.startDate&&x.dateKey<=goal.endDate).reduce((s,x)=>s+(Number(x.amount)||0),0);else if(goal.type==='ranked')value=(matches||[]).filter(x=>gameOk(x)&&x.mode==='ranked'&&String(x.dateKey||'')>=goal.startDate&&String(x.dateKey||'')<=goal.endDate).length;else if(goal.type==='daily')value=Object.keys(daily.completedByDate||{}).filter(k=>k>=goal.startDate&&k<=goal.endDate).length;return Math.max(0,value);}
