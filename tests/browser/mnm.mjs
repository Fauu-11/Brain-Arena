import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { preview } from 'vite';

const modulePath = process.argv.find(arg => arg.startsWith('--playwright='))?.slice(13);
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
let server;
let browser;
let baseURL;
const errors = [];
const levels = [
  { level: 0, pairs: 6, cols: 2, chips: 4, target: 4 },
  { level: 1, pairs: 12, cols: 3, chips: 3, target: 7 },
  { level: 2, pairs: 16, cols: 3, chips: 4, target: 9 },
  { level: 3, difficulty: 0, pairs: 20, cols: 3, chips: 5, target: 11 },
  { level: 3, difficulty: 1, pairs: 30, cols: 4, chips: 4, target: 16 },
  { level: 3, difficulty: 2, pairs: 45, cols: 4, chips: 6, target: 23 },
];

async function start(page, spec, mode = 'pvp') {
  await page.goto(`${baseURL}#/home`);
  await page.waitForSelector('.home-refresh');
  await page.goto(`${baseURL}#/mnm-grid`);
  await page.waitForSelector('.play-setup-actions');
  await page.locator('.play-levels button').nth(spec.level).click();
  if (spec.level === 3) await page.locator('.play-university-difficulty button').nth(spec.difficulty).click();
  await page.locator(`.play-setup-actions .uw-btn-${mode === 'pve' ? 'primary' : 'secondary'}`).click();
  await page.waitForTimeout(100);
  assert.deepEqual(errors, [], 'Starting MnM must not throw');
  await page.waitForSelector('.memory-phase .mnm-board');
  return page.locator('.mnm-board button').evaluateAll(buttons => buttons.map(button => ({ label: button.getAttribute('aria-label').split(':')[0], number: Number(button.textContent) })));
}
async function conceal(page) {
  await page.locator('.memory-phase .uw-btn').click();
  await page.waitForSelector('.play-player.player-1.active');
  assert.equal(await page.locator('.mnm-board button').evaluateAll(buttons => buttons.every(button => !button.textContent)), true);
}
async function flip(page, chip) {
  await page.locator(`.mnm-board button[aria-label^="${chip.label}:"]`).click();
}
async function slidableTile(page) {
  const tiles = page.locator('.mnm-board > div').filter({ hasText: 'SLIDE' });
  await tiles.first().waitFor();
  return tiles.first();
}
async function score(page, player, expected) {
  await page.waitForFunction(({ player, expected }) => document.querySelector(`.play-player.player-${player} > strong`)?.firstChild?.textContent === String(expected), { player, expected });
}

try {
  server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
  baseURL = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('ba_onboarding_v1', JSON.stringify({ completedAt: 1 }));
    localStorage.setItem('ba_accessibility_v1', JSON.stringify({ theme: 'dark', reducedMotion: true }));
    localStorage.setItem('ba_muted', 'true');
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));

  for (const spec of levels) {
    const chips = await start(page, spec);
    assert.equal(chips.length, spec.pairs * 2);
    const counts = new Map();
    for (const chip of chips) counts.set(chip.number, (counts.get(chip.number) || 0) + 1);
    assert.equal(counts.size, spec.pairs);
    assert.ok([...counts.values()].every(count => count === 2), 'Every number has exactly one partner');
    assert.equal(await page.locator('.mnm-board > div').count(), spec.cols ** 2);
    assert.equal(await page.locator('.mnm-board > div').evaluateAll((tiles, chipsPerTile) => tiles.filter(tile => tile.querySelector('button')).every(tile => tile.querySelectorAll('button').length === chipsPerTile), spec.chips), true);
    assert.equal(await page.locator('.mnm-board > div').evaluateAll(tiles => tiles.filter(tile => !tile.querySelector('button')).length), 1);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('.arena-game *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => `${el.tagName}.${el.className}`).slice(0, 8) }));
    assert.ok(overflow.scrollWidth <= overflow.width, `No overflow for level ${spec.level}/${spec.difficulty}: ${JSON.stringify(overflow)}`);
    await conceal(page);
    const pair = chips.filter(chip => chip.number === 1);
    await flip(page, pair[0]);
    await flip(page, pair[1]);
    await score(page, 1, 1);
    assert.equal(await page.locator('.play-player.player-1.active').count(), 1, 'Matching keeps the turn');
    await page.getByRole('button', { name: /Mulai Ulang/ }).click();
    await page.waitForSelector('.memory-phase');
    assert.equal(await page.locator('.mnm-board button').count(), spec.pairs * 2, 'Restart rebuilds the configured board');
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  console.log('All six levels: correct pairs, one empty tile, matching, restart and mobile layout passed');

  const chips = await start(page, levels[0]);
  await conceal(page);
  await flip(page, chips[0]);
  await flip(page, chips.find(chip => chip.number !== chips[0].number));
  await page.waitForFunction(() => document.querySelector('.mnm-phase-notice')?.textContent.includes('GESER'));
  const tile = await slidableTile(page);
  await tile.click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('.play-player.player-2.active');
  await page.waitForFunction(() => document.querySelector('.mnm-phase-notice')?.textContent.includes('BUKA 2'));
  const pairs = chips.filter(chip => chip.number === 2);
  await flip(page, pairs[0]);
  await flip(page, pairs[1]);
  await score(page, 2, 1);
  console.log('Local duel: mismatch, tile slide, turn switch and player-two scoring passed');

  const aiChips = await start(page, levels[0], 'pve');
  await conceal(page);
  await flip(page, aiChips[0]);
  await flip(page, aiChips.find(chip => chip.number !== aiChips[0].number));
  const aiSlide = await slidableTile(page);
  await aiSlide.click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('.play-player.player-2.active');
  await page.waitForFunction(() => [...document.querySelectorAll('.mnm-board button')].some(button => button.textContent.trim()), null, { timeout: 4000 });
  console.log('AI begins flipping after the player slides a tile');
  await page.evaluate(() => { Math.random = () => 0.5; });
  const waitForHumanOrEnd = () => page.waitForFunction(() => document.querySelector('.arena-game[data-state="ended"]') || (document.querySelector('.arena-game[data-state="match"] .play-player.player-1.active') && document.querySelector('.mnm-board button:enabled')), null, { timeout: 15000 });
  await waitForHumanOrEnd();
  let aiScore = await page.locator('.play-player.player-2 > strong').count() ? Number(await page.locator('.play-player.player-2 > strong').evaluate(el => el.firstChild.textContent)) : levels[0].target;
  for (let step = 0; step < 12 && aiScore < 2; step++) {
    const enabled = await page.locator('.mnm-board button:enabled').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label').split(':')[0]));
    const available = aiChips.filter(chip => enabled.includes(chip.label));
    const first = available[step % available.length];
    const second = available.find(chip => chip.number !== first.number);
    await flip(page, first);
    await flip(page, second);
    const nextTile = await slidableTile(page);
    await nextTile.click({ position: { x: 10, y: 10 } });
    await page.waitForSelector('.play-player.player-2.active');
    await waitForHumanOrEnd();
    aiScore = await page.locator('.play-player.player-2 > strong').count() ? Number(await page.locator('.play-player.player-2 > strong').evaluate(el => el.firstChild.textContent)) : levels[0].target;
  }
  assert.ok(aiScore >= 2, 'AI remembers pairs, accumulates points and completes its turns');
  console.log('AI matching, accumulated scores and automatic sliding passed');

  const winningChips = await start(page, levels[0]);
  await conceal(page);
  for (let number = 1; number <= levels[0].target; number++) {
    const pair = winningChips.filter(chip => chip.number === number);
    await flip(page, pair[0]);
    await flip(page, pair[1]);
    if (number < levels[0].target) await score(page, 1, number);
  }
  await page.waitForSelector('.arena-game[data-state="ended"] .play-result');
  assert.match(await page.locator('.play-result h2').textContent(), /Pemain 1 menang/);
  assert.equal(await page.locator('.play-result-scores .winner > strong').textContent(), String(levels[0].target));
  await page.getByRole('button', { name: 'Main lagi', exact: true }).click();
  await page.waitForSelector('.memory-phase');
  console.log('Winning and playing again passed');

  const pendingChips = await start(page, levels[0]);
  await conceal(page);
  const pendingPair = pendingChips.filter(chip => chip.number === 1);
  await flip(page, pendingPair[0]);
  await flip(page, pendingPair[1]);
  await page.getByRole('button', { name: /Mulai Ulang/ }).click();
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.memory-phase .mnm-board button').evaluateAll(buttons => buttons.length === 12 && buttons.every(button => button.textContent.trim())), true, 'A pending match must not modify a restarted board');

  const pendingAI = await start(page, levels[0], 'pve');
  await conceal(page);
  await flip(page, pendingAI[0]);
  await flip(page, pendingAI.find(chip => chip.number !== pendingAI[0].number));
  const pendingSlide = await slidableTile(page);
  await pendingSlide.click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('.play-player.player-2.active');
  await page.getByRole('button', { name: /Mulai Ulang/ }).click();
  await page.waitForTimeout(2000);
  assert.equal(await page.locator('.memory-phase .mnm-board button').evaluateAll(buttons => buttons.length === 12 && buttons.every(button => button.textContent.trim())), true, 'Pending AI actions must be cancelled on restart');
  console.log('Restart cancels pending matches and AI actions');

  await conceal(page);
  await page.locator('.mnm-board button:enabled').first().click();
  await page.waitForSelector('.arena-game[data-state="mix"]', { timeout: 14000 });
  assert.equal(await page.locator('.mnm-board button').evaluateAll(buttons => buttons.every(button => !button.textContent.trim())), true, 'Timeout conceals the selected chip');
  const timeoutSlide = await slidableTile(page);
  await timeoutSlide.click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('.play-player.player-2.active');
  await page.waitForFunction(() => [...document.querySelectorAll('.mnm-board button')].some(button => button.textContent.trim()), null, { timeout: 4000 });
  console.log('Timeout transitions to Mix and the next AI turn still runs');
  assert.deepEqual(errors, [], 'No MnM browser runtime errors');
  await context.close();
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
