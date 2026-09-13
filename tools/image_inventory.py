#!/usr/bin/env python3
"""Inspect baseline images without modifying originals; near matches are review-only."""
import csv,hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
base=json.loads((ROOT/'migration/BASELINE.json').read_text())['main_commit']
rows=[]; hashes=[]
for p in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=ROOT,text=True).splitlines():
 if Path(p).suffix.lower() not in ('.jpg','.jpeg','.png','.webp','.gif'): continue
 raw=subprocess.check_output(['git','show',f'{base}:{p}'],cwd=ROOT)
 with Image.open(io.BytesIO(raw)) as im:
  gray=ImageOps.exif_transpose(im).convert('L').resize((9,8)); pixels=list(gray.getdata())
  dh=sum((pixels[y*9+x]>pixels[y*9+x+1])<<(y*8+x) for y in range(8) for x in range(8))
  exif=im.getexif()
  rows.append(dict(path=p,width=im.width,height=im.height,format=im.format,sha256=hashlib.sha256(raw).hexdigest(),exif_present=bool(exif),gps_present=34853 in exif,dhash=f'{dh:016x}'))
  hashes.append((p,dh))
with (ROOT/'migration/IMAGE_DETAILS.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0])); w.writeheader();w.writerows(rows)
near=[]
for i,(p,h) in enumerate(hashes):
 for q,j in hashes[i+1:]:
  distance=(h^j).bit_count()
  if distance<=8: near.append(dict(source=p,comparison=q,dhash_distance=distance,action='human visual review; never auto-delete a near match'))
with (ROOT/'migration/NEAR_IMAGE_DUPLICATES.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=['source','comparison','dhash_distance','action']);w.writeheader();w.writerows(near)
print(json.dumps({'images':len(rows),'near_candidates':len(near),'gps_present':sum(r['gps_present'] for r in rows),'exif_present':sum(r['exif_present'] for r in rows)}))
