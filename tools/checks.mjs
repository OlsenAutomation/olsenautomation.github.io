import assert from 'node:assert/strict';
import { frameIndex, mediaTime, selectVariant } from '../src/scripts/motion-core.js';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
assert.equal(frameIndex(-1,121),0);assert.equal(frameIndex(2,121),120);assert.equal(frameIndex(.5,121),60);assert.equal(frameIndex(NaN,121),0);
assert.ok(mediaTime(1,10)<10);assert.equal(mediaTime(0,10),0);
assert.equal(selectVariant([{width:1280},{width:640}],390).width,640);
assert.equal(selectVariant([{width:640},{width:1280}],3000).width,1280);
const server=spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,SITE_PREVIEW_PORT:'43188'},stdio:['ignore','pipe','pipe']});
try {
  await Promise.race([once(server.stdout,'data'),new Promise((_,reject)=>setTimeout(()=>reject(Error('Server startup timeout')),5000))]);
  const base='http://127.0.0.1:43188';
  const registry=JSON.parse(await readFile('dist/route-registry.json','utf8'));
  for(const route of ['/', '/preview/shell/','/preview/media/', ...registry.map(r=>r.route),'/visual-ai-evaluation.html','/product-photo-production.html','/territory-sales-execution.html']){
    const r=await fetch(base+route);assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(r.headers.get('content-security-policy'),route==='/ai-visibility.html'?/form-action 'self'/:/form-action 'none'/);assert.equal(r.redirected,false);
  }
  for(const route of ['/missing','/_codex_handoff/approved-pilot/QA-REPORT.md','/.git/config','/migration/CONTENT_MATRIX.csv','/CNAME','/family-card-chaos-access.html','/assets/family-access.js','/unlisted-media/test.png','/contact','/contact/'])assert.equal((await fetch(base+route)).status,404,route);
  assert.equal((await fetch(base+'/preview/media/',{method:'POST',body:'synthetic'})).status,405);
  for(const mode of ['accepted','rejected','timeout']){const response=await fetch(base+'/__test/intake-receiver?mode='+mode,{method:'POST',body:'synthetic-only'});const text=await response.text();assert.equal(response.status,200);if(mode==='timeout')assert.ok(!text.includes('postMessage'));else assert.ok(text.includes(mode==='accepted'?'\"accepted\":true':'\"accepted\":false'));}
  const m=JSON.parse(await readFile('public/media/manifest.json','utf8'));const video=m.videos.entry.variants[0];
  const range=await fetch(base+video.url,{headers:{Range:'bytes=0-99'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,100);assert.match(range.headers.get('content-range'),/^bytes 0-99\//);
  const bad=await fetch(base+video.url,{headers:{Range:`bytes=${video.bytes+1}-`}});assert.equal(bad.status,416);
  console.log('PASS: frame/time bounds, variant selection, all public routes, HTML URL preservation, privacy boundaries, noindex/CSP, isolated receiver outcomes, blocked POST and video range support.');
} finally {server.kill();}
