import test from 'node:test';
import assert from 'node:assert/strict';
import {GAMES,resolveRoute,routeHash} from '../src/data/games.js';
test('catalog games and guides round-trip through public hash routes',()=>{for(const game of GAMES){assert.equal(resolveRoute(routeHash(game.id)),game.id);assert.equal(resolveRoute(`#/tips-${game.id}`),`tips-${game.id}`);}});
test('basic pages and retired progression URLs route safely',()=>{for(const page of ['games','guides','settings'])assert.equal(resolveRoute(`#/${page}`),page);for(const page of ['daily','profile','progress','rank','arena-run'])assert.equal(resolveRoute(`#/${page}`),'home');});
