import assert from 'node:assert/strict';
import {startNotifications} from '../src/scripts/visit-notifications.js';
import {visitNotification} from '../src/visit-worker.js';
function browser({route='/index.html',mode='production',host='olsenautomation.com',storage=new Map(),nav={},blocked=false,search=''}={}){
  const events={},docEvents={},calls=[],timers=[],changes={};let observe;
  const preference={checked:false,addEventListener:(n,cb)=>changes[n]=cb};
  const section={};
  const doc={body:{dataset:{siteMode:mode}},visibilityState:'visible',prerendering:false,
    querySelector:s=>s==='[data-visit-preference]'?preference:section,addEventListener:(n,cb)=>docEvents[n]=cb};
  const win={document:doc,navigator:nav,location:{hostname:host,protocol:'https:',pathname:route,search,origin:'https://'+host,href:'https://'+host+route+search},
    localStorage:{getItem:k=>{if(blocked)throw Error();return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error();storage.set(k,v);}},
    addEventListener:(n,cb)=>events[n]=cb,setInterval:cb=>timers.push(cb),fetch:(url,args)=>{calls.push({url,...args,body:JSON.parse(args.body)});return Promise.resolve({ok:true});},
    IntersectionObserver:class{constructor(cb){observe=cb;}observe(){}},};win.top=win;
  startNotifications(win);
  return {win,doc,calls,preference,storage,activity:(trusted=true)=>events.scroll?.({isTrusted:trusted}),
    tick:n=>{for(let i=0;i<n;i++)for(const timer of timers)timer();},
    visible:v=>observe?.([{target:section,isIntersecting:v}]),
    optout:v=>{preference.checked=v;changes.change();},
    click:href=>docEvents.click?.({isTrusted:true,target:{closest:()=>({href})}})};
}
const b=browser();b.tick(7);assert.equal(b.calls.length,0,'View too brief');b.tick(1);assert.deepEqual(b.calls.map(c=>c.body.event),['visit']);
b.visible(true);b.tick(7);assert.equal(b.calls.length,1);b.tick(1);assert.equal(b.calls[1].body.event,'class');b.tick(40);assert.equal(b.calls.length,2);
const next=browser({route:'/workshop.html',storage:b.storage});next.activity();next.visible(true);next.tick(9);assert.equal(next.calls.length,0,'Cross-page cooldown');
for(const options of [{mode:'preview'},{host:'preview.workers.dev'},{nav:{webdriver:true}},{nav:{doNotTrack:'1'}},{nav:{globalPrivacyControl:true}},{search:'?no-ping=1'}]){
  const b=browser(options);b.activity();b.visible(true);b.tick(20);assert.equal(b.calls.length,0,JSON.stringify(options));
}
const hidden=browser();hidden.activity();hidden.doc.visibilityState='hidden';hidden.tick(30);assert.equal(hidden.calls.length,0);hidden.doc.visibilityState='visible';hidden.tick(8);assert.equal(hidden.calls.length,1);
const brief=browser();brief.tick(7);assert.equal(brief.calls.length,0);
const opt=browser({blocked:true});opt.optout(true);opt.activity();opt.visible(true);opt.tick(20);assert.equal(opt.calls.length,0,'Opt-out without storage');
const resume='/assets/territory-execution/Brian_Olsen_Sazerac_Market_Development_Resume.pdf';
const portfolio=browser({route:'/territory-sales-execution.html'});portfolio.click('https://olsenautomation.com'+resume);portfolio.click('https://olsenautomation.com'+resume);assert.deepEqual(portfolio.calls.map(c=>c.body),[{event:'resume',route:resume}]);
const unrelated=browser();unrelated.click('https://olsenautomation.com'+resume);assert.equal(unrelated.calls.length,0);
// The relay is exercised with an injected transport; no notification leaves this process.
const sent=[];const transport=async(url,options)=>{sent.push({url,options});return new Response('{}');};
const request=(data={event:'visit',route:'/index.html'},options={})=>new Request('https://olsenautomation.com/api/visit',{method:'POST',headers:{origin:'https://olsenautomation.com','sec-fetch-site':'same-origin','content-type':'application/json',...options.headers},body:JSON.stringify(data)});
const env={VISIT_NOTIFICATIONS:'enabled'};
assert.equal((await visitNotification(request(),{},transport)).status,200);assert.equal(sent.length,0);
assert.equal((await visitNotification(new Request('https://preview.workers.dev/api/visit',{method:'POST'}),env,transport)).status,200);assert.equal(sent.length,0);
assert.equal((await visitNotification(new Request('https://olsenautomation.com/api/visit'),env,transport)).status,405);
for(const headers of [{origin:'https://evil.example'},{'sec-fetch-site':'cross-site'}])assert.equal((await visitNotification(request(undefined,{headers}),env,transport)).status,403);
for(const data of [{event:'visit',route:'/family-card-chaos-access.html'},{event:'class',route:'/contact.html'},{event:'resume',route:'/fake.pdf'},{event:'visit',route:'/index.html?email=private'},{event:'visit',route:'/index.html',email:'private'},null])assert.equal((await visitNotification(request(data),env,transport)).status,400);
assert.equal((await visitNotification(request({text:'x'.repeat(600)}),env,transport)).status,413);
await visitNotification(request(undefined,{headers:{dnt:'1'}}),env,transport);await visitNotification(request(undefined,{headers:{'sec-gpc':'1'}}),env,transport);assert.equal(sent.length,0);
for(const data of [{event:'visit',route:'/index.html'},{event:'class',route:'/workshop.html'},{event:'resume',route:resume}])assert.equal((await visitNotification(request(data),env,transport)).status,200);
assert.equal(sent.length,3);assert.equal(sent[2].options.headers.Priority,'high');
assert.ok(sent.every(s=>!Object.keys(s.options.headers).some(k=>/cookie|user-agent|forwarded|ip/i.test(k))));
assert.equal((await visitNotification(request(),env,async()=>new Response('',{status:429}))).status,503);
assert.equal((await visitNotification(request(),env,async()=>{throw Error('offline');})).status,503);
for(let i=0;i<7;i++)await visitNotification(request(),env,transport);
assert.equal((await visitNotification(request(),env,transport)).status,429);
console.log('PASS: visit/class dwell, trusted resume clicks, cross-page cooldown, hidden tabs, opt-out/DNT/GPC, preview isolation, strict relay payload/origin/route, upstream failure and burst limit. No external alerts sent.');
