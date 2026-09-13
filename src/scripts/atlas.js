const cards=[...document.querySelectorAll('#atlasGrid .atlas-card')];
const buttons=[...document.querySelectorAll('[data-filter]')];
const expand=document.querySelector('#atlasExpand');
let filter='all',expanded=false;
function show(){
  const matching=cards.filter(c=>filter==='all'||c.dataset.category===filter);
  const visible=expanded?matching:matching.slice(0,12);
  cards.forEach(c=>c.hidden=!visible.includes(c));
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  document.querySelector('#atlasCount').textContent=`${visible.length} of ${matching.length} projects`;
  expand.hidden=matching.length<=12;expand.textContent=expanded?'Show fewer projects':'Show all projects';expand.setAttribute('aria-expanded',String(expanded));
}
buttons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;expanded=false;show();}));
expand.addEventListener('click',()=>{expanded=!expanded;show();});
show();
