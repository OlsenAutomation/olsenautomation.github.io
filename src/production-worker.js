import {feedback} from './helix-feedback.js';
import manifest from '../dist-production/media/manifest.json' with {type:'json'};
import security from './_data/production-headers.json' with {type:'json'};
import {mediaWorker} from './media-worker.js';
import {visitNotification} from './visit-worker.js';
import intake from './_data/live-intake-preservation.json' with {type:'json'};
const media=mediaWorker(manifest,security);
// Keep the reviewed HTML intact at the proxy, including on newly activated
// zones where Cloudflare may otherwise inject its default RUM analytics script.
export default {async fetch(request,env){
 const response=await serve(request,env);
 if(!response.headers.get('content-type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);
 const cache=headers.get('cache-control');
 if(!/(?:^|,)\s*no-transform\s*(?:,|$)/i.test(cache||''))headers.set('Cache-Control',[cache,'no-transform'].filter(Boolean).join(', '));
 return new Response(response.body,{status:response.status,headers});
}};
async function serve(request,env){
 const url=new URL(request.url);
 if(url.hostname==='www.olsenautomation.com'){
  url.hostname='olsenautomation.com';return Response.redirect(url,301);
 }
 if(url.pathname==='/api/helix-feedback')return feedback(request);
 if(url.pathname==='/feedback/helix'){url.pathname+='/';return Response.redirect(url,301);}
 if(url.pathname.startsWith('/feedback/helix/')){
  const headers=new Headers(security);
  headers.set('X-Robots-Tag','noindex,nofollow,noarchive,nosnippet');
  headers.set('Cache-Control','no-store, no-transform');
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
  if(url.pathname==='/feedback/helix/')url.pathname+='index.html';
  const response=await env.ASSETS.fetch(new Request(url,request));
  const merged=new Headers(response.headers);for(const [k,v]of headers)merged.set(k,v);
  return new Response(response.body,{status:response.status,headers:merged});
 }
 if(url.pathname==='/client-setup'){
  url.pathname+='/';return Response.redirect(url,301);
 }
 if(url.pathname.startsWith('/client-setup/')){
  const headers=new Headers(security);
  headers.set('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');
  headers.set('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
  if(url.pathname==='/client-setup/')url.pathname+='index.html';
  const response=await env.ASSETS.fetch(new Request(url,request));
  const merged=new Headers(response.headers);
  for(const [key,value] of headers)merged.set(key,value);
  return new Response(response.body,{status:response.status,headers:merged});
 }
 if(url.pathname==='/learn'||url.pathname==='/learn/scale-works'){
  url.pathname+='/';return Response.redirect(url,301);
 }
 if(url.pathname.startsWith('/learn/')){
  const headers=new Headers(security);
  headers.set('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');
  headers.set('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
  if(url.pathname.endsWith('/'))url.pathname+='index.html';
  const response=await env.ASSETS.fetch(new Request(url,request));
  const merged=new Headers(response.headers);
  for(const [key,value] of headers)merged.set(key,value);
  return new Response(response.body,{status:response.status,headers:merged});
 }
 if(url.pathname==='/api/visit')return visitNotification(request,env);
 if(url.pathname===intake.route.slice(0,-1)){
  url.pathname=intake.route;return Response.redirect(url,301);
 }
 if(url.pathname.startsWith(intake.route)){
  const headers=new Headers(security);
  headers.set('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');
  headers.set('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
  if(url.pathname===intake.route)url.pathname+='index.html';
  if(url.pathname===intake.route+'index.html')headers.set('Content-Security-Policy',security['Content-Security-Policy'].replace("form-action 'none'","form-action https://script.google.com https://script.googleusercontent.com; frame-src https://script.google.com https://*.googleusercontent.com"));
  const response=await env.ASSETS.fetch(new Request(url,request));
  const merged=new Headers(response.headers);
  for(const [key,value] of headers)merged.set(key,value);
  return new Response(response.body,{status:response.status,headers:merged});
 }
 return media.fetch(request,env);
}
