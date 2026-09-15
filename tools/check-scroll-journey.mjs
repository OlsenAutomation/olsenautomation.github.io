import assert from 'node:assert/strict';
import {scrollProgress,scrollPosition,MOTION_FRACTION} from '../src/scripts/scroll-journey.js';

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
console.log('PASS: continuous exit entry, large text scroll, reverse travel, slider alignment and final CTA reading interval.');
