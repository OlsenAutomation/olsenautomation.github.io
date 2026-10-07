const ENDPOINT='https://script.google.com/macros/s/AKfycbwtqcIqB02Q_BT4d5c3z1OCy6rQif5Jeyg897wQLBoY6UA5vHBR8NOcOdh1SAbmFC3FTQ/exec';
export const VERSION='helix-2026-10-07-v1';
const headers={'Cache-Control':'no-store','Content-Type':'application/json','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'no-referrer'};
const reply=(status,data)=>Response.json(data,{status,headers});
export async function feedback(request,send=fetch){
 const url=new URL(request.url);
 if(request.method==='GET'){
  try{const r=await send(ENDPOINT,{signal:AbortSignal.timeout(25000)}),d=await r.json();return reply(200,{ready:r.ok&&d.helix_version===VERSION});}catch{return reply(503,{ready:false});}
 }
 if(request.method!=='POST')return reply(405,{error:'Method not allowed'});
 if(request.headers.get('origin')!==url.origin||request.headers.get('content-type')!=='application/json')return reply(403,{error:'Unsupported request'});
 const reader=request.body?.getReader();if(!reader)return reply(400,{error:'Missing answers'});
 let chunks=[],size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8000){await reader.cancel();return reply(413,{error:'Answers are too long'});}chunks.push(value);}
 let data;try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}data=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply(400,{error:'Invalid answers'});}
 if(data?.version!==VERSION)return reply(400,{error:'Unsupported checklist version'});
 try{
  const response=await send(ENDPOINT,{method:'POST',body:new URLSearchParams({payload:JSON.stringify({...data,intake_type:'olsen_automation_helix_feedback'}),form_started_at:String(data.started_at)}),signal:AbortSignal.timeout(30000)});
  const raw=await response.text();let receipt;try{receipt=JSON.parse(raw);}catch{return reply(503,{error:'Receipt unavailable'});}
  if(!response.ok||receipt.request_id!==data.request_id||receipt.accepted!==true||receipt.stored!==true||receipt.emailed!==true||!receipt.receipt_id)return reply(503,{error:'Receipt not confirmed'});
  return reply(200,{accepted:true,stored:true,emailed:true,request_id:receipt.request_id,receipt_id:receipt.receipt_id,duplicate:receipt.duplicate===true});
 }catch{return reply(503,{error:'Delivery not confirmed'});}
}
