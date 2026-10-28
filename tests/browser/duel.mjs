import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { preview } from 'vite';
import { DIRECTIONS, NET, WIN_SCORE, cubeFromNet, rollCube, isValidPath, projectPath, compareSymbols } from '../../src/utils/duelDice.js';

const modulePath = process.argv.find(arg => arg.startsWith('--playwright='))?.slice(13);
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const configurations = [
  { level: 0 }, { level: 1 }, { level: 2 },
  { level: 3, difficulty: 0 }, { level: 3, difficulty: 1 }, { level: 3, difficulty: 2 },
];
const errors = [];
let browser;
let server;
let baseURL;

async function start(page, spec) {
  await page.goto(`${baseURL}#/home`);
  await page.waitForSelector('.home-refresh');
  await page.goto(`${baseURL}#/suwit`);
  await page.waitForSelector('.play-setup-actions');
  await page.locator('.play-levels button').nth(spec.level).click();
  if (spec.level === 3) await page.locator('.play-university-difficulty button').nth(spec.difficulty).click();
  await page.locator('.play-setup-actions .uw-btn-primary').click();
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.arena-game[data-game="rps"]').getAttribute('data-state'), 'planar', 'Enter arena must render the memorization phase, not an unsupported blank phase');
  assert.equal(await page.locator('.rps-net-face').count(), 6);
  assert.equal(await page.locator('.rps-planar').isVisible(), true);
  const shapes = await page.locator('.rps-net-face').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.dataset.netFace, node.dataset.shape])));
  await page.locator('.rps-start-button').click();
  await page.waitForSelector('.rps-gameplay');
  assert.equal(await page.locator('.rps-cell').count(), 49);
  assert.equal(await page.locator('.rps-die-position').getAttribute('data-position'), '3,0');
  assert.equal(await page.locator('.rps-die').getAttribute('data-top'), shapes.top);
  const arena = await page.locator('.rps-arena').boundingBox();
  assert.ok(arena?.width > 150 && arena?.height > 150, 'The arena must be visible, not merely mounted');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Game fits the viewport');
  return cubeFromNet(NET.map(item => shapes[item.face]));
}

async function playTurn(page, faces, wanted = 'win') {
  const [col, row] = (await page.locator('.rps-die-position').getAttribute('data-position')).split(',').map(Number);
  const position = { col, row };
  const board = await page.locator('.rps-cell').evaluateAll(nodes => nodes.map(node => node.dataset.tile));
  const required = await page.locator('.rps-move-slot').count();
  const turn = Number(await page.locator('.rps-gameplay').getAttribute('data-turn'));
  const options = [];
  function visit(moves, cube) {
    if (moves.length === required) {
      const destination = projectPath(position, moves).at(-1);
      const tile = board[(destination.row - 1) * 7 + destination.col];
      options.push({ moves, cube, destination, outcome: compareSymbols(cube.bottom.shape, tile).outcome });
      return;
    }
    for (const direction of DIRECTIONS) {
      const next = [...moves, direction];
      if (isValidPath(position, next)) visit(next, rollCube(cube, direction));
    }
  }
  visit([], faces);
  const plan = options.find(option => option.outcome === wanted) || options[0];
  assert.ok(plan, 'A complete legal route is available');
  for (const direction of plan.moves) await page.locator(`[data-direction="${direction}"]`).click();
  assert.equal(await page.locator('.rps-move-slot.filled').count(), required);
  assert.equal(await page.locator('[data-action="roll"]').isEnabled(), true);
  await page.locator('[data-action="roll"]').click();
  await page.waitForSelector('.rps-result-dialog[open]');
  assert.equal(await page.locator('[data-outcome]').getAttribute('data-outcome'), plan.outcome);
  assert.equal(await page.locator('.rps-die-position').getAttribute('data-position'), `${plan.destination.col},${plan.destination.row}`);
  await page.locator('[data-action="acknowledge"]').click();
  await page.waitForFunction(turn => document.querySelector('.arena-game[data-state="ended"]') || document.querySelector('.rps-gameplay')?.dataset.turn === String(turn + 1), turn);
  if (await page.locator('.rps-gameplay').count()) {
    assert.equal(await page.locator('.rps-die').getAttribute('data-top'), plan.cube.top.shape);
    assert.equal(await page.locator('.rps-die-position').getAttribute('data-position'), `${plan.destination.col},${plan.destination.row}`);
  }
  return plan.cube;
}

try {
  server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
  baseURL = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });
  for (const theme of ['light', 'dark']) {
    for (const lang of ['id', 'en']) {
      const context = await browser.newContext({ viewport: { width: lang === 'id' ? 1440 : 390, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.addInitScript(({ theme, lang }) => {
        localStorage.setItem('ba_onboarding_v1', JSON.stringify({ completedAt: 1 }));
        localStorage.setItem('ba_accessibility_v1', JSON.stringify({ theme, reducedMotion: true }));
        localStorage.setItem('uw_lang', lang);
        localStorage.setItem('ba_muted', 'true');
      }, { theme, lang });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      for (const spec of configurations) {
        const faces = await start(page, spec);
        await playTurn(page, faces);
        assert.equal(await page.locator('.play-player.player-2.active').count(), 1);
      }
      console.log(`${theme}/${lang}: all six levels show the net and 49-cell board; rolling, results and the next turn passed`);
      if (theme === 'dark' && lang === 'id') {
        let faces = await start(page, configurations[2]);
        let turns = 0;
        while (await page.locator('.rps-gameplay').count() && turns < 32) {
          faces = await playTurn(page, faces, turns % 2 === 0 ? 'win' : 'lose');
          turns++;
        }
        await page.waitForSelector('.play-result');
        assert.equal(await page.locator('.play-result-scores .winner > strong').textContent(), String(WIN_SCORE));
        await page.locator('.play-result-actions .uw-btn-primary').click();
        await page.waitForSelector('.rps-planar');
        await page.locator('.rps-start-button').click();
        await page.waitForSelector('.rps-gameplay[data-turn="1"]');
        assert.equal(await page.locator('.rps-cell').count(), 49);
        for (const player of [1, 2]) assert.equal(await page.locator(`.play-player.player-${player} > strong`).evaluate(el => el.firstChild.textContent), '0');
        if (process.argv.includes('--screenshots')) await page.screenshot({ path: 'qa-results/rps-fixed.png', fullPage: true });
        console.log('Complete match and play again keep the arena visible and reset both scores');
      }
      await context.close();
    }
  }
  assert.deepEqual(errors, [], 'No Duel Dadu runtime errors');
} finally {
  await browser?.close();
  if (server) await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
