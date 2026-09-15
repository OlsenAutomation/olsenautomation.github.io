import {clamp,selectVariant} from './motion-core.js';
import {BufferedJourney} from './buffered-journey.js';
import {scrollProgress,scrollPosition} from './scroll-journey.js';
const $=s=>document.querySelector(s);
const root=$('.workshop-page'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=navigator.connection?.saveData||false;
let manifest,still=reduced.matches||saveData,roomEnabled=false,stairsEnabled=false;
let roomPlayer,stairPlayer,scrollDriven=false,lastScrollY=scrollY,ticking=false;
let stairsFailed=false,stairsSkipped=false;
const room=$('#journey'),stage=$('#stage'),poster=$('#poster'),roomSlider=$('#room-position');
const stairs=$('#stairs'),frame=$('#exit-frame'),doorPoster=frame.src,door=$('.exit-door');
const stairSlider=$('#stair-position'),motion=$('#motion-toggle'),exitStage=$('#door-stage');
const roomVideos=[$('#movie'),$('#workbench-video')],stairVideo=$('#stair-video');
const allVideos=[...root.querySelectorAll('video')];
const choose=name=>selectVariant(manifest.videos[name].variants,640);
function setCopy(p){
  const index=p<.28?0:p<.66?1:2;
  ['intro','arrival','workbench'].forEach((id,i)=>{const el=$('#'+id);el.classList.toggle('active',i===index);el.inert=i!==index;el.setAttribute('aria-hidden',String(i!==index));});
  $('#room-chapter').textContent=['1 / 3 · Entrance','2 / 3 · The room','3 / 3 · Workbench'][index];
  root.querySelectorAll('[data-room-stop]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
}
function updatePreference(){
  motion.hidden=false;motion.disabled=reduced.matches||saveData;
  motion.textContent=still?'Still views active':'Use still views';motion.setAttribute('aria-pressed',String(still));
  $('#enter-room').hidden=still||!manifest||roomEnabled;
  if(still){
    roomEnabled=false;stairsEnabled=false;roomPlayer?.stop();stairPlayer?.stop();
    root.classList.add('static-mode');root.classList.remove('motion-enabled');
    allVideos.forEach(v=>v.pause());if(returnDialog.open)returnDialog.close();poster.hidden=false;
    root.querySelector('.room-controls').hidden=true;$('#exit-navigation').hidden=true;$('#retry-stairs').hidden=true;
    stairs.classList.remove('motion-active');frame.hidden=false;frame.src=doorPoster;setDoor(true);
    setCopy(0);$('#status').textContent='Still views are active. No animation is required.';$('#stair-status').textContent='';
  }else if(manifest){
    stairsEnabled=true;stairsFailed=false;stairsSkipped=false;
    stairs.classList.add('motion-active');$('#exit-navigation').hidden=false;
    frame.src=selectVariant(manifest.stairs.variants,640).frames[0].url;frame.hidden=false;setDoor(false);
  }
}
motion.addEventListener('click',()=>{still=!still;updatePreference();});
reduced.addEventListener('change',()=>{still=reduced.matches||saveData;updatePreference();});
function controlsState(button,player,state){
  button.textContent=player.playing?'Pause':player.progress>=.99?'Replay':'Play';
  button.setAttribute('aria-label',player.playing?'Pause '+button.dataset.journey:player.progress>=.99?'Replay '+button.dataset.journey:'Play '+button.dataset.journey);
  button.setAttribute('aria-pressed',String(player.playing));
  button.closest('[data-journey-controls]').dataset.state=state;
}
function setDoor(active){
  door.classList.toggle('active',active);door.inert=!active;door.setAttribute('aria-hidden',String(!active));
  $('#stair-cue').textContent=active?'You’re at the door.':'Keep scrolling to head upstairs ↑';
}
function preparePlayers(){
  roomPlayer=new BufferedJourney(roomVideos,[manifest.videos.entry,manifest.videos.workbench],{
    onProgress(p){roomSlider.value=String(Math.round(p*100));roomSlider.setAttribute('aria-valuetext',`${Math.round(p*100)} percent through the room`);setCopy(p);},
    onState(state){
      controlsState($('#play-room'),roomPlayer,state);
      if(['playing','paused'].includes(state)&&roomVideos[roomPlayer.active].readyState>=2)poster.hidden=true;
      if(state==='loading'||state==='error'){poster.hidden=false;roomVideos.forEach(v=>v.hidden=true);}
      $('#status').textContent=state==='loading'?'Loading a small room clip… You can skip below.':state==='error'?'Video unavailable. Try Play again, or continue to the workshop.':state==='playing'?'Walking through the room. Pause to look around.':state==='paused'?(roomPlayer.progress>=.99?'You’re at the workbench. Scroll down for the workshop.':'Paused. Play, choose a stop, or scroll to move.'):$('#status').textContent;
    }
  });
  stairPlayer=new BufferedJourney([stairVideo],[manifest.videos.stairs],{
    onProgress(p){
      stairSlider.value=String(Math.round(p*100));stairSlider.setAttribute('aria-valuetext',`${Math.round(p*100)} percent upstairs`);
      setDoor(p>=.985);$('.exit-meter span').style.transform=`scaleX(${p})`;
    },
    onState(state){
      if(state==='off')return;
      if(state==='paused'&&stairVideo.readyState>=2){frame.hidden=true;$('#stair-status').textContent='';}
      if(state==='loading'){
        frame.hidden=false;stairVideo.hidden=true;
        frame.src=stairPlayer.progress>=.985?doorPoster:selectVariant(manifest.stairs.variants,640).frames[0].url;
        $('#stair-status').textContent='Loading the room-to-door video… Keep scrolling, or skip motion.';
      }
      if(state==='error'){
        stairsFailed=true;frame.hidden=false;frame.src=doorPoster;stairVideo.hidden=true;setDoor(true);
        $('#stair-status').textContent='The video is unavailable. You can continue here at the door.';$('#retry-stairs').hidden=false;
      }
    }
  });
}
function align(section){scrollDriven=false;section.scrollIntoView({behavior:'instant',block:'start'});lastScrollY=scrollY;}
function beginRoom(){
  if(still||!manifest)return;
  roomEnabled=true;root.classList.remove('static-mode');root.classList.add('motion-enabled');root.querySelector('.room-controls').hidden=false;
  $('#enter-room').hidden=true;align(room);$('#play-room').focus({preventScroll:true});roomPlayer.seek(0,true);
}
$('#enter-room').addEventListener('click',beginRoom);
$('#play-room').addEventListener('click',()=>{scrollDriven=false;roomPlayer?.toggle();});
roomSlider.addEventListener('input',()=>{scrollDriven=false;roomPlayer?.seek(Number(roomSlider.value)/100);});
root.querySelectorAll('[data-room-stop]').forEach(el=>el.addEventListener('click',()=>{scrollDriven=false;roomPlayer?.seek(Number(el.dataset.roomStop));}));
function exitProgress(){
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  return scrollProgress(stairs.getBoundingClientRect().top,stairs.offsetHeight,exitStage.offsetHeight,header);
}
function positionAtExit(progress){
  scrollDriven=false;
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  const top=scrollPosition(scrollY+stairs.getBoundingClientRect().top,stairs.offsetHeight,exitStage.offsetHeight,header,progress);
  scrollTo({top,behavior:'instant'});lastScrollY=scrollY;
}
stairSlider.addEventListener('input',()=>{
  if(still||!manifest)return;
  stairsSkipped=false;stairsFailed=false;$('#retry-stairs').hidden=true;
  const p=Number(stairSlider.value)/100;positionAtExit(p);stairPlayer.seek(p);
});
function jumpDoor(event){
  event?.preventDefault();stairsSkipped=true;stairPlayer?.stop();
  frame.hidden=false;frame.src=doorPoster;setDoor(true);$('#stair-status').textContent='';$('#retry-stairs').hidden=true;
  $('#stair-options').open=false;stairSlider.value='100';stairSlider.setAttribute('aria-valuetext','At the door');
  if(stairsEnabled)positionAtExit(1);else align(stairs);
  $('#final-signup').focus({preventScroll:true});
}
$('#skip-stairs').addEventListener('click',jumpDoor);
$('#retry-stairs').addEventListener('click',()=>{
  stairsFailed=false;stairsSkipped=false;$('#retry-stairs').hidden=true;stairPlayer.seek(exitProgress());
});
$('#final-signup').addEventListener('click',event=>{event.preventDefault();scrollDriven=false;$('#interest').scrollIntoView({behavior:'instant'});$('#first-name').focus({preventScroll:true});});
function startScroll(event){
  if(event.target.closest?.('input,textarea,select,button'))return;
  // Passive wheel events may arrive after compositor scrolling. Preserve the
  // last scroll-event position so this gesture's movement is not discarded.
  scrollDriven=true;
}
addEventListener('wheel',startScroll,{passive:true});addEventListener('touchstart',startScroll,{passive:true});
addEventListener('pointerdown',startScroll,{passive:true});
addEventListener('keydown',event=>{
  if(['PageDown','PageUp','Home','End'].includes(event.key)&&!event.target.closest?.('input,textarea,select'))scrollDriven=true;
  else if(['ArrowDown','ArrowUp',' '].includes(event.key))startScroll(event);
});
function scrollUpdate(){
  ticking=false;const delta=scrollY-lastScrollY;lastScrollY=scrollY;
  if(still||!scrollDriven||!delta)return;
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  if(roomEnabled){
    const rect=room.getBoundingClientRect();
    if(rect.top<=header+32&&rect.bottom>header+80)roomPlayer.seek(roomPlayer.progress+delta/Math.max(innerHeight,room.offsetHeight-stage.offsetHeight));
  }
  // Absolute page position prevents a large scroll through the text from
  // jumping the first staircase frame forward or drifting on reverse scroll.
  const rect=stairs.getBoundingClientRect();
  if(stairsEnabled&&!stairsFailed&&!stairsSkipped&&rect.top<innerHeight&&rect.bottom>header){
    const p=exitProgress();
    if(!stairPlayer.slots.size||Math.abs(p-stairPlayer.progress)>.001)stairPlayer.seek(p);
  }
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(scrollUpdate);}},{passive:true});
// Links and controls never have to wait for a tour to finish.
root.addEventListener('click',event=>{if(event.target.closest('a[href^="#"]')){scrollDriven=false;roomPlayer?.pause();stairPlayer?.pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){roomPlayer?.pause();stairPlayer?.pause();allVideos.forEach(v=>v.pause());}});
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
$('.exit-door-link').addEventListener('click',async event=>{if(still||!manifest)return;event.preventDefault();returnVideo.src=choose('portal').url;returnVideo.playbackRate=1.5;returnDialog.showModal();returnTimer=setTimeout(leave,14000);try{await returnVideo.play();}catch{leave();}});
returnVideo.addEventListener('ended',leave);returnVideo.addEventListener('error',()=>{if(returnDialog.open)leave();});
returnDialog.addEventListener('close',()=>{clearTimeout(returnTimer);returnVideo.pause();});$('#cancel-return').addEventListener('click',()=>returnDialog.close());
updatePreference();
fetch('/media/manifest.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{manifest=data;preparePlayers();updatePreference();if(location.hash==='#door-stage')jumpDoor();}).catch(()=>{$('#status').textContent='Motion files are unavailable. Read the class information or join the interest list below.';});
