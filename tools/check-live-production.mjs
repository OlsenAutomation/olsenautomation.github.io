// Read-only launch verification. Never submit forms or send engagement alerts.
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import https from 'node:https';
import {isIP} from 'node:net';
import intake from '../src/_data/live-intake-preservation.json' with {type:'json'};
import unlisted from '../src/_data/unlisted-publication.json' with {type:'json'};

const root=path.resolve(import.meta.dirname,'..');
const base=new URL('https://olsenautomation.com');
const manifest=JSON.parse(await readFile(path.join(root,'.migration-local/release-candidate/artifact-hashes.json'),'utf8')).production;
const hash=data=>createHash('sha256').update(data).digest('hex');
// Optional address must come from the current authoritative DNS answer. This
// avoids stale local resolver caches while retaining the real hostname and TLS
// certificate verification. Report the override; it does not prove propagation.
const edge=process.argv.find(arg=>arg.startsWith('--edge-ip='))?.split('=')[1];
if(edge)assert.equal(isIP(edge),4,'Expected an authoritative IPv4 address');
const report={base:base.origin,checkedAt:new Date().toISOString(),dnsOverride:edge||null,files:[],aliases:[],excluded:[],ranges:[],failures:[]};
async function request(url,init={}){
  if(!edge)return fetch(url,{...init,redirect:'manual',signal:AbortSignal.timeout(30000)});
  assert.ok(['olsenautomation.com','www.olsenautomation.com'].includes(url.hostname));
  return new Promise((resolve,reject)=>{
    const req=https.request(url,{method:'GET',headers:init.headers,lookup:(_host,options,callback)=>options.all?callback(null,[{address:edge,family:4}]):callback(null,edge,4)},response=>{
      const chunks=[];response.on('data',data=>chunks.push(data));response.on('error',reject);response.on('end',()=>{
        const headers=new Headers();for(const [key,value] of Object.entries(response.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);
        resolve(new Response(Buffer.concat(chunks),{status:response.statusCode,headers}));
      });
    });
    req.on('error',reject);req.setTimeout(30000,()=>req.destroy(new Error('HTTPS request timed out')));req.end();
  });
}
const get=(route,init={})=>request(new URL(route,base),init);
const check=async(route,task)=>{try{await task();}catch(error){report.failures.push({route,error:error.message});}};
const files=Object.entries(manifest).filter(([name])=>!['_headers','_redirects'].includes(name));
let cursor=0;
await Promise.all(Array.from({length:6},async()=>{
  while(cursor<files.length){
    const [name,expected]=files[cursor++];const route='/'+name;
    await check(route,async()=>{
      const response=await get(route);const bytes=Buffer.from(await response.arrayBuffer());
      assert.equal(response.status,200);assert.equal(hash(bytes),expected,'File differs from reviewed production artifact');
      if(name.endsWith('.html')){
        assert.match(response.headers.get('cache-control')||'',/(?:^|,)\s*no-transform\b/,'Reviewed HTML must not receive proxy-injected scripts');
        const privatePage=unlisted.approved_routes.includes(route)||route.startsWith(intake.route)||route==='/404.html';
        if(privatePage)assert.match(response.headers.get('x-robots-tag')||'',/noindex/);
        else {assert.doesNotMatch(response.headers.get('x-robots-tag')||'',/noindex/);assert.match(bytes.toString(),/<meta name="robots" content="index,follow">/);}
        const csp=response.headers.get('content-security-policy')||'';
        assert.match(csp,route==='/ai-visibility.html'||route.startsWith(intake.route)?/form-action https:\/\/script.google.com/:/form-action 'none'/);
      }
      report.files.push({route,status:response.status,bytes:bytes.length,sha256:hash(bytes)});
    });
  }
}));
for(const [route,target] of [['/','index.html'],[intake.route,intake.route.slice(1)+'index.html']])await check(route,async()=>{
  const response=await get(route);assert.equal(response.status,200);assert.equal(hash(Buffer.from(await response.arrayBuffer())),manifest[target]);report.aliases.push({route,status:200,target});
});
await check(intake.route.slice(0,-1),async()=>{
  const response=await get(intake.route.slice(0,-1)+'?launch-check=1');assert.equal(response.status,301);assert.equal(response.headers.get('location'),new URL(intake.route+'?launch-check=1',base).href);report.aliases.push({route:intake.route.slice(0,-1),status:301});
});
for(const route of ['/','/projects.html?launch-check=1',intake.route+'?launch-check=1'])await check('www'+route,async()=>{
  const response=await request(new URL('https://www.olsenautomation.com'+route));assert.equal(response.status,301);assert.equal(response.headers.get('location'),base.origin+route);report.aliases.push({route:'www'+route,status:301});
});
for(const route of ['/assets/media.js','/assets/media.css','/preview/shell/','/preview/media/','/route-registry.json','/__release-qa','/__release-qa/notification','/apps-script/Code.gs','/missing','/_codex_handoff/approved-pilot/QA-REPORT.md','/.git/config','/migration/CONTENT_MATRIX.csv','/CNAME','/family-card-chaos-access.html','/assets/family-access.js','/unlisted-media/test.png','/src/pages/home.html','/contact','/contact/','/__test/intake-receiver','/_headers','/_redirects','/.migration-local/project-context-audit/PROJECT_CARD_READINESS.md','/src/_data/project-stories.json','/assets/project-photos/whale-v041-original.png',intake.route+'missing'])await check(route,async()=>{
  const response=await get(route);assert.equal(response.status,404);report.excluded.push({route,status:404});
});
await check('/api/visit',async()=>{const response=await get('/api/visit');assert.equal(response.status,405);report.notificationReadOnlyStatus=405;});
const media=JSON.parse(await readFile(path.join(root,'dist-production/media/manifest.json'),'utf8'));
for(const video of Object.values(media.videos).flatMap(v=>v.variants))await check(video.url,async()=>{
  const source=await readFile(path.join(root,'dist-production',video.url));
  for(const [range,start,end] of [['bytes=0-99',0,99],['bytes=-64',video.bytes-64,video.bytes-1]]){
    const response=await get(video.url,{headers:{Range:range}});const bytes=Buffer.from(await response.arrayBuffer());assert.equal(response.status,206);assert.equal(response.headers.get('content-range'),`bytes ${start}-${end}/${video.bytes}`);assert.ok(bytes.equals(source.subarray(start,end+1)));report.ranges.push({route:video.url,range,status:206});
  }
  assert.equal((await get(video.url,{headers:{Range:`bytes=${video.bytes+1}-`}})).status,416);
});
report.files.sort((a,b)=>a.route.localeCompare(b.route));
await writeFile(path.join(root,'.migration-local/cutover-2026-09-20/live-production-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:report.files.length,aliases:report.aliases.length,excluded:report.excluded.length,ranges:report.ranges.length,notificationReadOnlyStatus:report.notificationReadOnlyStatus,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
