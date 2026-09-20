import assert from 'node:assert/strict';
import {BufferedJourney} from '../src/scripts/buffered-journey.js';

class Video extends EventTarget {
  readyState = 0; duration = 10; paused = true; hidden = true; seeking = false; time = 0;
  get currentTime() { return this.time; }
  set currentTime(value) {
    assert.ok(value >= 0 && value < this.duration, 'seek remains inside the video');
    this.time = value; this.seeking = true;
    queueMicrotask(() => { this.seeking = false; this.dispatchEvent(new Event('seeked')); });
  }
  pause() { this.paused = true; }
  async play() { this.paused = false; }
  load() { this.readyState = this.src ? 4 : 0; if (this.src) queueMicrotask(() => this.dispatchEvent(new Event('loadeddata'))); }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
}
const flush = async () => { for (let i = 0; i < 20; i++) await new Promise(resolve => setImmediate(resolve)); };
const originalFetch = globalThis.fetch;
let requests = [], fail = false, state;
globalThis.fetch = async (url, {signal}) => {
  requests.push(url);
  if (signal.aborted || fail) throw Error('Synthetic interrupted download');
  return new Response(new Uint8Array([1, 2, 3]), {headers: {'Content-Type': 'video/mp4'}});
};
const records = [0, 1].map(i => ({duration: 10, variants: [{width: 640, url: `/clip-${i}.mp4`, bytes: 3}]}));
const videos = [new Video(), new Video()];
const player = new BufferedJourney(videos, records, {onProgress() {}, onState(value) { state = value; }});
try {
  assert.equal(requests.length, 0, 'no video before visitor intent');
  player.seek(0, true); await flush();
  assert.equal(videos[0].paused, false);
  assert.equal(requests.length, 2, 'next clip loads during the active tour');
  for (const p of [.2, .9, .4, 1]) player.seek(p);
  await flush();
  assert.equal(player.progress, 1);
  assert.equal(videos[1].hidden, false);
  assert.equal(videos[0].hidden, true);
  assert.ok(videos[1].currentTime > 9.9);
  assert.equal(requests.length, 2, 'rapid scrubbing never downloads a clip again');
  player.toggle(); await flush();
  assert.equal(videos[0].paused, false, 'Replay restarts the entrance');
  videos[0].dispatchEvent(new Event('ended')); await flush();
  assert.equal(videos[1].paused, false, 'play crosses the clip boundary');
  player.pause(); assert.ok(videos.every(video => video.paused));
  player.stop(); assert.equal(player.slots.size, 0, 'still mode releases clip buffers');
  assert.ok(videos.every(video => video.hidden && !video.src));
  fail = true; player.seek(.8, true); await flush();
  assert.equal(state, 'error'); assert.equal(player.playing, false);
  fail = false; player.toggle(); await flush();
  assert.equal(videos[1].paused, false, 'failed media can be retried');
  player.seek(0); await flush();
  assert.ok(videos.every(video => video.paused), 'scroll-only entry never starts a playback clock');
  // Simulate a slow decoder during a fast forward/reverse finger gesture.
  // Only one seek may be outstanding; completed frames stay visible while
  // the newest destination supersedes intermediate requests.
  const slow = videos[1]; let writes = 0;
  Object.defineProperty(slow, 'currentTime', {
    configurable: true,
    get() { return this.time; },
    set(value) { assert.equal(this.seeking, false); this.time=value; this.seeking=true; writes++; }
  });
  player.seek(.6); await flush();
  player.seek(.85); await flush();
  assert.equal(writes, 1, 'a busy decoder receives no queued intermediate seeks');
  slow.seeking=false; slow.dispatchEvent(new Event('seeked'));
  assert.equal(slow.hidden, false, 'show the completed frame even while the target is still moving');
  assert.equal(videos[0].hidden, true);
  assert.equal(writes, 2, 'only the latest destination is decoded next');
  player.seek(.7); await flush();
  assert.equal(writes, 2);
  slow.seeking=false; slow.dispatchEvent(new Event('seeked'));
  slow.seeking=false; slow.dispatchEvent(new Event('seeked'));
  assert.equal(slow.currentTime, 4, 'reverse scroll converges to the exact newest position');
  assert.equal(state, 'paused');
  assert.ok(videos.every(video => video.paused), 'settled scroll frames remain paused');
  player.seek(.1, true); player.stop(); await flush();
  assert.ok(videos.every(video => video.paused && !video.src), 'late work cannot restart motion after still mode');
  console.log('PASS: intent gate, once-per-clip buffering, rapid/reverse seek, replay, clip transition, pause, buffer cleanup, retry and cancellation.');
} finally { player.stop(); globalThis.fetch = originalFetch; }
