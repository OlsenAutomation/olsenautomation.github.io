import assert from 'node:assert/strict';
import {scrollProgress,scrollPosition,MOTION_FRACTION,ScrollSmoother} from '../src/scripts/scroll-journey.js';

// Actual entry, backward travel and footer landing at several viewport sizes.
for(const [height,stage,header] of [[2880,824,76],[2700,776,68],[1248,322,68]]){
  assert.equal(scrollProgress(header+300,height,stage,header),0,'content above the scene does not consume the walk');
  assert.equal(scrollProgress(header,height,stage,header),0);
  const sectionTop=8000;
  for(const p of [0,.25,.8,.35,1]){
    const y=scrollPosition(sectionTop,height,stage,header,p);
    assert.ok(Math.abs(scrollProgress(sectionTop-y,height,stage,header)-p)<1e-9,'direct/reverse scrolling and slider positions agree');
  }
  assert.equal(scrollProgress(header-(height-stage),height,stage,header),1,'door remains visible before the footer');
  assert.ok(MOTION_FRACTION<1,'reserve a final still reading interval');
}
assert.equal(scrollProgress(0,0,0,0),0);
// Reproduce bursty wheel input without discarding distance or sending the
// entire burst to the decoder at once. Run the same gestures at 60 and 120Hz.
for(const hz of [60,120]){
  let pending=null,now=0;const seen=[];
  const player={progress:0,pause(){},seek(p){this.progress=p;seen.push(p);}};
  const smooth=new ScrollSmoother(player,callback=>{pending=callback;return 1;},()=>{pending=null;});
  const step=()=>{const callback=pending;pending=null;now+=1000/hz;callback(now);};
  const settle=()=>{for(let n=0;pending&&n<200;n++)step();assert.equal(pending,null);};
  smooth.by(.1);smooth.by(.1);smooth.by(.1);step();
  assert.ok(player.progress>0&&player.progress<.1,'one frame does not jump across a wheel burst');
  settle();assert.ok(Math.abs(player.progress-.3)<1e-9,'all three wheel notches reach the destination');
  assert.ok(seen.every((p,i)=>!i||p>=seen[i-1]),'forward motion never bounces backward');
  smooth.by(.4);step();const reversingAt=player.progress;
  smooth.to(.05);step();assert.ok(player.progress<reversingAt,'reverse gesture responds on the next frame');
  settle();assert.equal(player.progress,.05);
  smooth.to(1);settle();assert.equal(player.progress,1,'final door position is reached exactly');
  smooth.to(0);smooth.stop();assert.equal(pending,null,'still views/skip/controls cancel queued movement');
  player.progress=.7;smooth.by(.1);settle();assert.ok(Math.abs(player.progress-.8)<1e-9,'resume starts at a newly selected stop');
}
console.log('PASS: continuous exit, reverse travel, slider alignment, final CTA interval, eased wheel bursts at 60/120Hz and motion cancellation.');
