import { challengeConfiguration } from './competitive.js';
import { readJSON } from './storage.js';

export function initialGameSetting(gameId, field, fallback) {
  const setup = readJSON('ba_competition_setup_v1', {});
  const value = setup?.[field]?.[gameId];
  const allowed = field === 'schoolLevels' ? ['sd','smp','sma','universitas'] : ['hard','very-hard','impossible'];
  return allowed.includes(value) ? value : fallback;
}

export function cubeResult(correct, total = 5) {
  const count = Math.max(0, Math.min(total, Number(correct) || 0));
  return { correct: count, total, accuracy: count / total, outcome: count / total >= 0.6 ? 'completed' : 'loss' };
}

export function belongsToStage(session, competition, idField) {
  const stage = competition?.stages?.[competition.index];
  return Boolean(competition?.status === 'active' && stage && session?.[idField] === competition.id && session.gameId === stage.gameId && session.challengeCode === stage.challengeCode && session.mode === competition.mode && (!stage.schoolLevel || session.schoolLevel === stage.schoolLevel) && (!stage.universityDifficulty || session.universityDifficulty === stage.universityDifficulty));
}

export function initialGameOption(gameId, key, fallback) {
  const setup=readJSON('ba_competition_setup_v1',{});
  const value=challengeConfiguration(setup.challengeCodes?.[gameId])?.options?.[key];
  if(value===undefined)return fallback;
  if(key==='categories')return Object.fromEntries(Object.entries(fallback).map(([k,v])=>[k,typeof value[k]==='boolean'?value[k]:v]));
  return value;
}
