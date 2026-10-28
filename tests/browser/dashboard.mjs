import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { preview } from 'vite';

const modulePath = process.argv.find(arg => arg.startsWith('--playwright='))?.slice(13);
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
let server;
let browser;
let baseURL;
const errors = [];

async function contextFor(seed = {}, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', ...options });
  await context.addInitScript(seed => {
    if (localStorage.getItem('dashboard-test-seeded')) return;
    localStorage.setItem('dashboard-test-seeded', '1');
    localStorage.setItem('ba_onboarding_v1', JSON.stringify({ completedAt: 1 }));
    for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }, seed);
  return context;
}
async function pageFor(context) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await visit(page, 'home');
  return page;
}
async function visit(page, route) {
  await page.goto(`${baseURL}#/${route}`);
  await page.waitForSelector('.main-content > :not(.loading-state)');
  await page.waitForTimeout(100);
}
async function noOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1, `${label}: ${JSON.stringify(dimensions)}`);
}
async function homeState(page, state) {
  await page.waitForSelector(`.home-refresh[data-home-state="${state}"]`);
  assert.ok(await page.locator('.dashboard-game-grid .game-card').count() <= 6);
}

try {
  server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
  baseURL = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });

  const freshContext = await contextFor();
  const fresh = await pageFor(freshContext);
  await homeState(fresh, 'first');
  assert.equal(await fresh.locator('.dashboard-choices').count(), 0);
  assert.equal(await fresh.locator('.dashboard-hero .dashboard-primary').textContent(), 'Coba Hitung Kubus');
  assert.equal(await fresh.locator('.sidebar .navigation-primary button').count(), 5);
  assert.equal(await fresh.locator('.sidebar').evaluate(el => el.getBoundingClientRect().width), 240);
  await fresh.getByRole('button', { name: 'Memori', exact: true }).click();
  assert.equal(await fresh.locator('.dashboard-game-grid .game-card').count(), 3);
  await fresh.getByRole('button', { name: 'Semua', exact: true }).click();
  assert.equal(await fresh.locator('.dashboard-game-grid .game-card').count(), 6);
  await fresh.locator('.dashboard-hero .dashboard-primary').click();
  await fresh.waitForSelector('.play-setup-actions');
  assert.ok(fresh.url().includes('kubus-3d'), 'first action opens Cube Count setup');
  await visit(fresh, 'home');
  await homeState(fresh, 'first');
  await freshContext.close();

  const visitedContext = await contextFor({ ba_profile_v1: { xp: 25 }, ba_recent_v2: [{ id: 'prime', time: Date.now() }] });
  const visited = await pageFor(visitedContext);
  await homeState(visited, 'first');
  assert.equal(await visited.locator('.dashboard-choice').count(), 1);
  assert.match(await visited.locator('.dashboard-choice').textContent(), /Buka sesi baru/);
  await visitedContext.close();

  const returningContext = await contextFor({ ba_profile_v1: { xp: 120, completions: 1 } });
  const returning = await pageFor(returningContext);
  await homeState(returning, 'daily');
  await returning.locator('.dashboard-hero .dashboard-primary').click();
  await returning.waitForSelector('.play-setup-actions');
  const setup = await returning.evaluate(() => JSON.parse(localStorage.getItem('ba_competition_setup_v1') || '{}'));
  assert.ok(Object.values(setup.challengeCodes || {}).some(code => /^BA-[A-Z0-9]+-\d{8}$/.test(code)), 'daily action preserves date seed');
  await returningContext.close();

  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const doneContext = await contextFor({ ba_profile_v1: { xp: 200, completions: 2 }, ba_daily_v1: { completedByDate: { [dateKey]: { completedAt: Date.now() } } } });
  const done = await pageFor(doneContext);
  await homeState(done, 'next');
  assert.match(await done.locator('.dashboard-daily h2').textContent(), /selesai/);
  await doneContext.close();

  const savedAt = Date.now() - 3600000;
  const recoveryContext = await contextFor({ ba_recovery_session_v2: { gameId: 'cube', challengeCode: 'BA-CUBE-TEST123', elapsedMs: 60000, lastSavedAt: savedAt, schoolLevel: 'sd', mode: 'practice', actions: [] } });
  const recovery = await pageFor(recoveryContext);
  await homeState(recovery, 'recovery');
  assert.equal(await recovery.locator('.dashboard-saved time').getAttribute('dateTime'), new Date(savedAt).toISOString());
  assert.equal(await recovery.locator('.home-refresh').textContent().then(text => text.includes('BA-CUBE-TEST123')), false, 'seed stays out of the home summary');
  await recovery.locator('.dashboard-recovery-options summary').click();
  await recovery.locator('.dashboard-recovery-options button').click();
  await recovery.waitForSelector('dialog[open]');
  await recovery.getByRole('button', { name: 'Simpan sesi', exact: true }).click();
  await homeState(recovery, 'recovery');
  await recovery.locator('.dashboard-recovery-options button').click();
  await recovery.getByRole('button', { name: 'Ya, buang sesi', exact: true }).click();
  await homeState(recovery, 'first');
  await recovery.waitForFunction(() => document.activeElement?.matches('.dashboard-primary'));
  assert.equal(await recovery.evaluate(() => JSON.parse(localStorage.getItem('ba_recovery_session_v2') || 'null')), null);
  await recoveryContext.close();

  const resumeContext = await contextFor({ ba_recovery_session_v2: { gameId: 'cube', challengeCode: 'BA-CUBE-TEST123', lastSavedAt: savedAt, schoolLevel: 'sma', mode: 'practice', actions: [] } });
  const resume = await pageFor(resumeContext);
  await homeState(resume, 'recovery');
  await resume.locator('.dashboard-primary').click();
  await resume.waitForURL('**/#/kubus-3d');
  await resume.waitForSelector('.game-page');
  const resumedSetup = await resume.evaluate(() => JSON.parse(localStorage.getItem('ba_competition_setup_v1')));
  assert.equal(resumedSetup.challengeCodes.cube, 'BA-CUBE-TEST123');
  assert.equal(resumedSetup.schoolLevels.cube, 'sma');
  await resumeContext.close();

  const invalidContext = await contextFor({ ba_recovery_session_v2: { gameId: 'cube', challengeCode: 'BA-PRIME-TEST123' } });
  const invalid = await pageFor(invalidContext);
  await homeState(invalid, 'first');
  assert.equal(await invalid.locator('.dashboard-recovery-warning').count(), 1);
  await invalid.locator('.dashboard-recovery-warning button').click();
  await invalid.getByRole('button', { name: 'Ya, buang sesi', exact: true }).click();
  assert.equal(await invalid.locator('.dashboard-recovery-warning').count(), 0);
  await invalid.waitForFunction(() => document.activeElement?.matches('.dashboard-primary'));
  await invalidContext.close();

  const pins = ['cube', 'maze', 'matrix', 'prime'];
  const pinnedContext = await contextFor({ ba_pinned_games_v2: pins });
  const pinned = await pageFor(pinnedContext);
  assert.equal(await pinned.locator('.dashboard-choice').count(), 3);
  assert.equal(await pinned.locator('.sidebar .navigation-pin').count(), 3);
  await visit(pinned, 'games');
  assert.equal(await pinned.locator('.pinned-v2-grid article').count(), 4);
  assert.equal(await pinned.locator('.game-grid .game-card').count(), 12);
  await pinned.getByRole('button', { name: 'Naikkan Maze Escape', exact: true }).click();
  await visit(pinned, 'home');
  assert.match(await pinned.locator('.dashboard-choice').first().textContent(), /Maze Escape/);
  assert.deepEqual(await pinned.evaluate(() => JSON.parse(localStorage.getItem('ba_pinned_games_v2'))), ['maze', 'cube', 'matrix', 'prime']);
  await visit(pinned, 'games');
  await pinned.getByLabel('Cari dalam katalog game').fill('sudoku');
  assert.equal(await pinned.locator('.game-grid .game-card').count(), 1);
  await pinned.getByLabel('Filter status', { exact: true }).selectOption('pinned');
  await pinned.waitForSelector('.empty-state');
  assert.equal(await pinned.locator('.random-button').isDisabled(), true);
  await pinned.getByRole('button', { name: 'Reset filter', exact: true }).click();
  assert.equal(await pinned.locator('.game-grid .game-card').count(), 12);
  await pinned.getByLabel('Filter kesulitan', { exact: true }).selectOption('medium');
  assert.equal(await pinned.locator('.game-grid .game-card').count(), 2);
  await pinned.getByLabel('Kategori permainan', { exact: true }).selectOption('logic');
  assert.equal(await pinned.locator('.game-grid .game-card').count(), 1);
  await pinned.getByLabel('Kategori permainan', { exact: true }).selectOption('all');
  await pinned.getByLabel('Filter kesulitan', { exact: true }).selectOption('all');
  const card = pinned.locator('.game-card[data-game="cube"]');
  await card.locator('.game-save summary').click();
  await card.locator('.favorite-button').click();
  assert.equal(await card.locator('.favorite-button').getAttribute('aria-pressed'), 'true');
  await pinned.locator('.catalog-refresh > header button').click();
  await pinned.waitForURL('**/#/favorites');
  await pinned.waitForFunction(() => document.querySelector('.catalog-refresh h1')?.textContent === 'Game favoritmu');
  await pinned.waitForSelector('.game-card[data-game="cube"]');
  assert.equal(await pinned.locator('.game-grid .game-card').count(), 1);
  await pinnedContext.close();

  for (const theme of ['light', 'dark', 'system']) {
    for (const lang of ['id', 'en']) {
      const context = await contextFor({ ba_accessibility_v1: { theme, reducedMotion: true }, uw_lang: lang }, { colorScheme: 'dark' });
      const page = await pageFor(context);
      for (const width of [360, 390, 768, 820, 1024, 1440]) {
        await page.setViewportSize({ width, height: 600 });
        for (const route of ['home', 'games', 'challenges', 'progress']) {
          await visit(page, route);
          await noOverflow(page, `${theme}/${lang}/${route}/${width}`);
          if (width > 800) {
            const sidebar = page.locator(width >= 1200 ? '.sidebar' : '.sidebar-rail');
            assert.equal(await sidebar.isVisible(), true, `automatic sidebar layout at ${width}`);
            assert.equal(await sidebar.locator('.navigation-primary button').count(), 5);
          }
        }
      }
      await page.setViewportSize({ width: 1024, height: 600 });
      await visit(page, 'home');
      const compactItem = page.locator('.sidebar-rail .navigation-primary button').nth(1);
      await compactItem.focus();
      await page.waitForSelector('[role="tooltip"]');
      assert.equal(await compactItem.getAttribute('aria-describedby'), await page.locator('[role="tooltip"]').getAttribute('id'));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[role="tooltip"]').count(), 0);
      await page.locator('.sidebar-toggle').click();
      await page.reload();
      await page.waitForSelector('.sidebar-expanded .sidebar');
      assert.equal(await page.locator('.sidebar').isVisible(), true, 'manual preference persists at tablet width');
      await page.locator('.sidebar .navigation-collapse').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.activeElement?.matches('.sidebar-toggle'));
      await page.locator('.sidebar-toggle').click();
      await visit(page, 'missions');
      assert.equal(await page.locator('.sidebar .navigation-primary [aria-current="page"]').textContent().then(text => text.trim()), lang === 'id' ? 'Progres' : 'Progress');
      await page.setViewportSize({ width: 390, height: 600 });
      await page.locator('.mobile-menu').click();
      const drawer = page.locator('.mobile-menu-dialog[open]');
      await drawer.waitFor();
      assert.equal(await drawer.locator('.navigation-primary button').count(), 5);
      assert.equal(await drawer.locator('.navigation-footer button').count(), 2);
      await noOverflow(page, `${theme}/${lang}/drawer`);
      await page.keyboard.press('Escape');
      assert.equal(await drawer.count(), 0);
      // A 720 CSS-pixel viewport checks reflow equivalent to 200% zoom on a 1440px screen.
      await page.setViewportSize({ width: 720, height: 500 });
      await visit(page, 'home');
      await noOverflow(page, `${theme}/${lang}/200%-reflow`);
      if (process.argv.includes('--screenshots') && lang === 'id' && theme !== 'system') {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: `qa-results/dashboard-${theme}.png`, fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: `qa-results/dashboard-${theme}-mobile.png`, fullPage: true });
      }
      console.log(`${theme}/${lang}: responsive layouts, hubs, keyboard tooltip, drawer and reflow passed`);
      await context.close();
    }
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log('Home states, daily seed, confirmation, pin persistence and favorites passed');
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
