import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { preview } from 'vite';

// Uses an optional Playwright installation, without adding a runtime dependency.
const modulePath = process.argv.find(arg => arg.startsWith('--playwright='))?.slice(13);
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const audit = process.argv.includes('--audit');
const skipGameplay = new Set(process.argv.find(arg => arg.startsWith('--skip-gameplay='))?.slice(16).split(',') || []);
let server;
let browser;
let baseURL;
const errors = [];
const routes = ['home', 'games', 'challenges', 'progress', 'activity', 'guides', 'daily', 'profile', 'achievements', 'missions', 'leaderboard', 'rank', 'customize', 'statistics', 'activity-calendar', 'season', 'events', 'mastery', 'settings', 'arena-run', 'history', 'replay', 'completion', 'feedback', 'challenge', 'arena-builder', 'daily-archive', 'data-health', 'offline', 'goals', 'profiles', 'showcase', 'share-result', 'arena-cup', 'practice-lab', 'save-slots', 'storage-center', 'diagnostics', 'cloud-readiness', 'controls', 'tips-sudoku', '300', 'prime', 'pixel', 'mnm', 'cube', 'rps', 'sudoku', 'minesweeper', 'maze', 'matrix', 'nonogram', 'game2048'];

async function visit(page, route) {
  await page.goto(`${baseURL}#/${route}`);
  await page.waitForSelector('.ba-app');
  await page.waitForFunction(() => document.querySelector('.main-content')?.children.length && !document.querySelector('.loading-state'));
  await page.waitForTimeout(250);
}

async function brightSurfaces(page) {
  return page.evaluate(() => {
    const results = new Set();
    for (const el of document.querySelectorAll('body *')) {
      if (!(el instanceof HTMLElement) || !el.checkVisibility() || el.getBoundingClientRect().width < 12 || el.getBoundingClientRect().height < 12) continue;
      // Artwork, QR contrast, MnM revealed chips, and colored puzzle pieces are intentional.
      if (el.matches('.skip-link, .share-qr img, .memory-cell.memory-on > span, .mnm-board > div > button') || el.closest('.game-artwork, .hero-artwork, .pixel-board, .pixel-palette, .mnm-heap, .dice-visual, .g2048-board')) continue;
      const style = getComputedStyle(el);
      const paints = [style.backgroundColor, ...(style.backgroundImage.match(/rgba?\([^)]+\)/g) || [])];
      if (paints.some(paint => {
        const [r, g, b, a = 1] = paint.match(/[\d.]+/g).map(Number);
        return a * Number(style.opacity) > .5 && Math.min(r, g, b) > 175;
      })) results.add(`${el.tagName.toLowerCase()}.${String(el.className).trim().replace(/\s+/g, '.')}`);
    }
    return [...results];
  });
}

async function checkCompactNavigation(page, theme) {
  await visit(page, 'home');
  await page.locator('.sidebar-toggle').click();
  await page.waitForSelector('.sidebar-collapsed .sidebar-rail');
  for (const width of [1440, 1024, 820]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const rail = page.locator('.sidebar-rail');
    assert.equal(await rail.isVisible(), true, `${theme}: compact rail at ${width}px`);
    assert.deepEqual(await brightSurfaces(page), [], `${theme}: compact rail surfaces at ${width}px`);
    const active = rail.locator('.navigation-primary .navigation-item.active');
    const inactive = rail.locator('.navigation-primary .navigation-item:not(.active)').first();
    const activeBackground = await active.evaluate(el => getComputedStyle(el).backgroundColor);
    const inactiveBackground = await inactive.evaluate(el => getComputedStyle(el).backgroundColor);
    assert.notEqual(activeBackground, inactiveBackground, `${theme}: compact rail active at ${width}px`);
    await inactive.hover();
    await page.waitForTimeout(250);
    assert.deepEqual(await brightSurfaces(page), [], `${theme}: compact rail hover at ${width}px`);
    assert.notEqual(await inactive.evaluate(el => getComputedStyle(el).backgroundColor), inactiveBackground, `${theme}: compact rail hover differs from base at ${width}px`);
    await page.mouse.move(0, 0);
  }
  await page.reload();
  await page.waitForSelector('.sidebar-collapsed .sidebar-rail');
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => localStorage.getItem('ba_sidebar_collapsed')), '1');
  assert.deepEqual(await brightSurfaces(page), [], `${theme}: compact rail after reload`);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.sidebar-toggle').click();
  await page.waitForSelector('.sidebar-expanded .sidebar');
  await page.waitForTimeout(250);
  console.log(`${theme}: compact rail, active/hover, responsive widths and persistence passed`);
}

try {
  server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
  baseURL = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });
  for (const theme of ['dark', 'system']) {
    const context = await browser.newContext({ colorScheme: theme === 'system' ? 'dark' : 'light', viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
    await context.addInitScript(theme => {
      if (!localStorage.getItem('ba_accessibility_v1')) localStorage.setItem('ba_accessibility_v1', JSON.stringify({ theme }));
      localStorage.setItem('ba_onboarding_v1', JSON.stringify({ completedAt: 1 }));
    }, theme);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
    await checkCompactNavigation(page, theme);
    const failures = [];
    for (const route of routes) {
      await visit(page, route);
      assert.equal(await page.locator('html').getAttribute('data-ba-effective-theme'), 'dark', `${theme}/${route}`);
      const bright = await brightSurfaces(page);
      if (bright.length) failures.push({ route, bright });
      if (route === 'sudoku') {
        await page.locator('.play-rules-link').click();
        await page.waitForSelector('.rules-dialog[open]');
        if (!audit) assert.deepEqual(await brightSurfaces(page), [], 'Game rules dialog');
        await page.keyboard.press('Escape');
      }
      if (routes.indexOf(route) >= routes.indexOf('300') && !skipGameplay.has(route)) {
        await page.locator('.play-setup-actions .uw-btn-primary').click();
        if (route === '300') await page.locator('.arithmetic-config .uw-btn-primary').click();
        await page.waitForTimeout(250);
        assert.ok(await page.locator('.play-stage-body > :visible').count() > 0, `${theme}/${route}: game content must not be empty after starting`);
        if (route === 'rps') {
          assert.equal(await page.locator('.rps-net-face').count(), 6, 'Dice Duel must show its memorization net');
          if (!audit) assert.deepEqual(await brightSurfaces(page), [], `${theme}/rps/memorization`);
          await page.locator('.rps-start-button').click();
          await page.waitForSelector('.rps-gameplay');
          assert.equal(await page.locator('.rps-cell').count(), 49, 'Dice Duel must show its playing board');
        }
        const playingBright = await brightSurfaces(page);
        if (playingBright.length) failures.push({ route: `${route}/playing`, bright: playingBright });
      }
    }
    console.log(`${theme}: ${routes.length} routes checked`, JSON.stringify(failures));
    if (skipGameplay.size) console.log(`Gameplay explicitly skipped: ${[...skipGameplay].join(', ')}`);
    if (!audit) assert.deepEqual(failures, [], `${theme}: light surfaces remain`);
    await visit(page, 'home');
    await page.keyboard.press('Control+k');
    await page.waitForSelector('.command-dialog[open]');
    const dialogBright = await brightSurfaces(page);
    console.log(`${theme}: command dialog`, dialogBright);
    if (!audit) assert.deepEqual(dialogBright, []);
    await page.keyboard.press('Escape');
    await page.locator('.notification-button').click();
    await page.waitForSelector('.notification-dialog[open]');
    if (!audit) assert.deepEqual(await brightSurfaces(page), []);
    await page.keyboard.press('Escape');
    await page.locator('.help-button').click();
    await page.waitForSelector('.ba-dialog[open]');
    if (!audit) assert.deepEqual(await brightSurfaces(page), []);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.mobile-menu').click();
    await page.waitForSelector('.mobile-menu-dialog[open]');
    const mobileBright = await brightSurfaces(page);
    console.log(`${theme}: mobile navigation`, mobileBright);
    if (!audit) assert.deepEqual(mobileBright, []);
    await page.keyboard.press('Escape');
    for (const route of ['home', 'challenges', 'progress', 'profile', 'daily', 'statistics', 'settings', 'cloud-readiness', 'tips-sudoku']) {
      await visit(page, route);
      if (!audit) assert.deepEqual(await brightSurfaces(page), [], `${theme}/${route}/mobile`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit(page, 'settings');
    const select = page.locator('.theme-select select').first();
    await select.selectOption('light');
    await page.waitForFunction(() => document.documentElement.dataset.baEffectiveTheme === 'light');
    await page.locator('.sidebar-toggle').click();
    await page.waitForSelector('.sidebar-collapsed .sidebar-rail');
    await page.waitForTimeout(250);
    assert.equal(await page.locator('.sidebar-rail').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'Light sidebar uses an opaque theme surface');
    assert.equal(await page.locator('.settings-panel').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    await page.reload();
    await page.waitForSelector('.settings-page');
    await page.waitForTimeout(250);
    assert.equal(await select.inputValue(), 'light', 'Theme persists after reload');
    await select.selectOption('system');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.baEffectiveTheme === 'dark');
    await page.waitForTimeout(250);
    if (!audit) assert.deepEqual(await brightSurfaces(page), []);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.baEffectiveTheme === 'light');
    await page.waitForTimeout(250);
    assert.equal(await page.locator('.settings-panel').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await page.locator('.sidebar-rail').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'System light sidebar uses an opaque theme surface');
    console.log(`${theme}: light mode, persistence and live system-theme switching passed`);
    await context.close();
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
