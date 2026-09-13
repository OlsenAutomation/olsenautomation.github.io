#!/usr/bin/env python3
"""Deterministic, read-only inventory of the frozen public repository tree."""
import csv, hashlib, json, re, subprocess, mimetypes, posixpath
from collections import defaultdict
from difflib import SequenceMatcher
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
ROOT = Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT/'migration/BASELINE.json').read_text())['main_commit']
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)
def digest(b): return hashlib.sha256(b).hexdigest()
def write(name, fields, rows):
 with (ROOT/'migration'/name).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
class Page(HTMLParser):
 def __init__(self, text):
  super().__init__(convert_charrefs=True); self.tags=[]; self.words=[]; self.skip=0; self.feed(text)
 def handle_starttag(self,t,attrs):
  self.tags.append((t,dict(attrs),self.getpos()[0]))
  if t in ('script','style'): self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style'): self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip and d.strip(): self.words.append(d.strip())
files={p:git('show',f'{BASE}:{p}') for p in git('ls-tree','-r','--name-only',BASE).decode().splitlines()}
pages={p:Page(b.decode()) for p,b in files.items() if p.endswith('.html')}
uses=defaultdict(set); links=[]; forms=[]; metadata=[]; scripts=[]; embedded=[]
def resolve(source,url):
 u=urlsplit(url)
 if u.scheme in ('mailto','tel','data','javascript','blob'): return '',u.scheme
 if u.netloc and u.netloc not in ('olsenautomation.com','www.olsenautomation.com','olsenautomation.github.io'): return '', 'external'
 path=unquote(u.path)
 target=posixpath.normpath(path.lstrip('/') if path.startswith('/') else posixpath.join(posixpath.dirname(source),path)) if path else source
 if path.endswith('/') or target=='.': target=posixpath.join(target,'index.html').lstrip('./')
 return target, 'internal'
for p,doc in pages.items():
 text=files[p].decode(); form=''
 for tag,a,line in doc.tags:
  if tag=='form':
   form=a.get('id','anonymous'); forms.append(dict(source=p,line=line,form_id=form,kind='form',name='',type='',required='',action=a.get('action','JavaScript; see FORM_BEHAVIOR.md'),method=a.get('method','GET default; JavaScript may override')))
  if tag in ('input','select','textarea','button'):
   forms.append(dict(source=p,line=line,form_id=form,kind=tag,name=a.get('name',a.get('id','')),type=a.get('type',''),required='required' in a,action='',method=''))
  if tag=='meta' or tag=='link': metadata.append(dict(source=p,line=line,tag=tag,attributes=json.dumps(a,sort_keys=True)))
  if tag=='script': scripts.append(dict(source=p,line=line,src=a.get('src','inline'),type=a.get('type','text/javascript'),attributes=json.dumps(a,sort_keys=True)))
  for attr in ('href','src','poster','action','srcset'):
   if attr not in a: continue
   urls=[a[attr]] if attr!='srcset' else [x.strip().split()[0] for x in a[attr].split(',')]
   for url in urls:
    if url.startswith('data:'):
     header,_,payload=url.partition(','); raw=__import__('base64').b64decode(payload) if ';base64' in header else unquote(payload).encode()
     embedded.append(dict(source=p,line=line,mime=header[5:].split(';')[0],bytes=len(raw),sha256=digest(raw))); continue
    target,kind=resolve(p,url); exists=target in files if target else ''
    if target: uses[target].add(p)
    frag=urlsplit(url).fragment; anchor=''
    if target in pages and frag: anchor=any(a.get('id')==unquote(frag) or a.get('name')==unquote(frag) for _,a,_ in pages[target].tags)
    links.append(dict(source=p,line=line,tag=tag,attribute=attr,url=url,kind=kind,target=target,exists=exists,fragment_valid=anchor,download=('download' in a or target.lower().endswith(('.pdf','.zip','.mp4')))))
 # CSS resources, dynamic URLs and storage/API behavior need their own scan.
 for match in re.finditer(r'''https?://[^\s'"<>`\\]+''',text):
  url=match.group();
  if len(url)<1000: uses[url].add(p)
assets=[]
for p,b in files.items():
 assets.append(dict(path=p,bytes=len(b),sha256=digest(b),mime=mimetypes.guess_type(p)[0] or 'application/octet-stream',references=';'.join(sorted(uses[p])),disposition='preserve baseline',review=('unreferenced by HTML; inspect scripts/CSS before archive' if not uses[p] and not p.endswith('.html') else 'retained')))
classifications={
'arc-forge.html':('active prototypes','Public narrative and machine-study images; no release evidence in this repository'),
'ai-visibility.html':('working local applications','Owner-reported service/workflow; intake implementation present; service outcomes not independently verified'),
'cassette-mp4.html':('architecture/research','Concept and roadmap; no downloadable release or extraction proof in this repository'),
'docs.html':('architecture/research','Concept usage instructions; missing release artifacts must not be implied as available'),
'verify.html':('architecture/research','Verification instructions; inspect key and sample availability before making verification claims'),
'firefly-living-lights.html':('active prototypes','Owner-reported physical testing and public photos; inspect exact test evidence before upgrading claims'),
'family-card-chaos-access.html':('private implementations','Existing noindex access guide; game is externally access-controlled; never include in public preview'),
'product-photo-production.html':('workshop pilots','Unlisted portfolio/spec demonstrations; preserve brand attribution, not released product claims'),
'visual-ai-evaluation.html':('workshop pilots','Unlisted independent spec demonstrations; brand marks owned by their respective owners'),
 'territory-sales-execution.html':('not a project','Historical professional retail execution evidence; taxonomy applies to projects, not employment; preserve professional-work description')}
content=[]; routes=[]
for p,doc in pages.items():
 text=files[p].decode(); title=re.search(r'<title>(.*?)</title>',text,re.S).group(1)
 robots=';'.join(a.get('content','') for t,a,_ in doc.tags if t=='meta' and a.get('name','').lower()=='robots')
 status,note=classifications.get(p,('not a project','Service/navigation page; no project status inferred'))
 content.append(dict(path=p,title=title,visibility='unlisted/noindex' if 'noindex' in robots else 'public',robots=robots,status_class=status,evidence=note,attribution='Brian Olsen / Olsen Automation; preserve all existing third-party disclosures',phone_correction_required=bool(re.search(r'626.{0,8}524',text)),action='retain; migrate only after checkpoint',sha256=digest(files[p])))
 routes.append(dict(existing_url='/'+p,proposed_url='/'+p,action='preserve',visibility='unlisted/noindex' if 'noindex' in robots else 'public',preview_policy='exclude from public preview' if 'noindex' in robots else 'baseline local QA only until page migration approved',canonical=';'.join(a.get('href','') for t,a,_ in doc.tags if t=='link' and a.get('rel')=='canonical')))
routes.append(dict(existing_url='/',proposed_url='/',action='preserve index.html alias',visibility='public',preview_policy='no homepage migration before checkpoint',canonical='https://olsenautomation.com/'))
write('CONTENT_MATRIX.csv',list(content[0]),content)
write('ASSET_INVENTORY.csv',list(assets[0]),assets)
write('ROUTE_MAP.csv',list(routes[0]),routes)
write('LINK_INVENTORY.csv',list(links[0]),links)
write('FORM_INVENTORY.csv',list(forms[0]),forms)
write('METADATA_INVENTORY.csv',list(metadata[0]),metadata)
write('SCRIPT_INVENTORY.csv',list(scripts[0]),scripts)
write('EMBEDDED_ASSETS.csv',['source','line','mime','bytes','sha256'],embedded)
groups=defaultdict(list)
for p,b in files.items(): groups[digest(b)].append(p)
duplicates=[]
for h,paths in sorted(groups.items()):
 if len(paths)>1:
  canonical=sorted(paths,key=lambda p:(-len(uses[p]),len(p),p))[0]
  for p in paths:
   if p!=canonical: duplicates.append(dict(kind='exact file',source=p,canonical=canonical,sha256=h,similarity='1.0',action='proposed alias; preserve existing URL and bytes until route-safe consolidation'))
for i,p in enumerate(pages):
 for q in list(pages)[i+1:]:
  score=SequenceMatcher(None,' '.join(pages[p].words).split(),' '.join(pages[q].words).split(),autojunk=False).ratio()
  if score>=.60: duplicates.append(dict(kind='near text',source=p,canonical=q,sha256='',similarity=f'{score:.3f}',action='review only; shared boilerplate is not duplicate content'))
write('DUPLICATES.csv',['kind','source','canonical','sha256','similarity','action'],duplicates)
write('ARCHIVE_MANIFEST.csv',['source','sha256','proposed_destination','canonical_replacement','reason','status'],[])
broken=[l for l in links if l['kind']=='internal' and (l['exists'] is False or l['fragment_valid'] is False)]
summary=dict(baseline=BASE,tracked_files=len(files),html_pages=len(pages),noindex_pages=sum('noindex' in x['robots'] for x in content),total_bytes=sum(len(x) for x in files.values()),forms=sum(x['kind']=='form' for x in forms),links=len(links),broken_internal_references=len(broken),embedded_assets=len(embedded),embedded_bytes=sum(x['bytes'] for x in embedded),exact_duplicate_files=sum(x['kind']=='exact file' for x in duplicates),near_text_pairs=sum(x['kind']=='near text' for x in duplicates))
(ROOT/'migration/INVENTORY_SUMMARY.json').write_text(json.dumps(summary,indent=2)+'\n')
write('LINK_FINDINGS.csv',list(links[0]),broken)
print(json.dumps(summary,indent=2))
