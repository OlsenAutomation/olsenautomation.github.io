import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const unlisted = path.join(root, 'dist-unlisted');
const privateReview = process.env.SITE_PRIVATE_REVIEW === '1';
const aliases=JSON.parse(await readFile(path.join(root,'src/_data/route-aliases.json'),'utf8'));
const port = Number(process.env.SITE_PREVIEW_PORT || 43187);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.txt':'text/plain','.pdf':'application/pdf'};
const server = http.createServer(async (req,res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    if(requestUrl.pathname==='/__test/intake-receiver' && req.method==='POST'){
      let size=0;for await(const chunk of req){size+=chunk.length;if(size>150000){res.writeHead(413);res.end();return;}}
      const mode=requestUrl.searchParams.get('mode');
      const payload=mode==='rejected'?{ok:false,accepted:false,error:'Local test rejection.'}:{ok:true,accepted:true};
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'});
      res.end(mode==='timeout'?'<!doctype html><title>Local timeout fixture</title>':`<!doctype html><title>Local intake fixture</title><script>parent.postMessage({channel:'olsen_ai_visibility_intake',payload:${JSON.stringify(payload)}},location.origin)</script>`);return;
    }
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    pathname=aliases[pathname]||pathname;
    let file;
    // Exact read-only reference route. No directory browsing, handoff mount, or wildcard access.
    if (pathname === '/reference/v6') file = path.join(root,'_codex_handoff/approved-pilot/Olsen-Automation-Future-Pilot-v6-Single-File.html');
    else {
      if (pathname.split('/').some(x => x.startsWith('.') || x.startsWith('_'))) {res.writeHead(404);res.end();return;}
      file = path.resolve(dist, '.'+pathname);
      if (privateReview) {
        const candidate=path.resolve(unlisted,'.'+pathname);
        if(candidate.startsWith(unlisted+path.sep)){
          try{if((await stat(candidate)).isFile() && (await realpath(candidate)).startsWith(unlisted+path.sep))file=candidate;}catch{}
        }
      }
      if (!file.startsWith(dist+path.sep) && !(privateReview && file.startsWith(unlisted+path.sep))) {res.writeHead(404);res.end();return;}
      try {const resolved=await realpath(file);if (!resolved.startsWith(dist+path.sep) && !(privateReview && resolved.startsWith(unlisted+path.sep))) throw new Error('Outside output');await stat(file);}
      catch {file=path.join(dist,'404.html');res.statusCode=404;}
    }
    const info=await stat(file);
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    if (!pathname.startsWith('/reference/')) res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self'; media-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action "+(pathname==='/ai-visibility.html'?"'self'":"'none'"));
    res.setHeader('Accept-Ranges','bytes');
    let start=0,end=info.size-1;
    if (req.headers.range) {
      const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if (!m || +m[1]>=info.size || (m[2] && +m[2]<+m[1])) {res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
      start=+m[1];end=m[2]?Math.min(+m[2],end):end;
      res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader('Content-Length',end-start+1);
    if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
  } catch {res.writeHead(404);res.end('Preview not built or reference unavailable.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local ${privateReview?'unlisted review':'site preview'}: http://127.0.0.1:${port}/`));
