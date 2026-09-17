import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import candidate from '../src/candidate-worker.js';
import production from '../src/production-worker.js';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const routes=JSON.parse(await read('dist/route-registry.json')).map(r=>r.route);
const unlisted=JSON.parse(await read('src/_data/unlisted-publication.json')).approved_routes;
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(dir+'/'+e.name):dir+'/'+e.name))).flat();
const files=await walk('dist-production');
assert.equal(files.filter(p=>p.endsWith('.html')).length,36);
assert.ok(!files.some(p=>/preview\/|family-card-chaos-access|family-access\.js|route-registry|_codex|apps-script|migration\//.test(p)));
assert.ok(!files.some(p=>/\/assets\/media\.(js|css)$/.test(p)));
for(const route of [...routes,...unlisted,'/404.html']){
  const prod=await read('dist-production'+route),stage=await read('dist-candidate'+route);
  assert.match(prod,/data-site-mode="production"/);assert.match(stage,/data-site-mode="candidate"/);
  assert.match(stage,/<meta name="robots" content="noindex/);
  if(routes.includes(route))assert.match(prod,/<meta name="robots" content="index,follow">/);
  else assert.match(prod,/<meta[^>]+noindex/);
  const normalize=s=>s.replace(/data-site-mode="(?:production|candidate)"/g,'MODE').replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/g,'ROBOTS');
  assert.equal(normalize(prod),normalize(stage),route+' equivalent page body');
}
const sitemap=await read('dist-production/sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,32);
const sitemapRoutes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
for(const route of [...unlisted,'/404.html','/preview/','/family-card-chaos-access.html'])assert.ok(!sitemapRoutes.includes(route));
assert.match(await read('dist-production/robots.txt'),/Allow: \/\nSitemap: https:\/\/olsenautomation.com\/sitemap.xml/);
assert.match(await read('dist-candidate/robots.txt'),/Disallow: \//);
assert.match(await read('dist-production/_headers'),/frame-src https:\/\/script.google.com https:\/\/\*.googleusercontent.com/);
assert.ok(!(await read('src/production-worker.js')).includes('candidate-worker'));
const liveConfig=JSON.parse(await read('wrangler.production.proposed.json'));
assert.equal(liveConfig.assets.run_worker_first,true);assert.equal(liveConfig.workers_dev,false);
assert.deepEqual(liveConfig.routes.map(r=>r.pattern),['olsenautomation.com','www.olsenautomation.com']);
const assets={fetch:async()=>new Response('safe static content')};
const env={ASSETS:assets,VISIT_NOTIFICATIONS:'disabled',RELEASE_QA_EXPIRES:'0'};
for(const path of ['/__release-qa','/__release-qa/notification'])assert.equal((await candidate.fetch(new Request('https://candidate.example'+path),env)).status,404);
const active={...env,RELEASE_QA_TOKEN:'a'.repeat(64),RELEASE_QA_EXPIRES:String(Date.now()+60000)};
const qaPage=await candidate.fetch(new Request('https://candidate.example/__release-qa'),active);
assert.equal(qaPage.status,200);assert.equal(qaPage.headers.get('referrer-policy'),'same-origin');
for(const [origin,token] of [['https://evil.example','a'.repeat(64)],['https://candidate.example','wrong']]){
  const request=new Request('https://candidate.example/__release-qa',{method:'POST',headers:{Origin:origin},body:new URLSearchParams({token})});
  assert.equal((await candidate.fetch(request,active)).status,403);
}
const login=await candidate.fetch(new Request('https://candidate.example/__release-qa',{method:'POST',headers:{Origin:'https://candidate.example'},body:new URLSearchParams({token:active.RELEASE_QA_TOKEN})}),active);
assert.equal(login.status,303);assert.match(login.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Strict/);
const unauthorized=await candidate.fetch(new Request('https://candidate.example/__release-qa/notification',{method:'POST',headers:{Origin:'https://candidate.example'},body:'{}'}),active);assert.equal(unauthorized.status,404);
const silent=await candidate.fetch(new Request('https://candidate.example/api/visit',{method:'POST'}),active);assert.deepEqual(await silent.json(),{state:'disabled'});
const redirect=await production.fetch(new Request('https://www.olsenautomation.com/projects.html?source=test'),env);
assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'https://olsenautomation.com/projects.html?source=test');
const staticResponse=await candidate.fetch(new Request('https://candidate.example/'),env);assert.match(staticResponse.headers.get('x-robots-tag'),/noindex/);
console.log('PASS: 36 release pages, 32 public sitemap entries, production/candidate body equivalence, unlisted/family boundaries, expired/unauthorized QA isolation, silent staging and www canonical redirect. No external messages sent.');
