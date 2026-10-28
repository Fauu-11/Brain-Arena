import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GAMES, resolveRoute, routeHash } from '../src/data/games.js';
import { PRIMARY_NAVIGATION, FOOTER_NAVIGATION, NAVIGATION_DESTINATIONS, getActiveNavId, isNavActive } from '../src/data/navigation.js';

const DESTINATION_GROUPS = {
  home:['home'],
  games:['games','favorites'],
  challenges:['challenges','daily','daily-archive','arena-run','arena-cup','events','season','leaderboard','arena-builder','practice-lab','challenge'],
  progress:['progress','activity','history','replay','achievements','missions','rank','mastery','completion','statistics','activity-calendar','goals'],
  guides:['guides'],
  settings:['settings','controls','offline','save-slots','storage-center','data-health','diagnostics','cloud-readiness','feedback'],
  profile:['profile','customize','profiles','showcase','share-result'],
};
const EXPECTED_PARENTS = Object.fromEntries(Object.entries(DESTINATION_GROUPS).flatMap(([parent, ids]) => ids.map(id => [id, parent])));
const NAV_ITEMS = [...PRIMARY_NAVIGATION, ...FOOTER_NAVIGATION];
const PAGE_ALIASES = {
  games:['permainan'], favorites:['favorit'], challenges:['tantangan'], progress:['progres'],
  activity:['aktivitas'], guides:['panduan','tips'], daily:['harian'], 'daily-archive':['arsip'],
  profile:['profil'], achievements:['pencapaian','badges'], missions:['misi','quests'],
  leaderboard:['peringkat'], rank:['ranking'], customize:['kustomisasi'], statistics:['statistik'],
  'activity-calendar':['calendar','kalender'], season:['musim'], events:['event'], mastery:['penguasaan'],
  settings:['pengaturan'], feedback:['saran','masukan'], 'arena-run':['tournament','turnamen'],
  'arena-builder':['builder'], history:['riwayat'], completion:['koleksi'], 'data-health':['health'],
  goals:['target'], profiles:['pemain'], 'share-result':['share'], 'arena-cup':['cup'],
  'practice-lab':['lab'], 'save-slots':['saves'], 'storage-center':['storage'],
  diagnostics:['diagnostic'], 'cloud-readiness':['cloud','supabase'], controls:['controller'],
};

function assertActiveNav(value, expected) {
  assert.equal(getActiveNavId(value), expected, `${value}: active parent`);
  for (const item of NAV_ITEMS) {
    assert.equal(isNavActive(item.id, value), item.id === expected, `${value}: ${item.id} active state`);
  }
  assert.equal(isNavActive('not-found', value), false);
}

test('navigation keeps five primary items and settings/profile in the footer', () => {
  assert.deepEqual(PRIMARY_NAVIGATION.map(item => item.id), ['home','games','challenges','progress','guides']);
  assert.deepEqual(FOOTER_NAVIGATION.map(item => item.id), ['settings','profile']);
  assert.equal(new Set(NAV_ITEMS.map(item => item.id)).size, NAV_ITEMS.length);
});

test('navigation destinations are unique, complete and have the expected visible parent', () => {
  const ids = NAVIGATION_DESTINATIONS.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), Object.keys(EXPECTED_PARENTS).sort());
  for (const item of NAVIGATION_DESTINATIONS) {
    assert.equal(item.parent, EXPECTED_PARENTS[item.id], `${item.id}: parent`);
    assert.ok(NAV_ITEMS.some(nav => nav.id === item.parent), `${item.id}: parent must be visible`);
  }
});

for (const item of NAVIGATION_DESTINATIONS) {
  test(`Navigation destination resolves and activates its parent: ${item.id}`, () => {
    assert.equal(resolveRoute(routeHash(item.id)), item.id);
    for (const value of [item.id, `#/${item.id}`, `#${item.id}/`, `#/${item.id}/?source=navigation`]) {
      assert.equal(resolveRoute(value), item.id, `${value}: canonical view`);
      assertActiveNav(value, EXPECTED_PARENTS[item.id]);
    }
    assertActiveNav(routeHash(item.id), EXPECTED_PARENTS[item.id]);
  });
}

for (const [view, alias] of [['challenges','tantangan'], ['progress','progres']]) {
  test(`Hub route and localized alias: ${view}`, () => {
    assert.equal(routeHash(view), `#/${view}`);
    for (const path of [view, alias]) {
      const encoded = `%${path.charCodeAt(0).toString(16)}${path.slice(1)}`;
      for (const value of [path, `#/${path}`, `#${path}/`, `#/${path}/?source=hub`, `#/${encoded}`]) {
        assert.equal(resolveRoute(value), view, `${value}: hub view`);
        assert.equal(routeHash(resolveRoute(value)), `#/${view}`);
        assertActiveNav(value, view);
      }
    }
  });
}

test('App lazily registers and renders both navigation hubs', async () => {
  const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  for (const [view, component] of [['challenges','Challenges'], ['progress','Progress']]) {
    assert.match(source, new RegExp(`const ${component}\\s*=\\s*lazy\\(\\(\\)\\s*=>\\s*import\\(['"]\\./pages/${component}\\.jsx['"]\\)\\)`));
    assert.match(source, new RegExp(`view\\s*===\\s*['"]${view}['"]\\)\\s*content\\s*=\\s*<${component}\\s+onNavigate=\\{navigate\\}\\s*/>`));
  }
});

test('legacy page aliases preserve their canonical route and active parent', () => {
  for (const [view, aliases] of Object.entries(PAGE_ALIASES)) {
    for (const alias of aliases) {
      for (const value of [alias, `#/${alias}`, `#${alias}/`, `#/${alias}/?source=legacy`]) {
        assert.equal(resolveRoute(value), view, `${value}: canonical view`);
        assert.equal(routeHash(resolveRoute(value)), routeHash(view));
        assertActiveNav(value, EXPECTED_PARENTS[view]);
      }
    }
  }
});

for (const game of GAMES) {
  test(`Game routes activate Games and tips activate Guides: ${game.id}`, () => {
    assert.equal(routeHash(game.id), `#/${game.slug}`);
    assertActiveNav(routeHash(game.id), 'games');
    for (const path of [game.id, game.slug, `game-${game.id}`, `game-${game.slug}`]) {
      for (const value of [path, `#/${path}`, `#${path}/`, `#/${path}/?source=catalog`]) {
        assert.equal(resolveRoute(value), game.id);
        assertActiveNav(value, 'games');
      }
    }
    for (const path of [`tips-${game.id}`, `tips-${game.slug}`]) {
      for (const value of [path, `#/${path}`, `#${path}/`, `#/${path}/?source=guide`]) {
        assert.equal(resolveRoute(value), `tips-${game.id}`);
        assertActiveNav(value, 'guides');
      }
    }
    assert.equal(resolveRoute(routeHash(`tips-${game.id}`)), `tips-${game.id}`);
  });
}

test('home shortcuts and shared challenge links activate their parent', () => {
  assert.equal(routeHash('home'), '#/');
  assertActiveNav(undefined, 'home');
  for (const value of ['', '#', '#/', '#/home', '#/home/?source=bookmark']) {
    assert.equal(resolveRoute(value), 'home');
    assertActiveNav(value, 'home');
  }
  for (const value of ['challenge/seed-123', '#/challenge/seed-123', '#/challenge/seed-123/?source=share', '#/challenge%2Fseed-123']) {
    assert.equal(resolveRoute(value), 'challenge');
    assertActiveNav(value, 'challenges');
  }
});

test('unknown and malformed routes never activate a navigation item', () => {
  for (const value of ['#/404', '#/%ZZ', '#/%E0%A4%A', '#/constructor', '#/__proto__', '#/toString', '#/tips-unknown', '#/game-unknown', '#/challenges/unknown', '#/progress/unknown']) {
    assert.equal(resolveRoute(value), 'not-found', value);
    assertActiveNav(value, null);
  }
  for (const value of [null, false, 0, {}, []]) assertActiveNav(value, null);
});
