"""Explicit page registry. Public preview and unlisted local review stay separate."""
import html,json,re,shutil
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
 cards=''.join(render('_includes/project-card.html',category=esc(p['category']),route=esc(p['route']),title=esc(p['title']),summary=esc(p['summary']),status=esc(status(p)),evidence_label='Owner-reported' if p['evidence'].startswith('Owner-reported') else 'Evidence and limits in project record') for p in projects)
 home=(SRC/'pages/home.html').read_text().replace('<!-- PROJECT_ATLAS -->',cards)
 for p in projects:home=home.replace('{{status:'+p['slug']+'}}',esc(status(p)))
 page('/index.html','Olsen Automation LLC','Olsen Automation LLC builds practical AI systems, automation workflows, context tools, and AI-assisted production systems for creators and businesses.',home,('home',),('home','atlas'))
 # The standalone atlas uses the same authored card source, not a separately copied list.
 atlas=re.search(r'<section[^>]*id="atlas".*?</section>',home,re.S).group()
 atlas=atlas.replace('<h2>The project atlas.</h2>','<h1>The project atlas.</h1>')
 page('/projects.html','Project atlas | Olsen Automation','Public project summaries with explicit status, evidence and limits.','<div class="homepage atlas-page">'+atlas+'</div>',('home',),('atlas',))
 for item in projects:
  if not item['route'].startswith('/projects/'):continue
  extra=(SRC/'pages/project-details'/f'{item["slug"]}.html')
  detail=extra.read_text() if extra.exists() else ''
  images=''
  if item['title']=='Mechanical Whale':
   images='<div class="project-evidence-grid">'+''.join(f'<figure><img src="{media["images"][name]["webp"][-1]["url"]}" alt="{alt}" width="960" height="1280" loading="lazy"><figcaption>{alt}</figcaption></figure>' for name,alt in [('whale-kit-blue','Supplied blue whale kit photograph'),('whale-kit-white','Supplied white whale kit photograph'),('whale-assembled','Supplied assembled whale photograph')])+'</div>'
  external='<a class="btn" href="https://brianvincentphotography.com">Open Brian Vincent Photography</a>' if item['title']=='Photography & Visual Production' else ''
  body=f'<article class="project-record wrap"><a class="back-link" href="/projects.html">All projects</a><p class="status-label">{esc(status(item))}</p><h1>{esc(item["title"])}</h1><p class="project-lead">{esc(item["summary"])}</p><section class="evidence-note"><h2>Evidence and current scope.</h2><p>{esc(item["evidence"])}</p><p>This summary is based on Brian’s approved project description. It does not establish public availability, independent validation, customer outcomes, or a release date.</p></section>{detail}{images}{external}<div class="actions"><a class="btn primary" href="/contact.html">Ask about this project</a><a class="btn" href="/projects.html">Back to the atlas</a></div></article>'
  page(item['route'],item['title']+' | Olsen Automation',item['summary'],body,('pages',))
 for item in json.loads((SRC/'_data/pages.json').read_text()) if (SRC/'_data/pages.json').exists() else []:
  content=(SRC/item['source']).read_text()
  for entry in json.loads((SRC/'_data/statuses.json').read_text()):content=content.replace('{{status:'+entry['id']+'}}',esc(entry['label']))
  page(item['route'],item['title'],item['description'],content,list(item.get('styles',('pages',)))+['preserved-layout'],item.get('scripts',()),item.get('metadata',''),item.get('private',False))
 (DIST/'route-registry.json').write_text(json.dumps([r for r in registry if not r['private']],indent=2)+'\n')
 (PRIVATE/'route-registry.json').write_text(json.dumps([r for r in registry if r['private']],indent=2)+'\n')
 return registry
