// Native controls after explicit intent; no autoplay, scroll seeking or background loading.
for (const card of document.querySelectorAll('[data-project-clip]')) {
  const video = card.querySelector('video');
  const button = card.querySelector('[data-clip-play]');
  const status = card.querySelector('[role="status"]');
  const label = button.textContent;
  button.hidden = false;
  video.tabIndex = -1;
  let requested = false;
  let generation = 0;
  function recover() {
    if (!requested) return;
    requested = false;
    generation += 1;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.controls = false;
    video.tabIndex = -1;
    button.hidden = false;
    button.textContent = 'Retry video';
    status.textContent = 'The clip could not play. Retry, or use Open MP4.';
    button.focus({preventScroll: true});
  }
  button.addEventListener('click', () => {
    const attempt = ++generation;
    requested = true;
    button.hidden = true;
    button.textContent = label;
    status.textContent = 'Loading video…';
    video.src = matchMedia('(max-width: 760px)').matches ? video.dataset.small : video.dataset.large;
    video.controls = true;
    video.tabIndex = 0;
    video.focus({preventScroll: true});
    video.play().catch(() => {
      if (!requested || attempt !== generation) return;
      if (video.error) recover();
      else status.textContent = 'Video ready. Use the video’s Play control to begin.';
    });
  });
  video.addEventListener('playing', () => {
    status.textContent = '';
    // Keep the visitor in control when switching between the two recordings.
    for (const other of document.querySelectorAll('[data-project-clip] video')) {
      if (other !== video) other.pause();
    }
  });
  video.addEventListener('error', recover);
  video.addEventListener('stalled', () => {
    if (requested && !video.paused) status.textContent = 'Waiting for the video connection…';
  });
}
