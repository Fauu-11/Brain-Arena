import {normalizeLevel,GAME_SETTINGS_KEY} from '../data/difficulties.js';
import {readJSON} from './storage.js';

export function initialGameSetting(gameId,field) {
  if(field==='universityDifficulties')return 'impossible';
  return normalizeLevel(readJSON(GAME_SETTINGS_KEY,{})?.[gameId]);
}

export function cubeResult(correct, total = 5) {
  const count = Math.max(0, Math.min(total, Number(correct) || 0));
  return { correct: count, total, accuracy: count / total, outcome: count / total >= 0.6 ? 'completed' : 'loss' };
}

export function initialGameOption(_gameId,_key,fallback){return fallback;}
