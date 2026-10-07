const items = await fetch('items.json').then(r => r.json());
const $ = id => document.getElementById(id);
const labels = {approve:'Approve as written',change:'Needs a change',discuss:'Not sure — discuss with Brian'};
const VERSION = 'helix-2026-10-07-v2', KEY = 'oa-helix-draft-v1';
let draftId = crypto.randomUUID(), pending = null, busy = false, ready = false;
const startedAt = Date.now();
for (const item of items) {
  const field = document.createElement('fieldset'); field.id = `item-${item.id}`;
  const legend = document.createElement('legend'); legend.textContent = `${item.id}. ${item.title}`; field.append(legend);
  const copy = document.createElement('p'); copy.textContent = item.text; field.append(copy);
  for (const [value,text] of Object.entries(labels)) {
    const label = document.createElement('label'); label.className = 'choice';
    const radio = document.createElement('input'); Object.assign(radio,{type:'radio',name:`choice-${item.id}`,value,required:true});
    label.append(radio,document.createTextNode(text)); field.append(label);
  }
  const notes = document.createElement('div'); notes.hidden = true; notes.id = `notes-${item.id}`;
  const label = document.createElement('label'); label.htmlFor = `note-${item.id}`;
  const box = document.createElement('textarea'); Object.assign(box,{id:`note-${item.id}`,name:`note-${item.id}`,maxLength:500,rows:3});
  notes.append(label,box); field.append(notes); $('items').append(field);
  field.addEventListener('change',()=>updateNotes(item.id));
}
function choice(id) { return document.querySelector(`[name="choice-${id}"]:checked`)?.value || ''; }
function updateNotes(id) {
  const value = choice(id); $(`notes-${id}`).hidden = value === 'approve' || !value;
  $(`note-${id}`).required = value === 'change';
  document.querySelector(`label[for="note-${id}"]`).textContent = value === 'change' ? 'What needs to change? (required)' : 'What would you like to discuss? (optional)';
}
const treeLabels={original:'Keep the original',new:'Use the new version',discuss:'Discuss changes'};
const treeChoice=()=>document.querySelector('[name="tree-choice"]:checked')?.value||'';
$('tree').addEventListener('change',()=>{$('tree-notes').hidden=!treeChoice();});
function answers() { return {tree:{choice:treeChoice(),note:treeChoice()?$('tree-note').value.trim():''},name:$('name').value.trim(),email:$('email').value.trim(),extra:$('extra').value.trim(),answers:items.map(item=>({id:item.id,choice:choice(item.id),note:choice(item.id)==='approve'?'':$(`note-${item.id}`).value.trim()}))}; }
function save() {
  if (!$('remember').checked) return;
  try { localStorage.setItem(KEY,JSON.stringify({version:VERSION,draftId,values:answers()})); }
  catch { $('status').textContent='This device could not save your draft. Keep this page open until you submit.'; }
}
try { $('resume').hidden = !localStorage.getItem(KEY); } catch {}
$('remember').addEventListener('change',()=>{if($('remember').checked)save();else{try{localStorage.removeItem(KEY);}catch{}$('resume').hidden=true;}});
$('resume').addEventListener('click',()=>{
  try {
    const data=JSON.parse(localStorage.getItem(KEY)); if(!['helix-2026-10-07-v1',VERSION].includes(data.version))throw Error();
    draftId=data.draftId; const v=data.values; $('name').value=v.name; $('email').value=v.email; $('extra').value=v.extra;
    for(const a of v.answers){const radio=document.querySelector(`[name="choice-${a.id}"][value="${a.choice}"]`);if(radio)radio.checked=true;$(`note-${a.id}`).value=a.note;updateNotes(a.id);}
    if(v.tree?.choice){const radio=document.querySelector(`[name="tree-choice"][value="${v.tree.choice}"]`);if(radio)radio.checked=true;$('tree-note').value=v.tree.note;$('tree-notes').hidden=false;}
    $('remember').checked=true; $('resume').hidden=true; $('status').textContent='Saved draft restored. Nothing has been sent.';
  } catch { $('status').textContent='The saved draft could not be restored. Please complete this form.'; }
});
$('feedback').addEventListener('input',()=>{if(pending)draftId=crypto.randomUUID();pending=null;save();});
$('feedback').addEventListener('submit',event=>{
  event.preventDefault(); if(!$('feedback').reportValidity())return;
  const data=answers(); const missing=data.answers.find(a=>a.choice==='change'&&!a.note);
  if(missing){$(`note-${missing.id}`).setCustomValidity('Please describe the change.');$(`note-${missing.id}`).reportValidity();return;}
  $('review-content').replaceChildren();
  const contact=document.createElement('p');contact.textContent=`${data.name} · ${data.email}`;$('review-content').append(contact);
  for(const item of items){const a=data.answers.find(a=>a.id===item.id),row=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p'),note=document.createElement('p');h.textContent=`${item.id}. ${item.title}`;p.textContent=item.text;note.textContent=labels[a.choice]+(a.note?'\n'+a.note:'');row.append(h,p,note);$('review-content').append(row);}
  const treeRow=document.createElement('article'),treeHeading=document.createElement('h3'),treeText=document.createElement('p');treeHeading.textContent='Optional tree redesign';treeText.textContent=(treeLabels[data.tree.choice]||'No preference selected')+(data.tree.note?'\n'+data.tree.note:'');treeRow.append(treeHeading,treeText);$('review-content').append(treeRow);
  if(data.extra){const p=document.createElement('p');p.textContent='Anything else / materials to send:\n'+data.extra;$('review-content').append(p);}
  $('edit').hidden=true;$('summary').hidden=false;$('summary').focus();$('status').textContent='Review complete. Nothing has been sent yet.';
});
for(const item of items)$(`note-${item.id}`).addEventListener('input',()=> $(`note-${item.id}`).setCustomValidity(''));
$('back').addEventListener('click',()=>{if(busy)return;$('summary').hidden=true;$('edit').hidden=false;$('review').focus();});
async function availability(){
 $('retry-connection').disabled=true;
 try{const r=await fetch('/api/helix-feedback',{cache:'no-store',signal:AbortSignal.timeout(30000)}),d=await r.json();ready=r.ok&&d.ready===true;}catch{ready=false;}
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 $('availability').textContent=ready?'Complete the checklist below, then review and submit.':local?'Preview only — delivery is not enabled. Please do not send this link to John yet.':'The submission service is temporarily unavailable. Your answers remain here. Retry the connection before submitting.';
 $('retry-connection').hidden=ready||local;$('retry-connection').disabled=false;$('send').disabled=!ready;
}
$('retry-connection').addEventListener('click',availability);
$('send').addEventListener('click',async()=>{
  if(busy||!ready)return;busy=true;$('send').disabled=true;$('back').disabled=true;$('status').textContent='Sending your answers. Please keep this page open…';
  pending ||= {version:VERSION,request_id:draftId,started_at:startedAt,...answers()};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);
  try {
    const response=await fetch('/api/helix-feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending),signal:controller.signal});
    const receipt=await response.json();
    if(!response.ok||receipt.accepted!==true||receipt.request_id!==pending.request_id||receipt.stored!==true||receipt.emailed!==true||!receipt.receipt_id)throw Error(receipt.error||'Receipt was not confirmed.');
    $('summary').hidden=true;$('receipt').hidden=false;$('reference').textContent=`Reference: ${receipt.receipt_id}`;$('receipt').focus();$('status').textContent='Submission confirmed.';try{localStorage.removeItem(KEY);}catch{}
  } catch { $('status').textContent='Delivery has not been confirmed. Your answers are still here. Retry with the same reference, or contact Brian directly. Do not assume Brian received this.'; }
  finally{clearTimeout(timer);busy=false;$('send').disabled=!ready;$('back').disabled=false;}
});
await availability();
