#!/usr/bin/env python3
"""Fail closed on preservation, preview privacy, references and media integrity."""
import csv,hashlib,json,re,subprocess,sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';errors=[]
def check(ok,message):
 if not ok:errors.append(message)
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
allowed={'404.html','preview/shell/index.html','preview/media/index.html'}
pages={str(p.relative_to(DIST)):Page(p.read_text()) for p in DIST.rglob('*.html')}
check(set(pages)==allowed,'Unexpected output routes or missing preview pages')
headers=[];footers=[]
for name,page in pages.items():
 text=(DIST/name).read_text();ids=[a['id'] for _,a in page.tags if 'id' in a]
 check(len(ids)==len(set(ids)),f'{name}: duplicate ids')
 check(len([t for t,a in page.tags if t=='h1'])==1,f'{name}: one h1 required')
 check(any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in page.tags),f'{name}: missing noindex')
 check(not re.search(r'(data:|base64|_codex_handoff|application-view-ping|ntfy\.sh|script\.google\.com|626.{0,8}524|StateSeal|home address)',text),f'{name}: prohibited source/private/legacy content')
 check(not re.search(r'<script(?![^>]*\bsrc=)[^>]*>|\s(?:style|on\w+)=',text),f'{name}: inline script/style/handler')
 check(not any(t=='link' and a.get('rel')=='canonical' for t,a in page.tags),f'{name}: preview cannot claim production canonical')
 for tag,a in page.tags:
  if tag=='img':check('alt' in a and 'width' in a and 'height' in a,f'{name}: image requires alt and dimensions')
  if tag=='video':check(a.get('preload')=='none' and 'src' not in a and 'autoplay' not in a,f'{name}: media loads before intent')
  for attr in ('href','src','poster','srcset'):
   if attr not in a:continue
   urls=[a[attr]] if attr!='srcset' else [x.strip().split()[0] for x in a[attr].split(',')]
   for url in urls:
    u=urlsplit(url)
    if u.scheme or u.netloc:continue
    dest=(DIST/unquote(u.path).lstrip('/')) if u.path else (DIST/name)
    if u.path.endswith('/'):dest/= 'index.html'
    check(dest.is_file(),f'{name}: missing {url}')
    if u.fragment and dest.is_file() and dest.suffix=='.html':check(any(b.get('id')==u.fragment for _,b in Page(dest.read_text()).tags),f'{name}: missing fragment {url}')
 headers.append(re.search(r'<header.*?</header>',text,re.S).group());footers.append(re.search(r'<footer.*?</footer>',text,re.S).group())
check(len(set(headers))==1 and len(set(footers))==1,'Shared shell differs between pages')
for p in DIST.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(DIST)
 check(not p.is_symlink(),f'Output symlink: {rel}')
 check(not any(x in str(rel) for x in ('_codex_handoff','migration','apps-script','.git','CNAME','.pdf')),f'Forbidden output: {rel}')
 check(p.stat().st_size<25*1024*1024,f'Cloudflare per-file limit: {rel}')
check(len([p for p in DIST.rglob('*') if p.is_file()])<20000,'Cloudflare Free asset count exceeded')
check((DIST/'robots.txt').read_text()=='User-agent: *\nDisallow: /\n','Preview robots policy changed')
check('X-Robots-Tag: noindex' in (DIST/'_headers').read_text(),'Missing HTTP noindex')
for row in csv.DictReader((ROOT/'migration/ASSET_INVENTORY.csv').open()):
 if row['path']=='.gitignore':continue
 p=ROOT/row['path'];check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],f'Baseline file changed: {row["path"]}')
check(subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip()=='site-redesign-v2','Wrong branch')
check(not subprocess.check_output(['git','ls-files','_codex_handoff'],cwd=ROOT),'Tracked handoff package')
check(subprocess.run(['git','check-ignore','-q','_codex_handoff'],cwd=ROOT).returncode==0,'Handoff not ignored')
manifest=json.loads((ROOT/'public/media/manifest.json').read_text())
def walk(node):
 if isinstance(node,dict):
  if 'url' in node:yield node
  for v in node.values():yield from walk(v)
 elif isinstance(node,list):
  for v in node:yield from walk(v)
for item in walk(manifest):
 p=DIST/item['url'].lstrip('/');check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],f'Asset integrity failed: {item["url"]}')
for variant in manifest['stairs']['variants']:check(variant['count']==len(variant['frames']) and variant['count']>=120,'Incomplete stair sequence')
if errors:
 print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(pages)} pages; source preservation, shared shell, noindex, references, media integrity, and Free limits.')
