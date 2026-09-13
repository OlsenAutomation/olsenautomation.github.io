// Progressive enhancement: the navigation remains usable without JavaScript.
document.documentElement.classList.add('js');
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#global-nav');
const compact = matchMedia('(max-width: 1040px)');
function closeMenu(restoreFocus = false) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');
  if (restoreFocus) toggle.focus();
}
toggle.hidden = false;
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
compact.addEventListener('change', () => closeMenu());
