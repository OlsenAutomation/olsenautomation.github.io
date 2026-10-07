const HELIX_ITEMS = [{"id": 1, "title": "Contact details and hours", "text": "Use 805-396-6624 and info@helixlandscape.com, Monday-Friday 9 AM-5 PM. Confirm these are the public contact details and where website inquiries should arrive. What should we show for weekends?"}, {"id": 2, "title": "Current address", "text": "The old website lists 550 S G Street, Oxnard; the Google listing reviewed October 2 lists 1215 Meta Street, Ventura. Neither is assumed wrong. The preview omits a street address. Confirm the current address, whether customers visit, and what should be public."}, {"id": 3, "title": "Service area", "text": "Proposed wording: Ventura County and the South Bay, including Redondo Beach. Confirm the cities you want to serve and whether broader Los Angeles belongs. The preview avoids the conflicting old location wording."}, {"id": 4, "title": "About you and Helix", "text": "Confirm 20+ years in construction and seeing each job through start to finish. The added John Arney background describes horticulture, irrigation auditing, water-efficient consulting and education, plus residential and commercial landscape design and installation."}, {"id": 5, "title": "Credentials, bonding and insurance", "text": "Approve California C-27 license 1017249 and the linked CWM / QWEL credentials. Public directories were checked October 6; no certificate number or Expert designation is claimed. Confirm current bonding before retaining \"licensed + bonded.\" Please confirm current general liability insurance; no coverage amount will be added without your details."}, {"id": 6, "title": "Current services and consultation wording", "text": "The preview carries over design/demolition, trees/plants, green roofs, sod/synthetic turf, carpentry/woodwork, stone paths/patios, concrete work, water features, outdoor kitchens, irrigation and lighting. Confirm what you still offer and want emphasized. Also confirm the free-consultation invitation and 90-minute appointment wording."}, {"id": 7, "title": "Rebate and lighting statements", "text": "Confirm \"turf rebates accepted\" and which programs apply. The restored lighting section says LED-only, up to 80,000 hours, lower electricity use, replaceable lamps and warm-to-cool color options, with Safety / Security / Magic explanations. Confirm these apply to your fixtures and wording. The old nine-year / twice-as-long-at-night comparison is omitted; approve the shorter version or request a correction."}, {"id": 8, "title": "Existing photos and optional new photos", "text": "The Gallery now has 31 selected images from the existing website, including project drawings and progress photos. Confirm which can be reused and whether you have permission for any third-party photos or drawings. Identify anything to remove or prioritize. An optional photo session of up to one hour is included if useful; say whether you want it."}, {"id": 9, "title": "AI hero and original logo", "text": "The Malibu hero is AI concept imagery for the design direction, not a completed Helix project. Confirm whether to keep it or choose a real photo instead. The original tree logo is retained; confirm this is the logo to use."}, {"id": 10, "title": "Reviews page", "text": "Approve the dedicated Reviews page with links to your existing Yelp and Houzz profiles. It currently has no imported quotations, rating claims or automatic review feed. If an excerpt is later requested, its wording, source and permission need separate confirmation."}];
// Uses the existing MailApp authorization and private project properties.
// No response-reading public endpoint. Never logs answers or changes recipient.
function handleHelix_(data) {
  const result = {accepted:false,stored:false,emailed:false,request_id:String(data.request_id || '')};
  try {
    if(!['helix-2026-10-07-v1','helix-2026-10-07-v2'].includes(data.version) || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(result.request_id))throw Error('Unsupported form.');
    if(Object.keys(data).sort().join(',')!==(data.version==='helix-2026-10-07-v2'?'answers,email,extra,intake_type,name,request_id,started_at,tree,version':'answers,email,extra,intake_type,name,request_id,started_at,version'))throw Error('Unsupported fields.');
    validateFormAge_(Number(data.started_at));
    if(typeof data.name!=='string'||!data.name.trim()||data.name.length>120||typeof data.email!=='string'||data.email.length>254)throw Error('Complete contact information.');
    const email=cleanEmail_(data.email);
    if(typeof data.extra!=='string'||data.extra.length>500||!Array.isArray(data.answers)||data.answers.length!==10)throw Error('Complete every checklist item.');
    data.answers.forEach(function(a,i){
      if(!a||Object.keys(a).sort().join(',')!=='choice,id,note'||a.id!==i+1||!['approve','change','discuss'].includes(a.choice)||typeof a.note!=='string'||a.note.length>500||(a.choice==='change'&&!a.note.trim())||(a.choice==='approve'&&a.note!==''))throw Error('Check the checklist answers.');
    });
    const normalized={version:data.version,name:data.name,email:data.email,answers:data.answers,extra:data.extra};
    if(data.version==='helix-2026-10-07-v2'){
      const t=data.tree;
      if(!t||Object.keys(t).sort().join(',')!=='choice,note'||!['','original','new','discuss'].includes(t.choice)||typeof t.note!=='string'||t.note.length>500||(!t.choice&&t.note!==''))throw Error('Check the optional tree preference.');
      normalized.tree=t;
    }
    const canonical=JSON.stringify(normalized);
    if(Utilities.newBlob(canonical).getBytes().length>7600)throw Error('Please shorten your notes.');
    const hash=digest_(canonical),key='helix:'+result.request_id,lock=LockService.getScriptLock();lock.waitLock(10000);
    try {
      const properties=PropertiesService.getScriptProperties();
      let previous=properties.getProperty(key),record=previous?JSON.parse(previous):null;
      if(record&&record.hash!==hash)throw Error('This reference was already used for different answers.');
      if(record&&record.emailed)return jsonResponse_({accepted:true,stored:true,emailed:true,duplicate:true,request_id:result.request_id,receipt_id:result.request_id});
      const cache=CacheService.getScriptCache(),rateKey='helix-hour:'+Math.floor(Date.now()/3600000),count=Number(cache.get(rateKey)||0);
      if(count>=10||MailApp.getRemainingDailyQuota()<1)throw Error('Delivery temporarily unavailable. Please contact Brian.');
      if(!record){
        const all=properties.getProperties(),storageBytes=Utilities.newBlob(JSON.stringify(all)).getBytes().length;
        if(storageBytes>400000||Object.keys(all).filter(function(k){return k.indexOf('helix:')===0;}).length>=40)throw Error('Receipt storage needs Brian’s attention.');
        record={hash:hash,received_at:new Date().toISOString(),emailed:false,payload:JSON.parse(canonical)};
        const serialized=JSON.stringify(record);if(Utilities.newBlob(serialized).getBytes().length>8800)throw Error('Please shorten your notes.');
        properties.setProperty(key,serialized);
        if(properties.getProperty(key)!==serialized)throw Error('Receipt could not be verified.');
      }
      result.stored=true;
      const labels={approve:'Approve as written',change:'Needs a change',discuss:'Not sure — discuss with Brian'};
      const lines=['Helix content confirmation — '+(data.name.indexOf('[TEST]')>=0?'TEST SUBMISSION':'client feedback'),'','From: '+cleanSingleLine_(data.name,120),'Reply email: '+email,'Receipt: '+result.request_id,'Received: '+record.received_at,'Checklist: '+data.version,''];
      HELIX_ITEMS.forEach(function(item,i){const a=data.answers[i];lines.push(item.id+'. '+item.title,item.text,'ANSWER: '+labels[a.choice],a.note?'NOTE: '+a.note:'','');});
      if(data.version==='helix-2026-10-07-v2'){const treeLabels={original:'Keep the original',new:'Use the new version',discuss:'Discuss changes'};lines.push('Optional tree redesign:',treeLabels[data.tree.choice]||'No preference selected',data.tree.note?'NOTE: '+data.tree.note:'','Original remains on the preview. This preference does not automatically change the website.','');}
      lines.push('Anything else / materials to send:',data.extra||'(none)','', 'Content feedback only. Not a signed contract, payment authorization, or approval to launch. Price and scope remain separate.');
      cache.put(rateKey,String(count+1),3600);
      MailApp.sendEmail('brian@olsenautomation.com','Helix content confirmation'+(data.name.indexOf('[TEST]')>=0?' — TEST':'')+' — '+result.request_id,lines.join('\n'),{name:'Olsen Automation',replyTo:email});
      record.emailed=true;record.emailed_at=new Date().toISOString();
      const finalRecord=JSON.stringify(record);properties.setProperty(key,finalRecord);
      if(properties.getProperty(key)!==finalRecord)throw Error('Delivery receipt could not be verified.');
      return jsonResponse_({accepted:true,stored:true,emailed:true,request_id:result.request_id,receipt_id:result.request_id});
    } finally {lock.releaseLock();}
  } catch(error) {
    // A send timeout or storage failure stays unconfirmed. A later retry may
    // produce another email in the rare send-success/receipt-write-failure window.
    result.error='Delivery not confirmed. Your answers are retained in the form; retry or contact Brian.';
    return jsonResponse_(result);
  }
}
