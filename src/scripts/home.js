const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const home = document.querySelector('.homepage');
const sections = [...home.querySelectorAll('[data-tour-section]')];
const titles = ['The stance','Selected work','The build loop','The project atlas','Learn AI','About Brian'];
const descriptions = ['The principle that connects the work.','Four flagship projects, with evidence and limits.','From a real problem to a tested result.','Explore the work by category.','Practical AI for beginners.','The person responsible for the decisions.'];
const dock = document.querySelector('#tourDock');
const start = document.querySelector('#startTourHero');
let stop = 0;
function go(index, focus = true) {
  stop = Math.max(0, Math.min(sections.length-1, index));
  document.querySelector('#tourIndex').textContent = `${String(stop+1).padStart(2,'0')} / 06`;
  document.querySelector('#tourTitle').textContent = titles[stop];
  document.querySelector('#tourDescription').textContent = descriptions[stop];
  document.querySelector('#tourPrev').disabled = stop === 0;
  document.querySelector('#tourNext').textContent = stop === sections.length-1 ? 'Finish' : 'Next';
  sections[stop].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  if(focus){const heading=sections[stop].querySelector('h1,h2,h3');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
  home.querySelectorAll('[data-tour-jump]').forEach((el,i)=>el.setAttribute('aria-current',String(i===stop)));
  home.querySelectorAll('[data-tour-jump]').forEach((el,i)=>el.classList.toggle('active',i===stop));
}
function exit(){dock.hidden=true;dock.classList.remove('active');start.focus({preventScroll:true});}
start.hidden=false;
start.addEventListener('click',()=>{dock.hidden=false;dock.classList.add('active');go(0);});
home.querySelectorAll('[data-tour-jump]').forEach(el=>{el.hidden=false;el.addEventListener('click',()=>go(Number(el.dataset.tourJump)));});
document.querySelector('#tourPrev').addEventListener('click',()=>go(stop-1));
document.querySelector('#tourNext').addEventListener('click',()=>stop===sections.length-1?exit():go(stop+1));
document.querySelector('#tourExit').addEventListener('click',exit);
addEventListener('keydown',event=>{if(event.key==='Escape'&&!dock.hidden)exit();});
// Restrained normal-page parallax; cinematic media belongs to the workshop only.
let ticking=false;
function update(){ticking=false;home.style.setProperty('--hero-progress',reduced.matches?'0':String(Math.min(1,Math.max(0,scrollY/innerHeight))));}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
reduced.addEventListener('change',update);
home.querySelector('[data-tour-jump]')?.classList.add('active');
home.querySelector('[data-tour-jump]')?.setAttribute('aria-current','true');
update();
