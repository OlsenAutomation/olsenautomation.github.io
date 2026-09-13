import {selectVariant} from './motion-core.js';
const dialog=document.querySelector('#site-portal'),video=document.querySelector('#site-portal-video');
let active=false,timer,opener;
function finish(){if(!active)return;active=false;clearTimeout(timer);location.href='/workshop.html';}
if(dialog){
  document.addEventListener('click',async event=>{
    const a=event.target.closest('a[href]');
    if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank')return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin||url.pathname!=='/workshop.html'||location.pathname==='/workshop.html'||a.closest('#site-portal'))return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData)return;
    event.preventDefault();opener=a;active=true;dialog.showModal();timer=setTimeout(finish,14000);
    try{const r=await fetch('/media/manifest.json');if(!r.ok)throw Error();const m=await r.json();if(!active)return;video.src=selectVariant(m.videos.portal.variants,innerWidth<=760?640:1280).url;await video.play();}catch{finish();}
  });
  video.addEventListener('ended',finish);video.addEventListener('error',finish);
  dialog.addEventListener('close',()=>{active=false;clearTimeout(timer);video.pause();const focusTarget=opener?.getClientRects().length?opener:document.querySelector('.nav-toggle');focusTarget?.focus({preventScroll:true});});
  document.querySelector('#cancel-site-portal').addEventListener('click',()=>dialog.close());
}
