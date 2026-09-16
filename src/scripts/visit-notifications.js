// First-party, coarse engagement signals. Never reads form values, query tags or identity.
export function startNotifications(win=window) {
  const {document:doc,navigator:nav,location:loc}=win;
  const preference=doc.querySelector('[data-visit-preference]');
  const get=key=>{try{return win.localStorage.getItem(key);}catch{return null;}};
  const set=(key,value)=>{try{win.localStorage.setItem(key,value);}catch{}};
  let manualOptOut=get('oa-alerts-disabled')==='1';
  const optedOut=()=>manualOptOut||get('oa-alerts-disabled')==='1'||nav.doNotTrack==='1'||nav.globalPrivacyControl===true;
  function updatePreference(){if(preference){preference.checked=optedOut();preference.disabled=nav.doNotTrack==='1'||nav.globalPrivacyControl===true;}}
  updatePreference();
  preference?.addEventListener('change',()=>{manualOptOut=preference.checked;set('oa-alerts-disabled',manualOptOut?'1':'0');});
  // Preview and local review never notify Brian; production requires both gates.
  if(doc.body.dataset.siteMode!=='production'||loc.protocol!=='https:'||!['olsenautomation.com','www.olsenautomation.com'].includes(loc.hostname)||win.top!==win||nav.webdriver||new URLSearchParams(loc.search).get('no-ping')==='1')return;
  const route=loc.pathname==='/'?'/index.html':loc.pathname;
  if(route==='/404.html'||route.startsWith('/preview/')||route.includes('family-card-chaos-access'))return;
  const seen=new Set();let seconds=0,classSeconds=0,classVisible=false;
  const resumePages=new Map([
    ['/territory-sales-execution.html','/assets/territory-execution/Brian_Olsen_Sazerac_Market_Development_Resume.pdf'],
    ['/visual-ai-evaluation.html','/Brian_Olsen_DataAnnotation_Visual_AI_Trainer_Resume.pdf']
  ]);
  function send(event,subject=route){
    if(optedOut()||doc.visibilityState!=='visible')return;
    const key='oa-alert-v2:'+event+(event==='resume'?':'+subject:'');
    const previous=Number(get(key));
    if(seen.has(key)||(previous>0&&Date.now()-previous<30*60*1000))return;
    // Reserve before asynchronous transport; no retries or delayed duplicates.
    seen.add(key);set(key,String(Date.now()));
    win.fetch('/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,route:subject}),credentials:'same-origin',keepalive:true}).catch(()=>{});
  }
  const classTargets=route==='/index.html'?['#learn']:route==='/workshop.html'?['#learn','#workshop','#interest']:[];
  const visible=new Set();
  if(win.IntersectionObserver){
    const observer=new win.IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}
      classVisible=visible.size>0;
    },{rootMargin:'-20% 0px -20% 0px',threshold:0});
    for(const selector of classTargets){const node=doc.querySelector(selector);if(node)observer.observe(node);}
  }
  win.setInterval(()=>{
    if(doc.visibilityState!=='visible'||doc.prerendering||optedOut())return;
    seconds++;if(classVisible)classSeconds++;
    if(seconds>=8)send('visit');
    if(classSeconds>=8)send('class');
  },1000);
  doc.addEventListener('click',event=>{
    if(!event.isTrusted)return;
    const link=event.target.closest?.('a[href]');if(!link)return;
    const url=new URL(link.href,loc.href);
    if(url.origin===loc.origin&&url.pathname===resumePages.get(route))send('resume',url.pathname);
  },true);
}
if(typeof window!=='undefined')startNotifications();
