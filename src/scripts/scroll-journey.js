import {clamp} from './motion-core.js';

// The last part of the section holds the door while its call to action is read.
export const MOTION_FRACTION = .86;
export function scrollProgress(sectionTop, sectionHeight, stageHeight, headerHeight) {
  const travel = Math.max(1, sectionHeight - stageHeight);
  return clamp((headerHeight - sectionTop) / (travel * MOTION_FRACTION));
}
export function scrollPosition(sectionTop, sectionHeight, stageHeight, headerHeight, progress) {
  return sectionTop - headerHeight + clamp(progress) * Math.max(1, sectionHeight - stageHeight) * MOTION_FRACTION;
}
