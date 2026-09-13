#!/usr/bin/env python3
"""Inspect baseline images without modifying originals; near matches are review-only."""
import base64,csv,hashlib,io,json,subprocess
from html.parser import HTMLParser
from urllib.parse import unquote
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
base=json.loads((ROOT/'migration/BASELINE.json').read_text())['main_commit']
rows=[]; hashes=[]
sources=[]
class Inline(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for key,val in attrs:
   if val and val.startswith('data:image/'):
    header,_,payload=val.partition(',')
    raw=base64.b64decode(payload) if ';base64' in header else unquote(payload).encode()
    sources.append((f'{self.source}:L{self.getpos()[0]}:{tag}.{key}',raw))
for p in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=ROOT,text=True).splitlines():
 if Path(p).suffix.lower() not in ('.jpg','.jpeg','.png','.webp','.gif','.html'): continue
 raw=subprocess.check_output(['git','show',f'{base}:{p}'],cwd=ROOT)
 if p.endswith('.html'):
  parser=Inline();parser.source=p;parser.feed(raw.decode())
 else: sources.append((p,raw))
for p,raw in sources:
 try: im=Image.open(io.BytesIO(raw))
 except Exception as error:
  rows.append(dict(path=p,width='',height='',format='',sha256=hashlib.sha256(raw).hexdigest(),exif_present='',gps_present='',dhash='',error=str(error)))
  continue
 with im:
  gray=ImageOps.exif_transpose(im).convert('L').resize((9,8)); pixels=list(gray.getdata())
  dh=sum((pixels[y*9+x]>pixels[y*9+x+1])<<(y*8+x) for y in range(8) for x in range(8))
  exif=im.getexif()
  rows.append(dict(path=p,width=im.width,height=im.height,format=im.format,sha256=hashlib.sha256(raw).hexdigest(),exif_present=bool(exif),gps_present=34853 in exif,dhash=f'{dh:016x}',error=''))
  hashes.append((p,dh))
with (ROOT/'migration/IMAGE_DETAILS.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,lineterminator='\n',fieldnames=list(rows[0])); w.writeheader();w.writerows(rows)
near=[]
for i,(p,h) in enumerate(hashes):
 for q,j in hashes[i+1:]:
  distance=(h^j).bit_count()
  if distance<=8: near.append(dict(source=p,comparison=q,dhash_distance=distance,action='human visual review; never auto-delete a near match'))
with (ROOT/'migration/NEAR_IMAGE_DUPLICATES.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,lineterminator='\n',fieldnames=['source','comparison','dhash_distance','action']);w.writeheader();w.writerows(near)
print(json.dumps({'images':len(rows),'near_candidates':len(near),'gps_present':sum(r['gps_present'] is True for r in rows),'exif_present':sum(r['exif_present'] is True for r in rows)}))

groups={}
for p,raw in sources: groups.setdefault(hashlib.sha256(raw).hexdigest(),[]).append(p)
with (ROOT/'migration/EXACT_IMAGE_DUPLICATES.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,lineterminator='\n',fieldnames=['source','canonical','sha256','action']);w.writeheader()
 for sha,paths in groups.items():
  if len(paths)<2: continue
  canonical=sorted(paths,key=lambda p:(':L' in p,len(p),p))[0]
  for p in paths:
   if p!=canonical: w.writerow(dict(source=p,canonical=canonical,sha256=sha,action='recorded canonical proposal only; no source or URL changes'))
