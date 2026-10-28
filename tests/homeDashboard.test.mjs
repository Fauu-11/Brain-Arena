import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, gameById } from '../src/data/games.js';
import { createChallengeCode } from '../src/utils/competitive.js';
import { hasCompletedPlay, homeChoices, homePreview, homePrimaryAction, recoverySavedAt } from '../src/utils/homeDashboard.js';

const NOW = Date.UTC(2026, 9, 28, 12);
const ids = games => games.map(game => game.id);

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

test('empty progress defaults to a new player and Cube Count', () => {
  assert.equal(hasCompletedPlay(), false);
  assert.deepEqual(homePrimaryAction(), { kind: 'first', game: gameById('cube') });
});

for (const [name, state] of [
  ['onboarding XP only', { profile: { xp: 25, xpEvents: [{ source: 'onboarding', sourceId: 'welcome-v115', amount: 25 }] } }],
  ['game visits only', { history: [{ id: 'maze', time: NOW }, { id: 'matrix', time: NOW - 1000 }] }],
  ['onboarding XP and visits without completions', {
    profile: { xp: 25, completions: 0, perGame: { maze: { completions: 0 } } },
    history: [{ id: 'maze', time: NOW }],
  }],
]) {
  test(`${name} still counts as a new player`, () => {
    assert.equal(hasCompletedPlay(state.profile), false);
    assert.deepEqual(homePrimaryAction({ ...state, dailyGameId: 'prime', pinnedGames: ['matrix'] }), {
      kind: 'first', game: gameById('cube'),
    });
  });
}

for (const [name, state] of [
  ['profile completions', { profile: { completions: 1 } }],
  ['per-game completions', { profile: { completions: 0, perGame: { cube: { completions: 0 }, maze: { completions: 1 } } } }],
  ['match history', { matches: [{ gameId: 'rps', outcome: 'loss' }] }],
]) {
  test(`${name} counts as returning even without XP`, () => {
    assert.equal(hasCompletedPlay(state.profile, state.matches), true);
    assert.deepEqual(homePrimaryAction({ ...state, dailyGameId: 'prime' }), {
      kind: 'daily', game: gameById('prime'),
    });
  });
}

test('missing, zero and negative per-game completions are not completed play', () => {
  const profile = { completions: 0, perGame: { cube: null, maze: undefined, matrix: {}, prime: { completions: 0 }, rps: { completions: -1 } } };
  assert.equal(hasCompletedPlay(profile, []), false);
});

test('valid recovery has priority over first play, unfinished daily and next game', () => {
  const states = [
    {},
    { profile: { completions: 1 }, dailyGameId: 'prime' },
    { matches: [{ gameId: 'rps' }], dailyGameId: 'prime', dailyCompleted: true, pinnedGames: ['matrix'], history: [{ id: 'cube' }] },
  ];
  for (const game of GAMES) {
    const recoverySession = { gameId: game.id, challengeCode: createChallengeCode(game.id, `home-recovery-${game.id}`) };
    for (const state of states) {
      assert.deepEqual(homePrimaryAction({ ...state, recoverySession }), { kind: 'recovery', game }, game.id);
    }
  }
});

for (const [name, recoverySession] of [
  ['wrong-game challenge', { gameId: 'maze', challengeCode: createChallengeCode('cube', 'wrong-game') }],
  ['unknown game', { gameId: 'not-a-game', challengeCode: createChallengeCode('maze', 'unknown-game') }],
  ['missing game', { challengeCode: createChallengeCode('maze', 'missing-game') }],
  ['invalid challenge format', { gameId: 'maze', challengeCode: 'not-a-challenge' }],
  ['truncated challenge', { gameId: 'maze', challengeCode: 'BA-MAZE-X' }],
  ['missing challenge', { gameId: 'maze' }],
  ['empty challenge', { gameId: 'maze', challengeCode: '' }],
  ['null recovery', null],
]) {
  test(`${name} recovery is ignored without blocking the normal action`, () => {
    assert.deepEqual(homePrimaryAction({ recoverySession, dailyGameId: 'prime' }), {
      kind: 'first', game: gameById('cube'),
    });
    assert.deepEqual(homePrimaryAction({ recoverySession, profile: { completions: 1 }, dailyGameId: 'prime', pinnedGames: ['matrix'] }), {
      kind: 'daily', game: gameById('prime'),
    });
    assert.deepEqual(homePrimaryAction({ recoverySession, profile: { completions: 1 }, dailyGameId: 'prime', dailyCompleted: true, pinnedGames: ['matrix'] }), {
      kind: 'next', game: gameById('matrix'),
    });
  });
}

test('returning player gets an unfinished daily before pinned or recent games', () => {
  const state = { profile: { completions: 1 }, dailyGameId: 'prime', pinnedGames: ['matrix'], history: [{ id: 'maze' }] };
  assert.deepEqual(homePrimaryAction(state), { kind: 'daily', game: gameById('prime') });
  assert.deepEqual(homePrimaryAction({ ...state, dailyCompleted: false }), { kind: 'daily', game: gameById('prime') });
});

test('returning player with daily done gets a pinned game, then a recent game', () => {
  const state = { profile: { completions: 1 }, dailyGameId: 'prime', dailyCompleted: true, history: [{ id: 'maze' }] };
  assert.deepEqual(homePrimaryAction({ ...state, pinnedGames: ['unknown', 'matrix', 'cube'] }), {
    kind: 'next', game: gameById('matrix'),
  });
  assert.deepEqual(homePrimaryAction({ ...state, pinnedGames: ['unknown'] }), {
    kind: 'next', game: gameById('maze'),
  });
});

test('missing or invalid daily game falls through to the next action', () => {
  for (const dailyGameId of [undefined, null, '', 'not-a-game']) {
    assert.deepEqual(homePrimaryAction({ profile: { completions: 1 }, dailyGameId, pinnedGames: ['maze'] }), {
      kind: 'next', game: gameById('maze'),
    });
  }
});

test('next action recommends the first uncompleted catalog game or Cube Count when all are complete', () => {
  const perGame = { [GAMES[0].id]: { completions: 1 } };
  assert.deepEqual(homePrimaryAction({ profile: { completions: 1, perGame }, dailyCompleted: true }), {
    kind: 'next', game: GAMES[1],
  });
  const allCompleted = Object.fromEntries(GAMES.map(game => [game.id, { completions: 1 }]));
  assert.deepEqual(homePrimaryAction({ profile: { perGame: allCompleted }, dailyCompleted: true }), {
    kind: 'next', game: gameById('cube'),
  });
});

test('home choices default to an empty recent list', () => {
  assert.deepEqual(homeChoices(), { source: 'recent', games: [] });
  assert.deepEqual(homeChoices(['unknown'], [{ id: 'unknown' }]), { source: 'recent', games: [] });
});

test('home choices deduplicate and discard invalid pins before taking the first three', () => {
  const result = homeChoices(['unknown', 'matrix', 'matrix', null, 'cube', 'maze', 'prime'], [{ id: 'rps' }]);
  assert.equal(result.source, 'pinned');
  assert.deepEqual(ids(result.games), ['matrix', 'cube', 'maze']);
  assert.deepEqual(result.games, ['matrix', 'cube', 'maze'].map(gameById));
});

test('any valid pin takes priority without filling remaining choices from history', () => {
  assert.deepEqual(homeChoices(['unknown', 'matrix', 'matrix'], [{ id: 'maze' }, { id: 'cube' }]), {
    source: 'pinned', games: [gameById('matrix')],
  });
});

test('without valid pins, recent choices preserve order, deduplicate and cap at three', () => {
  const history = ['unknown', 'maze', 'maze', 'cube', 'matrix', 'prime'].map((id, index) => ({ id, time: NOW - index }));
  const result = homeChoices(['unknown', null, ''], history);
  assert.equal(result.source, 'recent');
  assert.deepEqual(ids(result.games), ['maze', 'cube', 'matrix']);
});

test('home preview defaults to the first six catalog games', () => {
  assert.deepEqual(homePreview(), GAMES.slice(0, 6));
});

test('home preview puts at most three unique pins first and fills from the catalog up to six', () => {
  const result = homePreview('all', ['unknown', 'matrix', 'matrix', 'cube', 'maze', 'nonogram'], [{ id: 'rps' }]);
  assert.deepEqual(ids(result), ['matrix', 'cube', 'maze', '300', 'prime', 'pixel']);
  assert.equal(result.length, 6);
  assert.equal(new Set(ids(result)).size, result.length);
});

test('home preview uses recent choices when there are no valid pins', () => {
  const history = ['matrix', 'matrix', 'maze', 'cube', 'nonogram'].map(id => ({ id }));
  assert.deepEqual(ids(homePreview('all', ['unknown'], history)), ['matrix', 'maze', 'cube', '300', 'prime', 'pixel']);
});

test('home preview filters every category before limiting results and keeps priority order', () => {
  const pinnedGames = ['matrix', 'nonogram', 'game2048'];
  for (const category of new Set(GAMES.map(game => game.category))) {
    const result = homePreview(category, pinnedGames);
    const priority = pinnedGames.map(gameById).filter(game => game.category === category);
    const rest = GAMES.filter(game => game.category === category && !pinnedGames.includes(game.id));
    assert.deepEqual(result, [...priority, ...rest].slice(0, 6), category);
    assert.ok(result.length <= 6, category);
    assert.ok(result.every(game => game.category === category), category);
    assert.equal(new Set(ids(result)).size, result.length, category);
  }
  assert.deepEqual(homePreview('not-a-category', pinnedGames), []);
});

test('home choices and previews are deterministic and do not mutate inputs or the catalog', () => {
  const pinnedGames = deepFreeze(['unknown', 'matrix', 'matrix', 'cube', 'maze', 'prime']);
  const history = deepFreeze([{ id: 'nonogram', time: NOW, metadata: { visits: 2 } }, { id: 'matrix', time: NOW - 1 }]);
  const before = structuredClone({ pinnedGames, history, catalog: GAMES });
  for (const pins of [pinnedGames, deepFreeze(['unknown']), deepFreeze([])]) {
    const choices = homeChoices(pins, history);
    const preview = homePreview('all', pins, history);
    for (let repeat = 0; repeat < 3; repeat += 1) {
      assert.deepEqual(homeChoices(pins, history), choices);
      assert.deepEqual(homePreview('all', pins, history), preview);
      homePreview('logic', pins, history);
    }
  }
  assert.deepEqual({ pinnedGames, history, catalog: GAMES }, before);
});

test('primary action does not mutate profile, matches, recovery, pins or history', () => {
  const state = deepFreeze({
    profile: { completions: 1, perGame: { maze: { completions: 1 } } },
    matches: [{ gameId: 'maze', outcome: 'completed' }],
    recoverySession: { gameId: 'maze', challengeCode: createChallengeCode('maze', 'immutable'), lastSavedAt: NOW - 1000 },
    dailyGameId: 'prime', dailyCompleted: false,
    pinnedGames: ['matrix'], history: [{ id: 'cube', time: NOW }],
  });
  const before = structuredClone(state);
  for (const recoverySession of [state.recoverySession, undefined]) {
    for (const dailyCompleted of [false, true]) {
      homePrimaryAction({ ...state, recoverySession, dailyCompleted });
    }
  }
  assert.deepEqual(state, before);
});

test('recovery saved-at formats the actual timestamp in the selected locale', () => {
  const timestamp = NOW - 86400000;
  for (const [lang, locale] of [['id', 'id-ID'], ['en', 'en-GB'], ['unknown', 'id-ID']]) {
    const expected = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
    assert.equal(recoverySavedAt(timestamp, lang, NOW), expected);
    assert.equal(recoverySavedAt(String(timestamp), lang, NOW), expected);
  }
  assert.equal(recoverySavedAt(timestamp, undefined, NOW), recoverySavedAt(timestamp, 'id', NOW));
  assert.equal(recoverySavedAt(NOW, 'en', NOW), new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(NOW));
});

for (const [name, timestamp] of [
  ['missing', undefined], ['null', null], ['empty', ''], ['whitespace', '   '],
  ['zero', 0], ['negative', -1], ['not a number', NaN], ['infinity', Infinity],
  ['negative infinity', -Infinity], ['nonnumeric string', 'not-a-timestamp'],
  ['future', NOW + 1], ['future numeric string', String(NOW + 1)],
  ['plain object', {}], ['empty array', []], ['false', false],
  ['true', true], ['numeric array', [NOW - 1000]],
]) {
  test(`recovery saved-at returns no fake time for an invalid ${name} timestamp`, () => {
    for (const lang of ['id', 'en']) {
      assert.equal(recoverySavedAt(timestamp, lang, NOW), null);
    }
  });
}
