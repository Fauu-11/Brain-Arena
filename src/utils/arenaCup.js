import { GAMES, gameById } from '../data/games.js';
import { createChallengeCode, nativeShuffle } from './competitive.js';
export const ARENA_CUP_KEY='ba_arena_cup_v1';
export function createArenaCup({mode='ranked',gameIds=[]}={},now=Date.now()){
  const clean=[...new Set(gameIds)].filter(id=>gameById(id));const pool=(clean.length>=7?clean:nativeShuffle(GAMES.map(g=>g.id))).slice(0,7);const id=`cup-${now.toString(36)}`;
  const roundNames=['Quarterfinal','Quarterfinal','Quarterfinal','Quarterfinal','Semifinal','Semifinal','Final'];
  return {id,status:'active',mode:mode==='practice'?'practice':'ranked',startedAt:now,index:0,stages:pool.map((gameId,index)=>({gameId,round:roundNames[index],challengeCode:createChallengeCode(gameId,`${id}-${index}-${gameId}`),result:null})),champion:null};
}
export function applyArenaCupResult(cup,match){if(!cup||cup.status!=='active')return cup;const stage=cup.stages?.[cup.index];if(!stage||stage.gameId!==match.gameId)return cup;const stages=cup.stages.map((item,i)=>i===cup.index?{...item,result:{matchId:match.id,performance:match.performance,grade:match.grade,durationMs:match.durationMs,outcome:match.outcome}}:item);const failed=!['completed','win'].includes(match.outcome);const last=cup.index>=stages.length-1;if(failed)return{...cup,stages,status:'eliminated',completedAt:match.time};if(last)return{...cup,stages,status:'champion',champion:{gameId:match.gameId,grade:match.grade,performance:match.performance},completedAt:match.time};return{...cup,stages,index:cup.index+1};}
