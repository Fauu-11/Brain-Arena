import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../src/data/games.js';
import { buildFeedbackPayload, cleanFeedback, feedbackEndpoint, sendFeedback, validateFeedback } from '../src/utils/feedback.js';

test('v1.12 feedback aliases resolve to feedback page', () => {
  assert.equal(resolveRoute('#/feedback'),'feedback');
  assert.equal(resolveRoute('#/saran'),'feedback');
  assert.equal(resolveRoute('#/masukan'),'feedback');
});

test('feedback validation requires a useful subject and message', () => {
  assert.equal(validateFeedback({subject:'Hi',message:'This is long enough'}).valid,false);
  assert.equal(validateFeedback({subject:'Maze idea',message:'Short'}).valid,false);
  assert.equal(validateFeedback({subject:'Maze idea',message:'Please add a clearer route marker for mobile.'}).valid,true);
});

test('feedback cleaning bounds rating and message size', () => {
  const data=cleanFeedback({rating:99,subject:'  Better UI  ',message:'x'.repeat(5000)});
  assert.equal(data.rating,5);
  assert.equal(data.subject,'Better UI');
  assert.equal(data.message.length,3000);
});

test('feedback payload includes player context without rendering recipient', () => {
  const payload=buildFeedbackPayload({type:'bug',rating:4,subject:'Maze controls',message:'The down control did not respond on my mobile browser.',playerName:'Tester',includeDiagnostics:true},{version:'Brain Arena v1.12.0',route:'#/feedback',gameTitle:'Maze Escape',diagnostics:'Browser QA'});
  assert.equal(payload['Game / area'],'Maze Escape');
  assert.equal(payload['Rating pengalaman'],'4/5');
  assert.equal(payload['Info teknis'],'Browser QA');
  assert.ok(!JSON.stringify(payload).includes('formsubmit.co'));
});

test('feedback sender uses form relay with JSON and handles success', async () => {
  let request=null;
  const fakeFetch=async (url,options)=>{request={url,options};return {ok:true,status:200,json:async()=>({success:true})};};
  const result=await sendFeedback({type:'suggestion',rating:5,subject:'Tournament idea',message:'Please add a weekly seeded tournament for Arena Run.'},{version:'Brain Arena v1.12.0'},fakeFetch);
  assert.equal(result.ok,true);
  assert.ok(request.url.startsWith('https://formsubmit.co/ajax/'));
  assert.equal(request.options.method,'POST');
  const body=JSON.parse(request.options.body);
  assert.equal(body['Rating pengalaman'],'5/5');
  assert.ok(feedbackEndpoint().startsWith('https://formsubmit.co/ajax/'));
});
