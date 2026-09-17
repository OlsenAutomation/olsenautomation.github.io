#!/usr/bin/env python3
"""Allowlisted preview builder. Shared-source migration with preserved assets and isolated unlisted output."""
import hashlib,html,json,shutil
from pathlib import Path
from string import Template
from site_pages import build_site
from site_metadata import add_public_metadata
from unlisted_publication import publish as publish_unlisted
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/'src';DIST=ROOT/'dist'
def read(p):return (SRC/p).read_text()
def render(path,**data):return Template(read(path)).substitute(data)
def escape(s):return html.escape(str(s),quote=True)
def links(items):return '\n'.join(f'<a class="{escape(i.get("class",""))}" href="{escape(i["href"])}">{escape(i["label"])}</a>' for i in items)
def picture(record,alt,sizes='(max-width: 760px) 100vw, 45vw',eager=False):
 items=record['webp'];fallback=record['fallback'];srcset=', '.join(f'{escape(x["url"])} {x["width"]}w' for x in items)
 return f'<picture><source type="image/webp" srcset="{srcset}" sizes="{escape(sizes)}"><img src="{escape(fallback["url"])}" width="{fallback["width"]}" height="{fallback["height"]}" alt="{escape(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"></picture>'
def build():
 media=json.loads((ROOT/'public/media/manifest.json').read_text());site=json.loads(read('_data/site.json'));statuses=json.loads(read('_data/statuses.json'))
 project_media=json.loads((ROOT/'public/media/project-manifest.json').read_text())
 assert not media['images'].keys() & project_media['images'].keys(), 'Duplicate media identity'
 media['images'].update(project_media['images'])
 project_videos=json.loads((ROOT/'public/media/project-video-manifest.json').read_text())
 assert not media['videos'].keys() & project_videos['videos'].keys(), 'Duplicate video identity'
 media['videos'].update(project_videos['videos'])
 if DIST.is_symlink():raise ValueError('dist must not be a symlink')
 if DIST.exists():shutil.rmtree(DIST) # generated output only; never source/inventory paths
 DIST.mkdir();(DIST/'assets').mkdir()
 for folder in ['styles','scripts']:
  for p in (SRC/folder).iterdir():
   if p.is_file() and p.suffix in ('.css','.js') and p.name not in ('family-access.js','application-view-ping.js'):shutil.copyfile(p,DIST/'assets'/p.name)
 shutil.copyfile(SRC/'favicon.svg',DIST/'assets/favicon.svg')
 # Only generated, hashed media from manifest entries, never originals/source paths.
 def assets(node):
  if isinstance(node,dict):
   if 'url' in node:yield node
   for value in node.values():yield from assets(value)
  elif isinstance(node,list):
   for value in node:yield from assets(value)
 (DIST/'media').mkdir()
 for item in assets(media):
  name=Path(item['url']).name;p=ROOT/'public/media'/name
  assert p.parent.resolve()==(ROOT/'public/media').resolve() and not p.is_symlink()
  assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256']
  shutil.copyfile(p,DIST/'media'/name)
 # Public manifest contains runtime URLs/dimensions only; source provenance stays in repository.
 runtime={k:media[k] for k in ('images','videos','stairs')}
 (DIST/'media/manifest.json').write_text(json.dumps(runtime,separators=(',',':'))+'\n')
 header=render('_includes/header.html',name=escape(site['name']),navigation=links(site['navigation']))
 footer=render('_includes/footer.html',footer_links=links(site['footer']),email=escape(site['email']),telephone=escape(site['telephone']),phone=escape(site['phone']))
 footer+=render('_includes/portal.html',portal_poster=media['videos']['portal']['posters'][-1]['url'])
 arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
 status_rows=''.join(f'<div class="status-row"><dt class="status-label tone-{escape(s["tone"])}">{escape(s["label"])}</dt><dd>{escape(s["meaning"])}</dd></div>' for s in statuses)
 common=dict(arrow=arrow,hero_picture=picture(media['images']['hero'],'Dark maker workshop with a mechanical whale, camera and floating project displays',eager=True),status_rows=status_rows)
 for slug,title,description in [('shell','Shared shell preview','Shared Olsen Automation design components from the approved V6 pilot.'),('media','Workshop media preview','Local review of optimized workshop media, motion controls and still fallbacks.')]:
  data=common if slug=='shell' else {'arrow':arrow,'outbound_arrow':'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>','door_poster':media['videos']['stairs']['posters'][-1]['url'],'entry_poster':media['videos']['entry']['posters'][-1]['url'],'workbench_poster':media['videos']['workbench']['posters'][-1]['url'],'portal_poster':media['videos']['portal']['posters'][-1]['url']}
  content=render(f'previews/{slug}.html',**data)
  page=render('_includes/layout.html',title=title,description=description,content=content,header=header,footer=footer,page_styles='<link rel="stylesheet" href="/assets/journey.css"><link rel="stylesheet" href="/assets/media.css">' if slug=='media' else '',page_scripts='<script type="module" src="/assets/media.js"></script>' if slug=='media' else '')
  dest=DIST/'preview'/slug/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(page)
 (DIST/'404.html').write_text(render('_includes/layout.html',title='Page not found',description='The requested Olsen Automation page could not be found.',content='<section class="section"><div class="wrap"><h1>Page not found.</h1><p>The page may have moved, or the address may be incorrect.</p><a class="btn primary" href="/">Return to Olsen Automation</a></div></section>',header=header,footer=footer,page_styles='',page_scripts=''))
 build_site(header,footer,render,media)
 publish_unlisted(DIST,ROOT/'dist-unlisted')
 add_public_metadata(DIST,site,media,json.loads(read('_data/projects.json')),json.loads(read('_data/project-photos.json')))
 (DIST/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
 security=json.loads(read('_data/preview-headers.json'))
 (DIST/'_headers').write_text('/*\n'+''.join(f'  {name}: {value}\n' for name,value in security.items())+'/assets/*\n  Cache-Control: no-cache\n/media/*\n  Cache-Control: public, max-age=86400\n')
 aliases=json.loads((SRC/'_data/route-aliases.json').read_text())
 (DIST/'_redirects').write_text(''.join(f'{source} {target} 200\n' for source,target in aliases.items()))
 print(f'Built {len(list(DIST.rglob("*.html")))} allowlisted preview pages; original root files untouched; handoff material excluded.')
if __name__=='__main__':build()
