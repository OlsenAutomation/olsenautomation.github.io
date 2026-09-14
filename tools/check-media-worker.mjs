import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../src/worker.js';
const manifest=JSON.parse(await readFile(new URL('../dist/media/manifest.json',import.meta.url),'utf8'));
const files=Object.values(manifest.videos).flatMap(v=>v.variants);
for(const video of files){
  const bytes=await readFile(new URL('../dist'+video.url,import.meta.url));
  const etag='"reviewed-asset"';
  const env={ASSETS:{fetch:async request=>{
    if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});
    if(request.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers:{etag}});
    return new Response(request.method==='HEAD'?null:bytes,{headers:{etag,'Content-Length':String(bytes.length),'Content-Type':'video/mp4'}});
  }}};
  const get=(headers={},method='GET')=>worker.fetch(new Request('https://preview.example'+video.url,{headers,method}),env);
  for(const [range,start,end] of [['bytes=0-99',0,99],['bytes=-64',bytes.length-64,bytes.length-1],[`bytes=${bytes.length-30}-`,bytes.length-30,bytes.length-1]]){
    const r=await get({Range:range});assert.equal(r.status,206);assert.equal(r.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);
    assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes.subarray(start,end+1));
    assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.match(r.headers.get('content-security-policy'),/form-action 'none'/);
  }
  for(const range of [`bytes=${bytes.length}-`,'bytes=-0','bytes=999-100','bytes=999999999999999999999999-'])assert.equal((await get({Range:range})).status,416);
  const stale=await get({Range:'bytes=0-9','If-Range':'"old-asset"'});assert.equal(stale.status,200);assert.deepEqual(Buffer.from(await stale.arrayBuffer()),bytes);
  assert.equal((await get({'If-None-Match':etag})).status,304);
  const head=await get({Range:'bytes=0-9'},'HEAD');assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);assert.equal(head.headers.get('accept-ranges'),'bytes');
  assert.equal((await get({},'POST')).status,405);
}
console.log(`PASS: all ${files.length} actual MP4 assets support exact prefix, suffix and open-ended byte ranges, invalid ranges, validators, HEAD, blocked POST and preview security headers.`);
