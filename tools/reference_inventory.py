#!/usr/bin/env python3
"""Inventory CSS/script references, behavior hooks, downloads and sitemap visibility."""
import csv,hashlib,json,re,subprocess,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=json.loads((ROOT/'migration/BASELINE.json').read_text())['main_commit']
files={p:subprocess.check_output(['git','show',f'{base}:{p}'],cwd=ROOT) for p in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=ROOT,text=True).splitlines()}
def write(name,fields,rows):
 with (ROOT/'migration'/name).open('w',newline='') as f:
  w=csv.DictWriter(f,lineterminator='\n',fieldnames=fields);w.writeheader();w.writerows(rows)
blocks=[];refs=[]
for p,raw in files.items():
 if Path(p).suffix not in ('.html','.css','.js','.gs','.md','.xml'): continue
 text=raw.decode()
 for m in re.finditer(r'<(script|style)\b[^>]*>(.*?)</\1>',text,re.S|re.I):
  data=m.group(2).encode();blocks.append(dict(source=p,line=text.count('\n',0,m.start())+1,kind=m.group(1),bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
 for pattern,kind in [(r'url\(\s*[\'"]?([^\)\'"\s]+)','css resource'),(r'https?://[^\s\'"<>`\\]+','URL literal'),(r'\b(fetch|sendBeacon|localStorage|sessionStorage|postMessage|addEventListener|createObjectURL|clipboard|location\.href)\b','behavior hook')]:
  for m in re.finditer(pattern,text):
   value=m.group(1) if kind!='URL literal' else m.group()
   if value.startswith('data:') or len(value)>1000: value='[inline data; see embedded inventory]'
   refs.append(dict(source=p,line=text.count('\n',0,m.start())+1,kind=kind,value=value))
write('CODE_BLOCK_INVENTORY.csv',['source','line','kind','bytes','sha256'],blocks)
write('REFERENCE_INVENTORY.csv',['source','line','kind','value'],refs)
groups={}
for r in blocks:
 if r['bytes']: groups.setdefault(r['sha256'],[]).append(r)
rows=[]
for sha,items in groups.items():
 if len(items)>1:
  canonical=f"{items[0]['source']}:L{items[0]['line']}"
  for r in items[1:]: rows.append(dict(source=f"{r['source']}:L{r['line']}",canonical=canonical,sha256=sha,kind=r['kind'],action='shared-source extraction candidate after visual checkpoint; retain originals'))
write('DUPLICATE_CODE_BLOCKS.csv',['source','canonical','sha256','kind','action'],rows)
links=list(csv.DictReader((ROOT/'migration/LINK_INVENTORY.csv').open()))
downloads=[]
for p,raw in files.items():
 if Path(p).suffix in ('.pdf','.zip','.mp4'):
  downloads.append(dict(path=p,kind='tracked download',bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),referring_pages=';'.join(sorted(set(r['source'] for r in links if r['target']==p))),availability='local bytes exist; external delivery not exercised'))
downloads.append(dict(path='ai-visibility.html:generated intake JSON',kind='generated download',bytes='',sha256='',referring_pages='ai-visibility.html',availability='JavaScript Blob/anchor download; no submission performed'))
write('DOWNLOAD_INVENTORY.csv',['path','kind','bytes','sha256','referring_pages','availability'],downloads)
content=list(csv.DictReader((ROOT/'migration/CONTENT_MATRIX.csv').open()))
sitemap=ET.fromstring(files['sitemap.xml']);urls=[x.text for x in sitemap.iter() if x.tag.endswith('loc')];out=[]
for r in content:
 expected='https://olsenautomation.com/'+('' if r['path']=='index.html' else r['path'])
 out.append(dict(path=r['path'],robots=r['robots'],in_sitemap=expected in urls,public_inbound_pages=';'.join(sorted(set(l['source'] for l in links if l['target']==r['path'] and next(c for c in content if c['path']==l['source'])['visibility']=='public'))),finding=('noindex page listed in sitemap; preserve boundary and resolve at later migration' if 'noindex' in r['robots'] and expected in urls else 'recorded; no visibility changes')))
write('VISIBILITY_INVENTORY.csv',['path','robots','in_sitemap','public_inbound_pages','finding'],out)
print(json.dumps({'code_blocks':len(blocks),'exact_duplicate_blocks':len(rows),'references_and_hooks':len(refs),'downloads':len(downloads)}))
