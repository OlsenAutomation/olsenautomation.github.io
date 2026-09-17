"""Explicit page registry. Public preview and unlisted local review stay separate."""
import html,json,re,shutil
from project_photos import load as load_photos,card as photo_card,gallery as photo_gallery,highlights as photo_highlights
from project_stories import load as load_stories,story as project_story,videos as project_videos
from project_photos import figure as photo_figure,picture as photo_picture
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/'src';DIST=ROOT/'dist';PRIVATE=ROOT/'dist-unlisted'
def esc(s):return html.escape(str(s),quote=True)
def build_site(header,footer,render,media):
 registry=[]
 def page(route,title,description,content,styles=(),scripts=(),metadata='',private=False):
  document=render('_includes/layout.html',title=esc(title),description=esc(description),content=content,header=header,footer=footer,page_styles=''.join(f'<link rel="stylesheet" href="/assets/{s}.css">' for s in styles),page_scripts=''.join(f'<script type="module" src="/assets/{s}.js"></script>' for s in scripts))
  document=re.sub(r'<title>.*?</title>',lambda _:f'<title>{esc(title)}</title>',document)
  if re.search(r'name=[\"\']robots[\"\']',metadata):document=re.sub(r'<meta name="robots"[^>]*>\n?','',document)
  document=document.replace('</head>',metadata+'\n</head>')
  root=PRIVATE if private else DIST;dest=root/route.lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(document)
  registry.append({'route':route,'title':title,'private':private})
 if PRIVATE.is_symlink():raise ValueError('Unlisted output cannot be symlink')
 if PRIVATE.exists():shutil.rmtree(PRIVATE)
 PRIVATE.mkdir()
 (PRIVATE/'assets').mkdir()
 if (SRC/'scripts/family-access.js').exists():shutil.copyfile(SRC/'scripts/family-access.js',PRIVATE/'assets/family-access.js')
 if (ROOT/'public/unlisted-media').exists():shutil.copytree(ROOT/'public/unlisted-media',PRIVATE/'unlisted-media')
 for group,output in [('public',DIST),('unlisted',PRIVATE)]:
  allowlist=SRC/'_data'/f'{group}-assets.json'
  for relative in json.loads(allowlist.read_text()) if allowlist.exists() else []:
   source=ROOT/relative
   if source.is_symlink() or not source.resolve().is_relative_to(ROOT):raise ValueError('Invalid preserved asset')
   destination=output/relative;destination.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,destination)
 projects=json.loads((SRC/'_data/projects.json').read_text())
 status_labels={s['label'].lower():s['label'] for s in json.loads((SRC/'_data/statuses.json').read_text())}
 def status(item):return status_labels.get(item['status'].lower(),item['status'].capitalize())
 photos=load_photos();stories=load_stories()
 assert set(stories)=={p["slug"] for p in projects}, "Every project needs a reviewed story"
 cards=''.join(render('_includes/project-card.html',category=esc(p['category']),route=esc(p['route']),title=esc(p['title']),summary=esc(p['summary']),status=esc(status(p)),evidence_label='Owner-reported' if p['evidence'].startswith('Owner-reported') else 'Evidence and limits in project record',photo=photo_card(photos[p['slug']]['items'][0],media) if p['slug'] in photos else '') for p in projects)
 home=(SRC/'pages/home.html').read_text().replace('<!-- PROJECT_ATLAS -->',cards).replace('<!-- PROJECT_PHOTO_HIGHLIGHTS -->',photo_highlights(photos,projects,media))
 for p in projects:home=home.replace('{{status:'+p['slug']+'}}',esc(status(p)))
 page('/index.html','Olsen Automation LLC','Olsen Automation LLC builds practical AI systems, automation workflows, context tools, and AI-assisted production systems for creators and businesses.',home,('home','project-photos'),('home','atlas'))
 # The standalone atlas uses the same authored card source, not a separately copied list.
 atlas=re.search(r'<section[^>]*id="atlas".*?</section>',home,re.S).group()
 atlas=atlas.replace('<h2>The project atlas.</h2>','<h1>The project atlas.</h1>')
 page('/projects.html','Project atlas | Olsen Automation','Public project summaries with explicit status, evidence and limits.','<div class="homepage atlas-page">'+atlas+'</div>',('home','project-photos'),('atlas',))
 for item in projects:
  if not item['route'].startswith('/projects/'):continue
  extra=(SRC/'pages/project-details'/f'{item["slug"]}.html')
  detail=extra.read_text() if extra.exists() else ''
  photos_markup=photo_gallery(photos[item['slug']],media,False) if item['slug'] in photos and len(photos[item['slug']]['items'])>1 else ''
  hero=photo_figure(photos[item['slug']]['items'][0],media,True) if item['slug'] in photos else ''
  narrative=project_story(item['slug'],stories[item['slug']])
  clips=project_videos(item['slug'],media)
  images=''
  if item['title']=='Mechanical Whale':
   images='<div class="project-evidence-grid">'+''.join(f'<figure><img src="{media["images"][name]["webp"][-1]["url"]}" alt="{alt}" width="960" height="1280" loading="lazy"><figcaption>{alt}</figcaption></figure>' for name,alt in [('whale-kit-blue','Supplied blue whale kit photograph'),('whale-kit-white','Supplied white whale kit photograph'),('whale-assembled','Supplied assembled whale photograph')])+'</div>'
  external='<a class="btn" href="https://brianvincentphotography.com">Open Brian Vincent Photography</a>' if item['title']=='Photography & Visual Production' else ''
  notes=('<details class="project-notes"><summary>Additional project notes and earlier references</summary>'+detail+images+'</details>') if detail or images else ''
  body=f'<article class="project-record wrap"><a class="back-link" href="/projects.html">All projects</a><p class="status-label">{esc(status(item))}</p><h1>{esc(item["title"])}</h1><p class="project-lead">{esc(item["summary"])}</p>{hero}{clips}{narrative}{photos_markup}{notes}{external}<div class="actions"><a class="btn primary" href="/contact.html">Ask about this project</a><a class="btn" href="/projects.html">Back to the atlas</a></div></article>'
  page(item['route'],item['title']+' | Olsen Automation',item['summary'],body,('pages','project-photos','project-stories'),('project-videos',) if clips else ())
 for item in json.loads((SRC/'_data/pages.json').read_text()) if (SRC/'_data/pages.json').exists() else []:
  content=(SRC/item['source']).read_text()
  if '<!-- WHALE_LATEST_PROOF -->' in content:
   latest=next(photo for photo in photos['mechanical-whale']['items'] if photo['asset']=='whale-v05-original')
   content=content.replace('<!-- WHALE_LATEST_PROOF -->','<figure class="proof-card current-build">'+photo_picture(latest,media,compact=True)+'<figcaption class="proof-caption"><strong>3. The v0.5 display build</strong><span>September 16 original photo. Printed, assembled and still being refined.</span></figcaption></figure>')
  for entry in json.loads((SRC/'_data/statuses.json').read_text()):content=content.replace('{{status:'+entry['id']+'}}',esc(entry['label']))
  matching=next((p for p in projects if p['route']==item['route']),None)
  extra_styles=[]
  if matching and not item.get('private',False):
   story_markup=project_story(matching['slug'],stories[matching['slug']])
   if '<!-- WORKSHOP_PROJECT_STORY -->' in content:
    content=content.replace('<!-- WORKSHOP_PROJECT_STORY -->','<details class="workshop-background section-inner"><summary>Workshop background</summary>'+story_markup+'</details>')
   else:
    content+='<div class="project-record wrap project-record-update">'+story_markup+'</div>'
   extra_styles=['project-stories']
  page(item['route'],item['title'],item['description'],content,list(item.get('styles',('pages',)))+['preserved-layout']+extra_styles,item.get('scripts',()),item.get('metadata',''),item.get('private',False))
 (DIST/'route-registry.json').write_text(json.dumps([r for r in registry if not r['private']],indent=2)+'\n')
 (PRIVATE/'route-registry.json').write_text(json.dumps([r for r in registry if r['private']],indent=2)+'\n')
 return registry
