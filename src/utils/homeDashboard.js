import { GAMES, gameById } from '../data/games.js';
import { validateChallengeCode } from './competitive.js';

export function hasCompletedPlay(profile = {}, matches = []) {
  return profile.completions > 0 || matches.length > 0 ||
    Object.values(profile.perGame || {}).some(game => game?.completions > 0);
}

export function homeChoices(pinnedGames = [], history = []) {
  const pinned = [...new Set(pinnedGames)].map(gameById).filter(Boolean);
  const recent = [...new Set(history.map(item => item.id))].map(gameById).filter(Boolean);
  return { source: pinned.length ? 'pinned' : 'recent', games: (pinned.length ? pinned : recent).slice(0, 3) };
}

export function homePreview(category = 'all', pinnedGames = [], history = []) {
  const priority = homeChoices(pinnedGames, history).games;
  return [...new Map([...priority, ...GAMES].map(game => [game.id, game])).values()]
    .filter(game => category === 'all' || game.category === category).slice(0, 6);
}

export function homePrimaryAction({ profile = {}, matches = [], recoverySession, dailyCompleted = false, dailyGameId, pinnedGames = [], history = [] } = {}) {
  if (gameById(recoverySession?.gameId) && validateChallengeCode(recoverySession.challengeCode, recoverySession.gameId).valid) {
    return { kind: 'recovery', game: gameById(recoverySession.gameId) };
  }
  if (!hasCompletedPlay(profile, matches)) return { kind: 'first', game: gameById('cube') };
  if (!dailyCompleted && gameById(dailyGameId)) return { kind: 'daily', game: gameById(dailyGameId) };
  const next = homeChoices(pinnedGames, history).games[0] || GAMES.find(game => !(profile.perGame?.[game.id]?.completions > 0)) || gameById('cube');
  return { kind: 'next', game: next };
}

export function recoverySavedAt(timestamp, lang = 'id', now = Date.now()) {
  if (typeof timestamp !== 'number' && (typeof timestamp !== 'string' || !timestamp.trim())) return null;
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0 || value > now) return null;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}
