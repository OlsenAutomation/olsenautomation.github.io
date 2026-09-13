import {clamp,frameIndex,mediaTime,selectVariant} from './motion-core.js';
const $=s=>document.querySelector(s);
const root=$('.workshop-page'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=navigator.connection?.saveData||false;
let manifest,still=reduced.matches||saveData,roomEnabled=false,roomManual=false,progress=0;
let stairsEnabled=false,stairsManual=false,sequence,epoch=0,desired=0,ticking=false;
const cache=new Map(),roomVideos=[$('#movie'),$('#workbench-video')],allVideos=[...root.querySelectorAll('video')];
const room=$('#journey'),stage=$('#stage'),poster=$('#poster'),roomSlider=$('#room-position');
const stairs=$('#stairs'),frame=$('#exit-frame'),doorPoster=frame.src,door=$('.exit-door');
const stairSlider=$('#stair-position'),motion=$('#motion-toggle');
const smooth=()=>reduced.matches?'instant':'smooth';
const choose=name=>selectVariant(manifest.videos[name].variants,innerWidth<=760?640:1280);
function updatePreference(){
  motion.hidden=false;motion.disabled=reduced.matches||saveData;
  motion.textContent=still?'Still views active':'Use still views';motion.setAttribute('aria-pressed',String(still));
  $('#enter-room').hidden=still||!manifest;$('#load-stairs').hidden=still||!manifest;
  if(still){
    roomEnabled=false;stairsEnabled=false;epoch++;cache.clear();
    root.classList.add('static-mode');root.classList.remove('motion-enabled');
    allVideos.forEach(v=>{v.pause();v.removeAttribute('src');v.load();});roomVideos.forEach(v=>v.hidden=true);poster.hidden=false;
    root.querySelector('.room-controls').hidden=true;$('#stair-control').hidden=true;
    stairs.classList.remove('motion-active');frame.src=doorPoster;door.classList.add('active');door.inert=false;
    setCopy(0);$('#status').textContent='Still views are active. No animation is required.';$('#stair-status').textContent='Still door view.';
  }
}
motion.addEventListener('click',()=>{still=!still;updatePreference();});
reduced.addEventListener('change',()=>{still=reduced.matches||saveData;updatePreference();});
function setCopy(p){
  const index=p<.32?0:p<.67?1:2;
  ['intro','arrival','workbench'].forEach((id,i)=>{const el=$('#'+id);el.classList.toggle('active',i===index);el.inert=i!==index;el.setAttribute('aria-hidden',String(i!==index));});
}
let loadingTimer;
function loadRoomVideo(index){
  const v=roomVideos[index];
  if(v.getAttribute('src'))return;
  v.src=choose(index?'workbench':'entry').url;v.load();
  clearTimeout(loadingTimer);loadingTimer=setTimeout(()=>{if(!still){$('#status').textContent='The room is taking longer to load. You can continue with the still view.';$('#load-button').hidden=false;}},12000);
}
function setRoom(p){
  progress=clamp(p);roomSlider.value=String(Math.round(progress*100));roomSlider.setAttribute('aria-valuetext',`${Math.round(progress*100)} percent through the room`);
  if(!roomEnabled||still)return;
  const total=manifest.videos.entry.duration+manifest.videos.workbench.duration;
  const time=progress*total,index=time<manifest.videos.entry.duration?0:1;
  loadRoomVideo(index);const v=roomVideos[index];
  roomVideos.forEach((el,i)=>el.hidden=i!==index||el.readyState<2);poster.hidden=v.readyState>=2;
  if(v.readyState>=2 && !v.seeking){const local=index?time-manifest.videos.entry.duration:time;v.currentTime=mediaTime(local/v.duration,v.duration);}
  setCopy(progress);
}
roomVideos.forEach((v,index)=>{
  v.addEventListener('loadeddata',()=>{clearTimeout(loadingTimer);$('#load-button').hidden=true;$('#status').textContent='Stop to look. Scroll up to return, or use the position control.';setRoom(progress);});
  v.addEventListener('seeked',()=>{
    if(!roomEnabled||still)return;
    const total=manifest.videos.entry.duration+manifest.videos.workbench.duration,time=progress*total;
    const active=time<manifest.videos.entry.duration?0:1;
    const target=mediaTime((index?time-manifest.videos.entry.duration:time)/v.duration,v.duration);
    if(index===active&&Math.abs(v.currentTime-target)>.08)setRoom(progress);
  });
  v.addEventListener('error',()=>{if(!v.getAttribute('src'))return;clearTimeout(loadingTimer);v.hidden=true;poster.hidden=false;$('#status').textContent='This scene is unavailable. The still view and class information remain available.';$('#load-button').hidden=false;});
});
function beginRoom(){
  if(still||!manifest)return;
  roomEnabled=true;roomManual=true;root.classList.remove('static-mode');root.classList.add('motion-enabled');root.querySelector('.room-controls').hidden=false;
  $('#status').textContent='Loading the room…';setRoom(.05);
}
$('#enter-room').addEventListener('click',beginRoom);
$('#load-button').addEventListener('click',()=>{roomVideos.forEach(v=>v.removeAttribute('src'));beginRoom();});
roomSlider.addEventListener('input',()=>{roomManual=true;setRoom(Number(roomSlider.value)/100);});
async function showFrame(index){
  if(!stairsEnabled||still)return;desired=index;const request=epoch;
  if(!cache.has(index)){const img=new Image();img.decoding='async';img.src=sequence.frames[index].url;cache.set(index,{img,promise:img.decode().then(()=>true).catch(()=>false)});}
  const slot=cache.get(index),ok=await slot.promise;
  if(request!==epoch||index!==desired||!stairsEnabled||still)return;
  if(ok){frame.src=slot.img.src;frame.dataset.frameIndex=String(index);}else $('#stair-status').textContent='A frame could not load. The last still remains visible.';
  for(const i of cache.keys())if(Math.abs(i-index)>2)cache.delete(i);
  if(index+1<sequence.count&&!cache.has(index+1)){const img=new Image();img.src=sequence.frames[index+1].url;cache.set(index+1,{img,promise:img.decode().then(()=>true).catch(()=>false)});}
}
function setStairs(p){
  p=clamp(p);stairSlider.value=String(Math.round(p*100));door.classList.toggle('active',p>=.9);door.inert=p<.9;
  $('.exit-meter span').style.transform=`scaleX(${p})`;showFrame(frameIndex(p,sequence.count));
}
$('#load-stairs').addEventListener('click',()=>{if(still||!manifest)return;sequence=selectVariant(manifest.stairs.variants,innerWidth<=760?480:960);stairsEnabled=true;stairsManual=true;epoch++;stairs.classList.add('motion-active');$('#stair-control').hidden=false;$('#stair-status').textContent='Scroll forward to walk upstairs, or use the position control.';setStairs(0);});
stairSlider.addEventListener('input',()=>{stairsManual=true;if(stairsEnabled)setStairs(Number(stairSlider.value)/100);});
function staticDoor(){stairsEnabled=false;epoch++;stairs.classList.remove('motion-active');frame.src=doorPoster;door.classList.add('active');door.inert=false;$('#stair-control').hidden=true;}
$('#jump-door').addEventListener('click',event=>{event.preventDefault();staticDoor();$('#door-stage').scrollIntoView({behavior:'instant'});});
$('#final-signup').addEventListener('click',event=>{event.preventDefault();$('#interest').scrollIntoView({behavior:'instant'});$('#first-name').focus({preventScroll:true});});
addEventListener('wheel',()=>{roomManual=false;stairsManual=false;},{passive:true});
addEventListener('touchmove',event=>{if(event.target!==roomSlider&&event.target!==stairSlider){roomManual=false;stairsManual=false;}},{passive:true});
addEventListener('keydown',event=>{if(event.target!==roomSlider&&event.target!==stairSlider&&['PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(event.key)){roomManual=false;stairsManual=false;}});
function scrollUpdate(){
  ticking=false;if(still)return;
  const headerHeight=document.querySelector('.site-header').getBoundingClientRect().height;
  if(roomEnabled&&!roomManual){const r=room.getBoundingClientRect();if(r.top<=headerHeight+4&&r.bottom>0)setRoom((headerHeight-r.top)/Math.max(1,room.offsetHeight-stage.offsetHeight));}
  if(stairsEnabled&&!stairsManual){const r=stairs.getBoundingClientRect();if(r.top<=headerHeight+4&&r.bottom>0)setStairs((headerHeight-r.top)/Math.max(1,stairs.offsetHeight-$('#door-stage').offsetHeight));}
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(scrollUpdate);}},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)allVideos.forEach(v=>v.pause());});
const form=$('#interest-form'),dialog=$('#email-dialog');let draft='';
$('#prepare-message').hidden=false;
form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const d=new FormData(form);
  draft=`Hi Brian,\n\nI’m interested in the first AI Without the Hype workshop.\n\nName: ${d.get('name').trim()}\nEmail: ${d.get('email').trim()}\nBest time: ${d.get('time')}\nDevice: ${d.get('device')}\n\nWhat I would like AI to help me do:\n${d.get('goal').trim()}\n\nI understand this is an interest list, not a confirmed reservation.\n`;
  $('#message-preview').textContent=draft;$('#open-email').href='mailto:brian@olsenautomation.com?subject='+encodeURIComponent('AI Without the Hype — workshop interest')+'&body='+encodeURIComponent(draft);
  $('#form-status').textContent='Your email is ready to review. Nothing has been sent.';$('#copy-status').textContent='';dialog.showModal();
});
$('#close-dialog').addEventListener('click',()=>dialog.close());
$('#copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);$('#copy-status').textContent='Copied. Paste it into your email app and review before sending.';}catch{$('#copy-status').textContent='Copy is unavailable. Select the message above or download the text.';}});
$('#download-draft').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='workshop-interest.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
const returnDialog=$('#return-portal'),returnVideo=returnDialog.querySelector('video');let returnTimer;
const leave=()=>{clearTimeout(returnTimer);location.href='/';};
$('.exit-door-link').addEventListener('click',async event=>{if(still||!manifest)return;event.preventDefault();returnVideo.src=choose('portal').url;returnDialog.showModal();returnTimer=setTimeout(leave,14000);try{await returnVideo.play();}catch{leave();}});
returnVideo.addEventListener('ended',leave);returnVideo.addEventListener('error',()=>{if(returnDialog.open)leave();});
returnDialog.addEventListener('close',()=>{clearTimeout(returnTimer);returnVideo.pause();});$('#cancel-return').addEventListener('click',()=>returnDialog.close());
updatePreference();
fetch('/media/manifest.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{manifest=data;updatePreference();}).catch(()=>{$('#status').textContent='Motion files are unavailable. Read the class information or join the interest list below.';});
