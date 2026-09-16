// Exercise the preserved receiver with in-memory Google services. No network or mail.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const source=readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8');
const fixture=()=>({
  intake_type:'olsen_automation_ai_visibility',
  source_page:'https://olsenautomation.com/ai-visibility.html',
  client:{business_name:'SITE MIGRATION QA — SYNTHETIC',contact_name:'Synthetic QA',contact_email:'qa@example.com',website:'https://example.com',main_location:'Synthetic test'},
  visibility:{target_queries:['Synthetic test query']},
  confirmations:{authorized_representative:true,no_secrets_or_private_customer_data:true},
  access_readiness:{credentials_included:false},
});
function harness({quota=100,mailFails=false}={}){
  const sent=[],cache=new Map();let locked=false;
  const services={
    console:{error(){}},
    Utilities:{
      newBlob:(text,type,name)=>({text,type,name,getBytes:()=>[...Buffer.from(text)]}),
      computeDigest:(_,text)=>[...createHash('sha256').update(text).digest()],
      base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString('base64url'),
      DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},formatDate:()=>new Date().toISOString().slice(0,10),
    },
    CacheService:{getScriptCache:()=>({get:key=>cache.get(key),put:(key,value)=>cache.set(key,value),remove:key=>cache.delete(key)})},
    LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})},
    MailApp:{getRemainingDailyQuota:()=>quota,sendEmail(...args){if(mailFails)throw Error('Synthetic mail failure');sent.push(args);}},
    HtmlService:{XFrameOptionsMode:{ALLOWALL:'test'},createHtmlOutput:content=>({content,setXFrameOptionsMode(){return this;}})},
  };
  const context=vm.createContext(services);vm.runInContext(source,context,{timeout:1000});
  return {sent,cache,setMailFailure:value=>{mailFails=value;},submit(intake=fixture(),extra={}){
    const response=context.doPost({parameter:{form_started_at:String(Date.now()-5000),payload:JSON.stringify(intake),...extra}});
    assert.equal(locked,false,'receiver releases its lock');
    const envelope=JSON.parse(response.content.match(/postMessage\((\{.*\}), "\*"\)/)[1]);
    assert.equal(envelope.channel,'olsen_ai_visibility_intake');
    return envelope.payload;
  }};
}

const happy=harness(),intake=fixture();intake.handoff={recipient:'not-the-recipient@example.com'};
assert.equal(happy.submit(intake).accepted,true);
assert.equal(happy.sent.length,1);assert.equal(happy.sent[0][0],'brian@olsenautomation.com');
assert.deepEqual(JSON.parse(happy.sent[0][3].attachments[0].text),intake,'attachment preserves submitted fields');
assert.equal(happy.submit(intake).accepted,false,'identical submissions are suppressed');
assert.equal(happy.sent.length,1);

for(const mutate of [
  x=>{x.source_page='https://example.com/';},
  x=>{x.confirmations.authorized_representative=false;},
  x=>{x.confirmations.no_secrets_or_private_customer_data=false;},
  x=>{x.client.contact_email='not-an-email';},
  x=>{x.visibility.target_queries=[];},
  x=>{x.visibility.target_queries=Array(21).fill('query');},
  x=>{x.access_readiness.credentials_included=true;},
  x=>{x.client.api_key='SYNTHETIC-NONSECRET';},
]){
  const h=harness(),invalid=fixture();mutate(invalid);
  assert.equal(h.submit(invalid).accepted,false);assert.equal(h.sent.length,0);
}
for(const extra of [{form_started_at:String(Date.now())},{form_started_at:String(Date.now()-90000000)},{payload:'{'},{payload:'x'.repeat(100001)}]){
  const h=harness();assert.equal(h.submit(fixture(),extra).accepted,false);assert.equal(h.sent.length,0);
}
const bot=harness();assert.equal(bot.submit(fixture(),{company_website_confirm:'synthetic-bot'}).accepted,true);assert.equal(bot.sent.length,0);
const quota=harness({quota:0});assert.equal(quota.submit().accepted,false);assert.equal(quota.sent.length,0);
const retry=harness({mailFails:true});assert.equal(retry.submit().accepted,false);retry.setMailFailure(false);assert.equal(retry.submit().accepted,true);
const limit=harness();for(let i=0;i<30;i++){const x=fixture();x.client.business_name+=' '+i;assert.equal(limit.submit(x).accepted,true);}
assert.equal(limit.submit().accepted,false);assert.equal(limit.sent.length,30);
console.log('PASS: preserved intake contract, fixed recipient, exact attachment, required confirmations, secret-field rejection, size/age limits, honeypot, duplicate/rate limits, quota rejection and retry after mail failure. In-memory services only; no email sent.');
