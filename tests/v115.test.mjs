import test from 'node:test';import assert from 'node:assert/strict';
import {GAMES,resolveRoute} from '../src/data/games.js';
import {createChallengeCode} from '../src/utils/competitive.js';
import {challengeLink,challengeCodeFromHash} from '../src/utils/challengeShare.js';
import {createGoal,goalProgress} from '../src/utils/goals.js';
import {inspectDataHealth,repairInvalidData} from '../src/utils/dataHealth.js';
import {DATA_SCHEMA_VERSION,migrateProgressData} from '../src/utils/migration.js';

class MemoryStorage{constructor(initial={}){this.map=new Map(Object.entries(initial))}get length(){return this.map.size}key(i){return [...this.map.keys()][i]??null}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}

test('v1.15 routes resolve',()=>{for(const [hash,expected] of [['#/daily-archive','daily-archive'],['#/arena-builder','arena-builder'],['#/data-health','data-health'],['#/offline','offline'],['#/goals','goals'],['#/challenge/BA-MAZE-ABCDE','challenge']])assert.equal(resolveRoute(hash),expected)});

test('challenge links preserve code',()=>{const code=createChallengeCode('maze','v115-share');const link=challengeLink(code,'https://example.com/Brain-Arena/#/maze-escape');assert.match(link,/\/Brain-Arena\/#\/challenge\//);assert.equal(challengeCodeFromHash(new URL(link).hash),code)});

test('personal goals measure sessions',()=>{const goal=createGoal({type:'sessions',target:3,gameId:'maze'});goal.startDate='2026-10-01';goal.endDate='2026-10-07';const profile={completionEvents:[{gameId:'maze',dateKey:'2026-10-01'},{gameId:'maze',dateKey:'2026-10-02'},{gameId:'sudoku',dateKey:'2026-10-02'}]};assert.equal(goalProgress(goal,profile,{},[]),2)});

test('data health detects and repairs invalid Brain Arena JSON only',()=>{const storage=new MemoryStorage({'ba_good':'{"a":1}','ba_bad':'{oops','other':'{oops'});const report=inspectDataHealth(storage);assert.equal(report.invalid.length,1);assert.equal(repairInvalidData(storage),1);assert.equal(storage.getItem('ba_bad'),null);assert.equal(storage.getItem('other'),'{oops')});

test('v1.15 migration advances schema and adds accessibility v2 safely',()=>{const storage=new MemoryStorage({'ba_data_schema':'14','ba_accessibility_v1':JSON.stringify({theme:'dark',largeText:true})});const result=migrateProgressData(storage);assert.equal(DATA_SCHEMA_VERSION,15);assert.equal(result.to,15);const a11y=JSON.parse(storage.getItem('ba_accessibility_v1'));assert.equal(a11y.theme,'dark');assert.equal(a11y.largeText,true);assert.equal(a11y.colorVision,'default')});

test('catalog still contains 12 games after v1.15 UX additions',()=>assert.equal(GAMES.length,12));
