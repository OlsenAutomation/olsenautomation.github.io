import {clamp, mediaTime, selectVariant} from './motion-core.js';

// Fetch each small clip once, after intent. Scrubbing the local Blob avoids a
// network round trip for every seek, especially on mobile Safari.
export class BufferedJourney {
  constructor(videos, records, {onProgress, onState}) {
    Object.assign(this, {videos, records, onProgress, onState});
    this.total = records.reduce((sum, record) => sum + record.duration, 0);
    this.progress = 0; this.playing = false; this.revision = 0;
    this.slots = new Map(); this.active = 0; this.target = null;
    videos.forEach((video, index) => {
      video.playbackRate = 1.25;
      video.addEventListener('seeked', () => this.settle(index, true));
      video.addEventListener('timeupdate', () => {
        if (index !== this.active || !this.playing || this.target !== null || video.seeking) return;
        this.progress = clamp((this.offset(index) + video.currentTime) / this.total);
        this.onProgress(this.progress);
      });
      video.addEventListener('ended', () => {
        if (index !== this.active || !this.playing) return;
        if (index + 1 < videos.length) this.seek((this.offset(index + 1) + .01) / this.total, true);
        else { this.playing = false; this.progress = 1; this.onProgress(1); this.onState('paused'); }
      });
    });
  }
  offset(index) { return this.records.slice(0, index).reduce((sum, record) => sum + record.duration, 0); }
  load(index) {
    if (this.slots.has(index)) return this.slots.get(index).promise;
    const slot = {controller: new AbortController(), url: null};
    const video = this.videos[index], asset = selectVariant(this.records[index].variants, 640);
    this.slots.set(index, slot);
    slot.promise = (async () => {
      const timer = setTimeout(() => slot.controller.abort(), 15000);
      try {
        const response = await fetch(asset.url, {signal: slot.controller.signal});
        if (!response.ok) throw Error('Video download failed');
        const blob = await response.blob();
        if (blob.size !== asset.bytes || slot.controller.signal.aborted) throw Error('Incomplete video');
        slot.url = URL.createObjectURL(new Blob([blob], {type: 'video/mp4'}));
        await new Promise((resolve, reject) => {
          const cleanup = () => { video.removeEventListener('loadeddata', ready); video.removeEventListener('error', fail); slot.controller.signal.removeEventListener('abort', fail); };
          const ready = () => { cleanup(); resolve(); };
          const fail = () => { cleanup(); reject(Error('Video unavailable')); };
          video.addEventListener('loadeddata', ready, {once: true});
          video.addEventListener('error', fail, {once: true});
          slot.controller.signal.addEventListener('abort', fail, {once: true});
          video.src = slot.url; video.load();
        });
      } catch (error) {
        if (slot.url) URL.revokeObjectURL(slot.url);
        if (this.slots.get(index) === slot) this.slots.delete(index);
        throw error;
      } finally { clearTimeout(timer); }
    })();
    return slot.promise;
  }
  seek(progress, play = false) {
    this.progress = clamp(progress); this.playing = play;
    const revision = ++this.revision, time = this.progress * this.total;
    this.videos.forEach(video => video.pause());
    this.active = this.records.findIndex((_, index) => time < this.offset(index + 1));
    if (this.active < 0) this.active = this.videos.length - 1;
    const index = this.active, video = this.videos[index];
    this.target = Math.max(0, time - this.offset(index));
    this.onProgress(this.progress);
    this.onState(video.readyState >= 2 ? 'seeking' : 'loading');
    this.load(index).then(() => {
      if (revision !== this.revision) return;
      this.target = Math.min(this.target, mediaTime(1, video.duration));
      this.settle(index);
      // Intent is established. Fetch the next short clip while this one plays,
      // so the entrance-to-workbench transition need not wait for the network.
      if (index + 1 < this.videos.length) this.load(index + 1).catch(() => {});
    }).catch(() => {
      if (revision !== this.revision) return;
      this.playing = false; this.target = null; this.onState('error');
    });
  }
  show(index) {
    this.videos.forEach((item, i) => { item.hidden = i !== index; });
    this.onState('frame');
  }
  settle(index, decoded = false) {
    const video = this.videos[index];
    if (index !== this.active || video.readyState < 2 || video.seeking || this.target === null) return;
    if (Math.abs(video.currentTime - this.target) > .04) {
      // A fast swipe can move the destination before decoding finishes. Show
      // each completed frame, then seek only to the newest destination. Never
      // hide the scene until a moving target has been caught exactly.
      if (decoded) this.show(index);
      video.currentTime = this.target;
      return;
    }
    this.target = null;
    this.show(index);
    this.onState(this.playing ? 'playing' : 'paused');
    if (this.playing) {
      const revision = this.revision;
      video.play().catch(() => {
        if (revision !== this.revision) return;
        this.playing = false; this.onState('paused');
      });
    }
  }
  toggle() {
    if (this.playing) { this.pause(); return; }
    this.seek(this.progress >= .99 ? 0 : this.progress, true);
  }
  pause() {
    if (!this.playing) return;
    this.playing = false;
    this.videos.forEach(video => video.pause());
    this.onState(this.target === null ? 'paused' : 'loading');
  }
  stop() {
    this.revision++; this.playing = false; this.target = null; this.progress = 0;
    this.videos.forEach(video => { video.pause(); video.hidden = true; video.removeAttribute('src'); video.load(); });
    for (const slot of this.slots.values()) { slot.controller.abort(); if (slot.url) URL.revokeObjectURL(slot.url); }
    this.slots.clear(); this.onState('off');
  }
}
