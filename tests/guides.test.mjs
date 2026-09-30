import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES } from '../src/data/games.js';
import { GUIDE_DETAILS } from '../src/data/guideDetails.js';

const bilingual = (value) => value && typeof value.id === 'string' && value.id.trim() && typeof value.en === 'string' && value.en.trim();

test('every catalog game has a complete learning guide', () => {
  assert.deepEqual(Object.keys(GUIDE_DETAILS).sort(), GAMES.map(game => game.id).sort());
  for (const game of GAMES) {
    const guide = GUIDE_DETAILS[game.id];
    assert.ok(bilingual(guide.objective), `${game.id}: objective`);
    assert.ok(bilingual(guide.victory), `${game.id}: victory`);
    assert.ok(guide.facts.length >= 3, `${game.id}: facts`);
    assert.ok(guide.controls.length >= 3, `${game.id}: controls`);
    assert.ok(guide.tutorial.length >= 4, `${game.id}: tutorial`);
    assert.ok(bilingual(guide.solve.title), `${game.id}: solve title`);
    assert.ok(bilingual(guide.solve.intro), `${game.id}: solve intro`);
    assert.ok(guide.solve.steps.length >= 3, `${game.id}: solve steps`);
    assert.ok(bilingual(guide.solve.example), `${game.id}: solve example`);
    assert.ok(guide.mistakes.length >= 3, `${game.id}: mistakes`);
    assert.ok(guide.levels.length >= 4, `${game.id}: levels`);
  }
});

test('all tutorial and solve copy is bilingual', () => {
  for (const [id, guide] of Object.entries(GUIDE_DETAILS)) {
    for (const [index, step] of guide.tutorial.entries()) {
      assert.ok(bilingual(step.title), `${id} tutorial ${index} title`);
      assert.ok(bilingual(step.text), `${id} tutorial ${index} text`);
    }
    for (const [index, step] of guide.solve.steps.entries()) {
      assert.ok(bilingual(step.title), `${id} solve ${index} title`);
      assert.ok(bilingual(step.text), `${id} solve ${index} text`);
    }
    for (const [index, mistake] of guide.mistakes.entries()) assert.ok(bilingual(mistake), `${id} mistake ${index}`);
  }
});
