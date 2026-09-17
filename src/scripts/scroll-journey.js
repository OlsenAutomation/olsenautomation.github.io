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

// Wheel notches arrive in bursts. Keep their full distance, but ease the video
// toward that destination instead of jumping several frames on every event.
export class ScrollSmoother {
  constructor(player, schedule = callback => requestAnimationFrame(callback), cancel = id => cancelAnimationFrame(id)) {
    Object.assign(this, {player, schedule, cancel});
    this.frame = null; this.target = 0; this.current = 0; this.lastTime = null;
  }
  to(progress) {
    this.target = clamp(progress);
    if (this.frame !== null) return;
    this.current = this.player.progress; this.lastTime = null;
    this.player.pause();
    this.frame = this.schedule(time => this.step(time));
  }
  by(delta) { this.to((this.frame === null ? this.player.progress : this.target) + delta); }
  step(time) {
    const elapsed = this.lastTime === null ? 1000 / 60 : Math.min(64, time - this.lastTime);
    this.lastTime = time;
    this.current += (this.target - this.current) * (1 - Math.exp(-elapsed / 95));
    if (Math.abs(this.target - this.current) < .001) this.current = this.target;
    this.player.seek(this.current);
    this.frame = this.current === this.target ? null : this.schedule(next => this.step(next));
  }
  stop() {
    if (this.frame !== null) this.cancel(this.frame);
    this.frame = null; this.lastTime = null;
  }
}
