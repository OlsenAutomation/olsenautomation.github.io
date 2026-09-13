#!/usr/bin/env python3
"""Preservation, explicit routes, preview privacy, references and media integrity."""
import csv,hashlib,json,re,subprocess,sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
from html import unescape
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';PRIVATE=ROOT/'dist-unlisted';errors=[]
def check(ok,message):
 if not ok:errors.append(message)
def norm(s):return re.sub(r'\s+',' ',s).strip().replace('(626) 524-8156','(805) 500-8865')
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.text=[];self.captures=[];self.snippets=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  self.tags.append((tag,dict(attrs)))
  if tag in ['h1','h2','h3','p','li','pre','summary','figcaption']:self.captures.append((tag,[]))
 def handle_data(self,data):
  self.text.append(data)
  for _,buf in self.captures:buf.append(data)
 def handle_endtag(self,tag):
  for i in range(len(self.captures)-1,-1,-1):
   if self.captures[i][0]==tag:
    _,buf=self.captures.pop(i);self.snippets.append(norm(' '.join(buf)));break
registry=json.loads((ROOT/'src/_data/pages.json').read_text())
projects=json.loads((ROOT/'src/_data/projects.json').read_text())
public_routes={'index.html','projects.html','404.html','preview/shell/index.html','preview/media/index.html'}|{r['route'].lstrip('/') for r in registry if not r['private']}|{r['route'].lstrip('/') for r in projects if r['route'].startswith('/projects/')}
private_routes={r['route'].lstrip('/') for r in registry if r['private']}
pages={p:Page(p.read_text()) for root in (DIST,PRIVATE) for p in root.rglob('*.html')}
check({str(p.relative_to(DIST)) for p in pages if p.is_relative_to(DIST)}==public_routes,'Unexpected public routes')
check({str(p.relative_to(PRIVATE)) for p in pages if p.is_relative_to(PRIVATE)}==private_routes,'Unexpected unlisted routes')
headers=[];footers=[]
for file,page in pages.items():
 private=file.is_relative_to(PRIVATE);root=PRIVATE if private else DIST;name=str(file.relative_to(root));text=file.read_text();ids=[a['id'] for _,a in page.tags if 'id' in a]
 check(any(t=='body' and a.get('data-site-mode')=='preview' for t,a in page.tags),f'{name}: missing preview delivery guard')
 check(len(ids)==len(set(ids)),f'{name}: duplicate ids')
 check(sum(t=='h1' for t,a in page.tags)==1,f'{name}: one h1 required')
 robots=[a.get('content','') for t,a in page.tags if t=='meta' and a.get('name')=='robots']
 check(len(robots)==1 and 'noindex' in robots[0],f'{name}: one noindex required for local review')
 check('{{status:' not in text and '<!-- PROJECT_ATLAS -->' not in text,f'{name}: unresolved shared content')
 check(not re.search(r'(data:|base64|_codex_handoff|626.{0,8}524)',text),f'{name}: embedded source or old contact')
 check(not re.search(r'<script(?![^>]*\bsrc=)[^>]*>|\s(?:style|on\w+)=',text),f'{name}: inline script/style/handler')
 if not private:check(not any(urlsplit(a.get('href','')).path.lstrip('/') in private_routes for t,a in page.tags),f'{name}: exposes unlisted route')
 for tag,a in page.tags:
  if tag=='img':check('alt' in a and 'width' in a and 'height' in a,f'{name}: image requires alt/dimensions')
  if tag=='video':check(a.get('preload')=='none' and 'src' not in a and 'autoplay' not in a,f'{name}: media loads before intent')
  for attr in ('href','src','poster','srcset'):
   if attr not in a:continue
   urls=[a[attr]] if attr!='srcset' else [x.strip().split()[0] for x in a[attr].split(',')]
   for url in urls:
    u=urlsplit(url)
    if u.scheme or u.netloc:continue
    path=unquote(u.path);dest=((root/path.lstrip('/')) if path.startswith('/') else (file.parent/path)) if path else file
    if path.endswith('/'):dest/='index.html'
    if not dest.is_file() and private:dest=DIST/dest.relative_to(PRIVATE)
    check(dest.is_file(),f'{name}: missing {url}')
    if u.fragment and dest.is_file() and dest.suffix=='.html':check(any(b.get('id')==u.fragment for _,b in pages[dest].tags),f'{name}: missing fragment {url}')
 headers.append(re.search(r'<header.*?</header>',text,re.S).group());footers.append(re.search(r'<footer.*?</footer>',text,re.S).group())
check(len(set(headers))==1 and len(set(footers))==1,'Shared header/footer differs')
for r in registry:
 if not r['source'].startswith('pages/legacy/'):continue
 original=(ROOT/r['route'].lstrip('/')).read_text();original_main=re.search(r'<main\b[^>]*>(.*?)</main>',original,re.S).group(1)
 source=Page((ROOT/'src'/r['source']).read_text());new_text=norm(' '.join(source.text))
 for snippet in Page(original_main).snippets:check(not snippet or snippet in new_text,f'{r["route"]}: lost content {snippet[:65]}')
 rendered=pages[(PRIVATE if r['private'] else DIST)/r['route'].lstrip('/')]
 for t,a in Page(original).tags:
  if t=='script' and 'src' in a:check((t,a) in rendered.tags,f'{r["route"]}: original script loading attributes changed')
  if (t=='meta' and (a.get('property','').startswith('og:') or a.get('name','').startswith('twitter:'))) or (t=='link' and a.get('rel')=='canonical'):check((t,a) in rendered.tags,f'{r["route"]}: metadata changed {a}')
 if r['private']:check(any(t=='meta' and a.get('name')=='robots' and a.get('content')==r['robots'] for t,a in rendered.tags),f'{r["route"]}: noindex changed')
 if r['route']=='/verify.html':
  old=re.findall(r'<pre[^>]*>(.*?)</pre>',original,re.S);new=re.findall(r'<pre[^>]*>(.*?)</pre>',(DIST/'verify.html').read_text(),re.S)
  check([unescape(x) for x in old]==[unescape(x) for x in new],'Verification commands/key changed')
for p in DIST.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(DIST)
 check(not p.is_symlink(),f'Output symlink: {rel}')
 check(not any(x in str(rel) for x in ('_codex_handoff','migration','apps-script','.git','CNAME','.pdf','unlisted-media','family-access','application-view-ping')),f'Forbidden public output: {rel}')
 check(p.stat().st_size<25*1024*1024,f'Cloudflare per-file limit: {rel}')
check(sum(p.is_file() for p in DIST.rglob('*'))<20000,'Cloudflare Free asset count exceeded')
check((DIST/'robots.txt').read_text()=='User-agent: *\nDisallow: /\n','Preview robots changed')
check('X-Robots-Tag: noindex' in (DIST/'_headers').read_text(),'Missing preview HTTP noindex')
aliases=json.loads((ROOT/'src/_data/route-aliases.json').read_text())
check((DIST/'_redirects').read_text()==''.join(f'{a} {b} 200\n' for a,b in aliases.items()),'Preview alias mapping drift')
check(json.loads((ROOT/'wrangler.preview.json').read_text())['assets']['html_handling']=='none','Cloudflare would redirect legacy HTML routes')
for target in aliases.values():check((DIST/target.lstrip('/')).is_file(),'Missing alias target')
for row in csv.DictReader((ROOT/'migration/ASSET_INVENTORY.csv').open()):
 if row['path']=='.gitignore':continue
 p=ROOT/row['path'];check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],f'Baseline file changed: {row["path"]}')
for group,root in [('public',DIST),('unlisted',PRIVATE)]:
 for relative in json.loads((ROOT/'src/_data'/f'{group}-assets.json').read_text()):check((ROOT/relative).read_bytes()==(root/relative).read_bytes(),f'Preserved asset changed: {relative}')
for row in csv.DictReader((ROOT/'migration/DERIVATIVE_ASSETS.csv').open()):check(hashlib.sha256((PRIVATE/row['replacement'].lstrip('/')).read_bytes()).hexdigest()==row['sha256'],'Embedded extraction changed')
for p in DIST.rglob('*.js'):
 for relative in re.findall(r'(?:from\s*|import\s*)[\"\'](\.[^\"\']+)[\"\']',p.read_text()):check((p.parent/relative).is_file(),f'Broken module import: {p.name} {relative}')
check(subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip()=='site-redesign-v2','Wrong branch')
check(not subprocess.check_output(['git','ls-files','_codex_handoff'],cwd=ROOT),'Tracked handoff')
check(subprocess.run(['git','check-ignore','-q','_codex_handoff'],cwd=ROOT).returncode==0,'Handoff not ignored')
manifest=json.loads((ROOT/'public/media/manifest.json').read_text())
def walk(node):
 if isinstance(node,dict):
  if 'url' in node:yield node
  for value in node.values():yield from walk(value)
 elif isinstance(node,list):
  for value in node:yield from walk(value)
for item in walk(manifest):
 p=DIST/item['url'].lstrip('/');check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],f'Media integrity: {item["url"]}')
for variant in manifest['stairs']['variants']:check(variant['count']==len(variant['frames']) and variant['count']>=120,'Incomplete stair sequence')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(public_routes)} public preview + {len(private_routes)} isolated unlisted pages; preserved content, metadata, source files, assets, shell, links and privacy.')
