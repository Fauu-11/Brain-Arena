import { readJSON, readText } from './storage.js';
import { getOrCreateGuestIdentity } from './guestIdentity.js';
const firstArray=(keys)=>{for(const key of keys){const value=readJSON(key,null);if(Array.isArray(value))return value;}return [];};
export function buildNormalizedPlayerModel(storage=typeof window!=='undefined'?window.localStorage:null){
  const identity=getOrCreateGuestIdentity();
  const profile=readJSON('ba_profile_v1',{});
  const progress={
    progression:readJSON('ba_progress_v1',{}),rank:readJSON('ba_rank_v1',{}),season:readJSON('ba_season_v1',{}),mastery:readJSON('ba_mastery_v1',{}),
    achievements:readJSON('ba_achievements_v1',{}),missions:readJSON('ba_missions_v1',{}),goals:readJSON('ba_personal_goals_v1',[]),completion:readJSON('ba_completion_v1',{}),
  };
  const settings={accessibility:readJSON('ba_accessibility_v1',{}),sidebar:readJSON('ba_sidebar_layout_v2',{}),language:readText('ba_language','id'),controller:readJSON('ba_controller_settings_v1',{})};
  const matches=firstArray(['ba_matches_v2','ba_matches_v1','ba_match_history_v1']);
  const records=readJSON('ba_personal_bests_v1',{});
  const favorites=readJSON('ba_favorites_v2',[]);
  const pinned=readJSON('ba_pinned_games_v2',[]);
  return {schema:19,identity,profile:{...profile,playerId:profile?.playerId||identity.id},progress,matches,records,favorites,pinned,settings,generatedAt:Date.now(),source:'brain-arena-local'};
}
export function validateNormalizedPlayerModel(model){
  const issues=[];if(!model||typeof model!=='object')return {valid:false,issues:['model-missing']};
  if(!model.identity?.id)issues.push('identity-missing');
  if(!model.profile||typeof model.profile!=='object')issues.push('profile-missing');
  if(!model.progress||typeof model.progress!=='object')issues.push('progress-missing');
  if(!Array.isArray(model.matches))issues.push('matches-invalid');
  if(!Array.isArray(model.favorites))issues.push('favorites-invalid');
  if(!Array.isArray(model.pinned))issues.push('pinned-invalid');
  return {valid:issues.length===0,issues};
}
