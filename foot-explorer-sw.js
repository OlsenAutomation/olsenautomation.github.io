const CACHE='runner-foot-ef8a35d94abd';
const FILES=["/foot-explorer.html", "/assets/foot-explorer/foot-side-BbNqi4hR.jpg", "/assets/foot-explorer/foot-sole-hUS9YW2M.jpg", "/assets/foot-explorer/foot-top-DPMYYN6a.jpg", "/assets/foot-explorer/icon-192.png", "/assets/foot-explorer/icon-512.png", "/assets/foot-explorer/index-BNaznbS6.css", "/assets/foot-explorer/index-cjwRQqoJ.js", "/assets/foot-explorer/install.js", "/assets/foot-explorer/manifest.webmanifest"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('runner-foot-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==self.location.origin||!FILES.includes(u.pathname))return;
 e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(u.pathname)).then(r=>r||new Response('Open the guide online once before using it offline.',{status:503}))));
});
