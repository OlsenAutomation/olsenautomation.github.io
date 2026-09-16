// Seekable MP4s and a gated notification endpoint; other assets stay static.
import manifest from '../dist/media/manifest.json' with {type:'json'};
import previewHeaders from './_data/preview-headers.json' with {type:'json'};
import {visitNotification} from './visit-worker.js';

const videos=new Map(Object.values(manifest.videos).flatMap(v=>v.variants).map(v=>[v.url,v.bytes]));
export default {
  async fetch(request,env){
    if(new URL(request.url).pathname==='/api/visit')return visitNotification(request,env);
    const size=videos.get(new URL(request.url).pathname);
    if(!size||!['GET','HEAD'].includes(request.method))return env.ASSETS.fetch(request);
    // Static Assets returned 200 to Range on the hosted preview. Fetch the known
    // immutable asset, then answer a single range explicitly. Largest current file: 4.2 MB.
    const upstreamHeaders=new Headers(request.headers);
    upstreamHeaders.delete('range');upstreamHeaders.delete('if-range');
    upstreamHeaders.set('accept-encoding','identity');
    const asset=await env.ASSETS.fetch(new Request(request,{headers:upstreamHeaders}));
    const headers=new Headers(asset.headers);
    for(const [name,value] of Object.entries(previewHeaders))headers.set(name,value);
    headers.set('Accept-Ranges','bytes');
    if(asset.status!==200)return new Response(asset.body,{status:asset.status,headers});
    const full=()=>new Response(asset.body,{status:200,headers});
    const range=request.headers.get('range');
    const ifRange=request.headers.get('if-range');
    // A stale or weak If-Range validator requires the complete representation.
    if(request.method==='HEAD'||!range||(ifRange&&(ifRange.startsWith('W/')||ifRange!==headers.get('etag'))))return full();
    const match=/^bytes=(\d*)-(\d*)$/i.exec(range.trim());
    // Unsupported units/multipart ranges may be ignored under HTTP semantics.
    if(!match||(!match[1]&&!match[2]))return full();
    const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
    const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
    if(!Number.isSafeInteger(start)||start>=size||end<start||(!match[1]&&Number(match[2])===0)){
      await asset.body?.cancel();
      headers.set('Content-Range',`bytes */${size}`);headers.delete('Content-Length');
      return new Response(null,{status:416,headers});
    }
    const bytes=await asset.arrayBuffer();
    if(bytes.byteLength!==size)throw Error('Media byte count differs from reviewed manifest');
    headers.delete('Content-Encoding');headers.set('Content-Length',String(end-start+1));
    headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
    return new Response(bytes.slice(start,end+1),{status:206,headers});
  }
};
