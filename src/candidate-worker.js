// Staging only. This module is never imported by the production Worker.
import manifest from '../dist-candidate/media/manifest.json' with {type:'json'};
import security from './_data/production-headers.json' with {type:'json'};
import {mediaWorker} from './media-worker.js';
import {visitNotification} from './visit-worker.js';
const media=mediaWorker(manifest,security);
const qaPath='/__release-qa';
const cookieName='__Host-oa-release-qa';
const hidden={'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet','Cache-Control':'no-store'};
const qaHeaders={...security,...hidden,'Referrer-Policy':'same-origin','Content-Security-Policy':security['Content-Security-Policy'].replace("form-action 'none'","form-action 'self'"),'Content-Type':'text/html; charset=utf-8'};
async function equal(a,b){
  const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
  const [x,y]=await Promise.all([digest(a),digest(b)]);let difference=0;
  for(let i=0;i<x.length;i++)difference|=x[i]^y[i];return difference===0;
}
function available(env){return typeof env.RELEASE_QA_TOKEN==='string'&&env.RELEASE_QA_TOKEN.length>=32&&Number(env.RELEASE_QA_EXPIRES)>Date.now();}
async function authenticated(request,env){
  if(!available(env))return false;
  const token=(request.headers.get('cookie')||'').split(';').map(p=>p.trim()).find(p=>p.startsWith(cookieName+'='))?.slice(cookieName.length+1)||'';
  return equal(token,env.RELEASE_QA_TOKEN);
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname.startsWith(qaPath)){
      if(!available(env))return new Response('Not found',{status:404,headers:qaHeaders});
      if(url.pathname===qaPath&&request.method==='GET')return new Response('<!doctype html><html lang="en"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Owner release test</title><main><h1>Owner release test</h1><p>Temporary access for the approved synthetic delivery test.</p><form method="post"><label>Test token <input name="token" type="password" required autocomplete="off"></label><button>Open test intake</button></form></main></html>',{headers:qaHeaders});
      if(request.method!=='POST'||request.headers.get('origin')!==url.origin)return new Response('Rejected',{status:403,headers:qaHeaders});
      if(Number(request.headers.get('content-length'))>1024)return new Response('Rejected',{status:413,headers:qaHeaders});
      if(url.pathname===qaPath){
        const data=await request.formData();const token=data.get('token');
        if(typeof token!=='string'||!await equal(token,env.RELEASE_QA_TOKEN))return new Response('Rejected',{status:403,headers:qaHeaders});
        const seconds=Math.max(0,Math.floor((Number(env.RELEASE_QA_EXPIRES)-Date.now())/1000));
        return new Response(null,{status:303,headers:{...hidden,Location:'/ai-visibility.html','Set-Cookie':`${cookieName}=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=${seconds}`}});
      }
      if(url.pathname===qaPath+'/notification'&&await authenticated(request,env)){
        // Same validated relay, fixed fictional event data and a conspicuous TEST label.
        const event=(await request.json()).event;
        const routes={visit:'/index.html',class:'/workshop.html',resume:'/Brian_Olsen_DataAnnotation_Visual_AI_Trainer_Resume.pdf'};
        if(!Object.hasOwn(routes,event))return new Response('Rejected',{status:400,headers:qaHeaders});
        let receipt=null;
        const response=await visitNotification(new Request('https://olsenautomation.com/api/visit',{method:'POST',headers:{Origin:'https://olsenautomation.com','Sec-Fetch-Site':'same-origin','Content-Type':'application/json'},body:JSON.stringify({event,route:routes[event]})}),{VISIT_NOTIFICATIONS:'enabled'},async(endpoint,options)=>{
          const headers=new Headers(options.headers);headers.set('Title','SYNTHETIC RELEASE TEST - '+headers.get('Title'));
          let result;
          try{result=await fetch(endpoint,{...options,headers,body:'Owner-approved test. No real visitor or service request.\n'+options.body});}
          catch(error){receipt={error:error.name,message:error.message};throw error;}
          const text=await result.clone().text();let data;try{data=JSON.parse(text);}catch{}
          receipt=result.ok?{status:result.status,id:data?.id,time:data?.time,event:data?.event}:{status:result.status,error:data?.error||text.slice(0,500)};
          return result;
        });
        return Response.json({...await response.json(),receipt},{status:response.status,headers:hidden});
      }
      return new Response('Not found',{status:404,headers:qaHeaders});
    }
    if(url.pathname==='/api/visit')return Response.json({state:'disabled'},{headers:hidden});
    let response=await media.fetch(request,env);
    if(url.pathname==='/ai-visibility.html'&&request.method==='GET'&&response.status===200&&await authenticated(request,env)){
      response=new HTMLRewriter().on('body',{element(e){e.setAttribute('data-site-mode','production');}}).transform(response);
    }
    const headers=new Headers(response.headers);headers.set('X-Robots-Tag',hidden['X-Robots-Tag']);
    if(url.pathname.endsWith('.html')||url.pathname==='/')headers.set('Cache-Control','no-store');
    return new Response(response.body,{status:response.status,headers});
  }
};
