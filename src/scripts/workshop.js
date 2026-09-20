import {selectVariant} from './motion-core.js';
import {BufferedJourney} from './buffered-journey.js';
import {scrollProgress,ScrollSmoother} from './scroll-journey.js';
const $=s=>document.querySelector(s);
const root=$('.workshop-page'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=navigator.connection?.saveData||false;
const room=$('#journey'),stage=$('#stage'),poster=$('#poster');
const stairs=$('#stairs'),exitStage=$('#door-stage'),frame=$('#exit-frame'),doorPoster=frame.src,door=$('.exit-door');
const motion=$('#motion-toggle'),roomVideos=[$('#movie'),$('#workbench-video')],stairVideo=$('#stair-video');
let manifest,still=reduced.matches||saveData,roomPlayer,stairPlayer,roomScroll,stairScroll;
let copyIndex=-1,ticking=false,intent=false,roomFailed=false,stairsFailed=false;
function setCopy(p){
  const index=p<.28?0:p<.66?1:2;
  if(index===copyIndex)return;
  copyIndex=index;
  ['intro','arrival','workbench'].forEach((id,i)=>{const el=$('#'+id);el.classList.toggle('active',i===index);el.inert=i!==index;el.setAttribute('aria-hidden',String(i!==index));});
}
function setDoor(active){
  door.classList.toggle('active',active);door.inert=!active;door.setAttribute('aria-hidden',String(!active));
}
function updatePreference(){
  motion.hidden=false;motion.disabled=reduced.matches||saveData;
  motion.textContent=still?'Still views active':'Use still views';motion.setAttribute('aria-pressed',String(still));
  root.classList.toggle('static-mode',still);root.classList.toggle('motion-enabled',!still);
  stairs.classList.toggle('motion-active',!still);
  roomScroll?.stop();stairScroll?.stop();
  roomFailed=false;stairsFailed=false;
  if(still){
    roomPlayer?.stop();stairPlayer?.stop();poster.hidden=false;frame.hidden=false;frame.src=doorPoster;
    setCopy(0);setDoor(true);
  }else{
    if(manifest)frame.src=selectVariant(manifest.stairs.variants,640).frames[0].url;
    setDoor(false);queueScroll();
  }
  $('#status').textContent='';$('#stair-status').textContent='';
}
motion.addEventListener('click',()=>{still=!still;updatePreference();});
reduced.addEventListener('change',()=>{still=reduced.matches||saveData;updatePreference();});
function preparePlayers(){
  roomPlayer=new BufferedJourney(roomVideos,[manifest.videos.entry,manifest.videos.workbench],{
    onProgress:setCopy,
    onState(state){
      if(state==='frame'||state==='paused'){poster.hidden=true;$('#status').textContent='';}
      // Keep the last decoded frame visible while loading/seeking the next one.
      if(state==='error'){
        roomFailed=true;roomScroll.stop();poster.hidden=false;roomVideos.forEach(v=>v.hidden=true);
        $('#status').textContent='The room video is unavailable. The workshop details are below.';
      }
    }
  });
  stairPlayer=new BufferedJourney([stairVideo],[manifest.videos.stairs],{
    onProgress(p){if(p<.985)setDoor(false);},
    onState(state){
      if(state==='frame'||state==='paused'){
        frame.hidden=true;$('#stair-status').textContent='';
        setDoor(stairPlayer.progress>=.985&&stairVideo.currentTime>=(stairVideo.duration-1/24)*.985);
      }
      if(state==='error'){
        stairsFailed=true;stairScroll.stop();frame.hidden=false;frame.src=doorPoster;stairVideo.hidden=true;setDoor(true);
        $('#stair-status').textContent='The stair video is unavailable. You can continue here at the door.';
      }
    }
  });
  roomScroll=new ScrollSmoother(roomPlayer);stairScroll=new ScrollSmoother(stairPlayer);
}
function progress(section,scene,header){return scrollProgress(section.getBoundingClientRect().top,section.offsetHeight,scene.offsetHeight,header);}
function syncScene(section,scene,player,smoother,failed,header){
  if(failed)return;
  const rect=section.getBoundingClientRect();
  if(rect.top>=innerHeight||rect.bottom<=header){smoother.stop();player.pause();return;}
  const p=progress(section,scene,header);
  if(!player.slots.size||Math.abs(p-smoother.target)>.0001)smoother.to(p);
}
function scrollUpdate(){
  ticking=false;
  if(still||!manifest||!intent||document.hidden)return;
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  // Absolute position handles fast flicks, reversing, and entering a scene from
  // the text without accumulated deltas or a second, automatic walking clock.
  syncScene(room,stage,roomPlayer,roomScroll,roomFailed,header);
  syncScene(stairs,exitStage,stairPlayer,stairScroll,stairsFailed,header);
}
function queueScroll(){if(!ticking){ticking=true;requestAnimationFrame(scrollUpdate);}}
function startScroll(event){
  if(event.target.closest?.('input,textarea,select,button'))return;
  intent=true;queueScroll();
}
addEventListener('wheel',startScroll,{passive:true});addEventListener('touchstart',startScroll,{passive:true});
addEventListener('pointerdown',startScroll,{passive:true});
addEventListener('keydown',event=>{
  if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(event.key))startScroll(event);
});
addEventListener('scroll',()=>{intent=true;queueScroll();},{passive:true});
addEventListener('resize',queueScroll,{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){roomScroll?.stop();stairScroll?.stop();roomPlayer?.pause();stairPlayer?.pause();}
  else queueScroll();
});
$('#final-signup').addEventListener('click',event=>{event.preventDefault();$('#interest').scrollIntoView({behavior:'instant'});$('#first-name').focus({preventScroll:true});});
updatePreference();
fetch('/media/manifest.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  manifest=data;preparePlayers();updatePreference();
}).catch(()=>{still=true;updatePreference();$('#status').textContent='Motion files are unavailable. The workshop details are below.';});
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
