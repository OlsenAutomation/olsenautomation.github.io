// Read-only verification of the public branch-preview artifact and visibility boundaries.
import assert from 'node:assert/strict';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const base=new URL(process.argv[2] || '');
assert.equal(base.protocol,'https:');
assert.match(base.hostname,/^(?:[a-f0-9]{8}|site-redesign-v2)-olsen-automation-v2-preview\.brian-dbb\.workers\.dev$/);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={base:base.origin,checkedAt:new Date().toISOString(),assets:[],routes:[],excluded:[],failures:[]};
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const files=(await walk(path.join(root,'dist'))).filter(file=>!['_headers','_redirects'].includes(path.basename(file)));
async function verify(file){
  const route='/'+path.relative(path.join(root,'dist'),file).split(path.sep).join('/');
  try{
    const response=await fetch(new URL(route,base),{redirect:'manual',signal:AbortSignal.timeout(20000)});
    const bytes=Buffer.from(await response.arrayBuffer());const expected=await readFile(file);
    assert.equal(response.status,200,route);assert.equal(sha(bytes),sha(expected),route+' bytes');
    assert.match(response.headers.get('x-robots-tag')||'',/noindex/);
    if(route.endsWith('.html'))assert.match(response.headers.get('content-security-policy')||'',/form-action 'none'/);
    report.assets.push({route,status:response.status,bytes:bytes.length,sha256:sha(bytes)});
  }catch(error){report.failures.push({route,error:error.message});}
}
let cursor=0;await Promise.all(Array.from({length:6},async()=>{while(cursor<files.length)await verify(files[cursor++]);}));
const aliases=JSON.parse(await readFile(path.join(root,'src/_data/route-aliases.json'),'utf8'));
for(const [route,target] of Object.entries(aliases)){
  const response=await fetch(new URL(route,base),{redirect:'manual'});
  const bytes=Buffer.from(await response.arrayBuffer());
  try{assert.equal(response.status,200);assert.equal(sha(bytes),sha(await readFile(path.join(root,'dist',target))));report.routes.push({route,target,status:response.status});}catch(error){report.failures.push({route,error:error.message});}
}
for(const route of ['/missing','/_codex_handoff/approved-pilot/QA-REPORT.md','/.git/config','/migration/CONTENT_MATRIX.csv','/CNAME','/family-card-chaos-access.html','/visual-ai-evaluation.html','/product-photo-production.html','/territory-sales-execution.html','/assets/family-access.js','/unlisted-media/test.png','/src/pages/home.html','/contact','/contact/','/__test/intake-receiver','/_headers','/_redirects']){
  const response=await fetch(new URL(route,base),{redirect:'manual'});report.excluded.push({route,status:response.status});
  if(response.status!==404)report.failures.push({route,error:'Expected 404'});
}
const post=await fetch(new URL('/preview/media/',base),{method:'POST',body:'synthetic-preview-qa',redirect:'manual'});
report.postStatus=post.status;if(post.status!==405)report.failures.push({route:'/preview/media/',error:'POST expected 405'});
const manifest=JSON.parse(await readFile(path.join(root,'public/media/manifest.json'),'utf8'));
const video=manifest.videos.entry.variants[0];
const range=await fetch(new URL(video.url,base),{headers:{Range:'bytes=0-99'}});
report.range={status:range.status,bytes:(await range.arrayBuffer()).byteLength,contentRange:range.headers.get('content-range'),cache:range.headers.get('cache-control')};
if(range.status!==206||report.range.bytes!==100)report.failures.push({route:video.url,error:'Range expected 206 and 100 bytes'});
const invalid=await fetch(new URL(video.url,base),{headers:{Range:`bytes=${video.bytes+1}-`}});
report.invalidRangeStatus=invalid.status;if(invalid.status!==416)report.failures.push({route:video.url,error:'Invalid range expected 416'});
report.assets.sort((a,b)=>a.route.localeCompare(b.route));
await writeFile(path.join(root,'.migration-local/hosted-http-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({base:report.base,assets:report.assets.length,aliases:report.routes.length,excluded:report.excluded.length,post:report.postStatus,range:report.range,invalidRange:invalid.status,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
