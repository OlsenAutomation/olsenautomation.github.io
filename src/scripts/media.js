import { clamp, frameIndex, mediaTime, selectVariant } from './motion-core.js';
const $ = selector => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const savingData = navigator.connection?.saveData || false;
let still = reduced.matches || savingData;
let manifest;
let portalTimer;
const videos = [...document.querySelectorAll('video')];
const motionToggle = $('#motion-toggle');
const stairs = $('#stairs');
const stairSlider = $('#stair-position');
const frame = $('#exit-frame');
const doorPoster = frame.getAttribute('src');
let sequence;
let desiredIndex = 0;
let sequenceEnabled = false;
let manualSequence = false;
let scrollFrame = 0;
let requestEpoch = 0;
const cache = new Map();
function chosenVideo(name) {
  return selectVariant(manifest.videos[name].variants, innerWidth <= 760 ? 640 : 1280);
}
function stopVideo(video) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}
function status(text) { $('#motion-note').textContent = text; }
function applyMotionPreference() {
  motionToggle.hidden = false;
  motionToggle.disabled = reduced.matches || savingData;
  motionToggle.setAttribute('aria-pressed', String(still));
  motionToggle.textContent = reduced.matches ? 'Reduced motion: still views' : savingData ? 'Data saving: still views' : still ? 'Enable motion controls' : 'Use still views';
  $('#enter-portal').hidden = still || !manifest;
  document.querySelectorAll('[data-load-scene]').forEach(el => {el.hidden = still || !manifest;});
  $('#load-stairs').hidden = still || !manifest;
  if (still) {
    clearTimeout(portalTimer);
    videos.forEach(stopVideo);
    sequenceEnabled = false; requestEpoch++;
    cache.clear(); stairs.classList.remove('motion-active');
    $('.exit-door').classList.add('active');$('.exit-door').inert=false;
    $('#stair-control').hidden = true; frame.src = doorPoster;
    document.querySelectorAll('[data-seek-label]').forEach(el => {el.hidden=true;});
    document.querySelectorAll('[data-scene-status]').forEach(el => {el.textContent='Still view. Motion is off.';});
    $('#stair-status').textContent='Still door view. Motion is off.';
    document.dispatchEvent(new Event('media-still'));
    status('Still views are active. Portal and sequence files are not requested.');
  } else status('Motion is optional. Each scene loads only after its control is selected.');
}
motionToggle.addEventListener('click', () => {still=!still;applyMotionPreference();});
reduced.addEventListener('change', () => {still=reduced.matches||savingData;applyMotionPreference();});
function jumpToInterest(event) {
  event?.preventDefault();
  $('#interest').scrollIntoView({behavior:'instant',block:'start'});
  $('#first-name').focus({preventScroll:true});
}
$('#final-signup').addEventListener('click',jumpToInterest);
const enter = $('#enter-portal');
const portal = $('#portal-video');
function finishPortal(text='The room is ready.') {
  clearTimeout(portalTimer);portal.pause();enter.disabled=false;
  $('#portal-status').textContent=text;
  $('#basement').scrollIntoView({behavior:'instant',block:'start'});
}
enter.addEventListener('click',async () => {
  if(still||!manifest)return;
  enter.disabled=true;$('#portal-status').textContent='Opening the portal. You can skip at any time.';
  portal.src=chosenVideo('portal').url;
  portalTimer=setTimeout(()=>finishPortal('The transition timed out. Continue with the still views.'),14000);
  try{await portal.play();}catch{finishPortal('The video could not play. Continue with the still views.');}
});
portal.addEventListener('ended',()=>finishPortal());
portal.addEventListener('error',()=>{if(portal.getAttribute('src'))finishPortal('The video is unavailable. Continue with the still views.');});
$('#skip-portal').addEventListener('click',()=>{clearTimeout(portalTimer);portal.pause();enter.disabled=false;$('#portal-status').textContent='Transition skipped. The room is ready.';});
for (const scene of document.querySelectorAll('[data-scene]')) {
  const video=scene.querySelector('video'),load=scene.querySelector('[data-load-scene]'),seek=scene.querySelector('[data-seek]'),label=scene.querySelector('[data-seek-label]'),note=scene.querySelector('[data-scene-status]');
  let wanted=0;let loadTimer;
  document.addEventListener('media-still',()=>{clearTimeout(loadTimer);load.disabled=false;wanted=0;seek.value='0';});
  load.addEventListener('click',()=>{
    if(still||!manifest)return;
    load.disabled=true;note.textContent='Loading scene…';clearTimeout(loadTimer);loadTimer=setTimeout(()=>{load.disabled=false;note.textContent='Loading is taking longer than expected. The still image remains; you can retry.';},12000);video.src=chosenVideo(scene.dataset.scene).url;video.load();
  });
  video.addEventListener('loadeddata',()=>{clearTimeout(loadTimer);load.disabled=false;load.textContent='Reload scene';label.hidden=false;note.textContent='Ready. Drag the position control or use its arrow keys.';});
  video.addEventListener('error',()=>{if(!video.getAttribute('src'))return;clearTimeout(loadTimer);load.disabled=false;label.hidden=true;note.textContent='Scene unavailable. The still image remains; you can retry.';});
  const seekNow=()=>{if(!still && Number.isFinite(video.duration) && !video.seeking)video.currentTime=mediaTime(wanted,video.duration);};
  seek.addEventListener('input',()=>{wanted=Number(seek.value)/100;seekNow();});
  video.addEventListener('seeked',()=>{const target=mediaTime(wanted,video.duration);if(Math.abs(video.currentTime-target)>.06)seekNow();});
}
async function showFrame(index) {
  if (!sequenceEnabled || still) return;
  desiredIndex=index;
  const epoch=requestEpoch;
  const item=sequence.frames[index];
  if(!cache.has(index)) {
    const img=new Image();img.decoding='async';img.src=item.url;
    cache.set(index,{img,ready:img.decode().then(()=>true).catch(()=>false)});
  }
  const slot=cache.get(index);
  const okay=await slot.ready;
  if(epoch!==requestEpoch||!sequenceEnabled||still||index!==desiredIndex)return;
  if(okay){frame.src=slot.img.src;frame.dataset.frameIndex=String(index);}
  else $('#stair-status').textContent='A frame is unavailable. The last loaded still remains visible.';
  // Bound decoded memory. Load only the next frame; never preload the whole sequence.
  for(const [i] of cache)if(Math.abs(i-index)>2)cache.delete(i);
  const next=index+1;
  if(next<sequence.count&&!cache.has(next)) {
    const img=new Image();img.decoding='async';img.src=sequence.frames[next].url;
    cache.set(next,{img,ready:img.decode().then(()=>true).catch(()=>false)});
  }
}
function setStairProgress(progress) {
  const p=clamp(progress);stairSlider.value=String(Math.round(p*100));
  $('.exit-door').classList.toggle('active',p>=.9);$('.exit-door').inert=p<.9;
  $('.exit-meter span').style.transform=`scaleX(${p})`;
  showFrame(frameIndex(p,sequence.count));
}
$('#load-stairs').addEventListener('click',()=>{
  if(still||!manifest)return;
  sequence=selectVariant(manifest.stairs.variants,innerWidth<=760?480:960);
  sequenceEnabled=true;manualSequence=false;requestEpoch++;stairs.classList.add('motion-active');$('#stair-control').hidden=false;
  $('#stair-status').textContent=`Ready. ${sequence.count} frames available; only nearby frames load.`;
  setStairProgress(0);
});
stairSlider.addEventListener('input',()=>{manualSequence=true;if(sequenceEnabled)setStairProgress(Number(stairSlider.value)/100);});
addEventListener('wheel',()=>{manualSequence=false;},{passive:true});
addEventListener('touchmove',()=>{if(document.activeElement!==stairSlider)manualSequence=false;},{passive:true});
addEventListener('keydown',event=>{if(event.target!==stairSlider&&['PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(event.key))manualSequence=false;});
addEventListener('scroll',()=>{
  if(!sequenceEnabled||still||manualSequence||scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;const rect=stairs.getBoundingClientRect();
    if(manualSequence || rect.top>0 || rect.bottom<0)return;
    setStairProgress(-rect.top/Math.max(1,stairs.offsetHeight-$('#door-stage').offsetHeight));
  });
},{passive:true});
$('#jump-door').addEventListener('click',event=>{
  event.preventDefault();
  sequenceEnabled=false;requestEpoch++;stairs.classList.remove('motion-active');
  frame.src=doorPoster;$('.exit-door').classList.add('active');$('.exit-door').inert=false;$('#stair-control').hidden=true;$('#stair-status').textContent='Still door view. No reverse playback.';
  $('#door-stage').scrollIntoView({behavior:'instant',block:'start'});
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(video=>video.pause());});
// Isolated form specimen: local text preview/download only, no network or storage.
const form=$('#interest-form'),dialog=$('#email-dialog');let draft='';
$('#prepare-message').hidden=false;
form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);
  draft=`Hi Brian,\n\nI’m interested in the first AI Without the Hype workshop.\n\nName: ${data.get('name').trim()}\nEmail: ${data.get('email').trim()}\n\nWhat I would like AI to help me do:\n${data.get('goal').trim()}\n\nI understand this is an interest list, not a confirmed reservation.\n`;
  $('#message-preview').textContent=draft;$('#form-status').textContent='Your draft is ready to review. Nothing has been sent.';dialog.showModal();
});
$('#close-dialog').addEventListener('click',()=>dialog.close());
$('#download-draft').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='workshop-interest-preview.txt';document.body.append(a);a.click();a.remove();$('#form-status').textContent='Draft download requested. Nothing has been sent.';setTimeout(()=>URL.revokeObjectURL(url),1000);
});
applyMotionPreference();
fetch('/media/manifest.json').then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{manifest=data;applyMotionPreference();}).catch(()=>status('Media controls are unavailable. Still views, navigation and the form preview remain usable.'));

// The secondary V6 door action retains a portal return, with a direct skip.
const returnDialog=$('#return-portal'),returnVideo=returnDialog.querySelector('video');
let returnTimer;
const leave=()=>{clearTimeout(returnTimer);location.href='/preview/shell/';};
$('.exit-door-link').addEventListener('click',async event=>{
  if(still||!manifest)return;
  event.preventDefault();returnVideo.src=chosenVideo('portal').url;returnDialog.showModal();
  returnTimer=setTimeout(leave,14000);
  try{await returnVideo.play();}catch{leave();}
});
returnVideo.addEventListener('ended',leave);
returnDialog.addEventListener('close',()=>{clearTimeout(returnTimer);returnVideo.pause();});
$('#cancel-return').addEventListener('click',()=>returnDialog.close());
