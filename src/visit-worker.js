// Fixed-format notifications through the owner's existing free ntfy destination.
// No visitor headers, IP, form data, query strings or user-supplied messages are forwarded.
import routes from '../dist/route-registry.json' with {type:'json'};
import unlisted from './_data/unlisted-publication.json' with {type:'json'};
const allowed=new Set([...routes.map(r=>r.route),...unlisted.approved_routes]);
const resumes=new Map([
  ['/Brian_Olsen_DataAnnotation_Visual_AI_Trainer_Resume.pdf','Visual AI resume'],
  ['/assets/territory-execution/Brian_Olsen_Sazerac_Market_Development_Resume.pdf','Territory sales resume']
]);
const topic='oa-73a41ff2ffb6231a6bff23f91ad90d11a8a8113d622289bb';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Content-Type':'application/json','Referrer-Policy':'no-referrer'};
const reply=(status,state)=>Response.json({state},{status,headers});
// A small per-isolate burst ceiling is additional protection, not a global quota.
let recent=[];
export async function visitNotification(request,env,send=fetch){
  const url=new URL(request.url);
  if(request.method!=='POST')return reply(405,'method-not-allowed');
  if(env.VISIT_NOTIFICATIONS!=='enabled'||!['olsenautomation.com','www.olsenautomation.com'].includes(url.hostname))return reply(200,'disabled');
  if(url.protocol!=='https:'||request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')!=='same-origin')return reply(403,'rejected');
  if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return reply(200,'disabled');
  if(request.headers.get('content-type')!=='application/json')return reply(415,'rejected');
  if(Number(request.headers.get('content-length'))>512)return reply(413,'rejected');
  let body='',bytes=0;const reader=request.body?.getReader();if(!reader)return reply(400,'rejected');
  for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;body+=new TextDecoder().decode(value);if(bytes>512){await reader.cancel();return reply(413,'rejected');}}
  let data;try{data=JSON.parse(body);}catch{return reply(400,'rejected');}
  if(!data||Object.keys(data).sort().join(',')!=='event,route')return reply(400,'rejected');
  const {event,route}=data;
  if((event==='visit'&&!allowed.has(route))||(event==='class'&&!['/index.html','/workshop.html'].includes(route))||(event==='resume'&&!resumes.has(route))||!['visit','class','resume'].includes(event))return reply(400,'rejected');
  const now=Date.now();recent=recent.filter(t=>now-t<60000);if(recent.length>=12)return reply(429,'limited');recent.push(now);
  const title={visit:'Website visit',class:'Class information viewed',resume:'Resume opened'}[event];
  const label=resumes.get(route)||routes.find(r=>r.route===route)?.title||'Unlisted professional portfolio';
  const message=event==='resume'?'Resume link clicked; reading or download completion is not confirmed.':'Visible for at least 8 seconds; this is an engagement signal, not verified identity.';
  try{
    const response=await send('https://ntfy.sh/'+topic,{method:'POST',headers:{'Content-Type':'text/plain','Title':title,'Priority':event==='resume'?'high':'default','Tags':event==='resume'?'briefcase,page_facing_up':'eyes','Cache':'no'},body:label+'\n'+message,signal:AbortSignal.timeout(5000)});
    return reply(response.ok?200:503,response.ok?'accepted':'unavailable');
  }catch{return reply(503,'unavailable');}
}
