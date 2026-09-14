#!/usr/bin/env python3
"""Encode approved photo masters; publish only content-addressed web derivatives.

Retouching is performed separately. This step changes encoding and resolution only.
The exact selected source bytes are hashed; no file is removed or overwritten.
"""
import csv,hashlib,json,subprocess,tempfile
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/media'
def sha(data):return hashlib.sha256(data).hexdigest()
def run(*args):
 result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if result.returncode:raise RuntimeError(result.stderr.decode()[-2000:])
 return result.stdout
def publish(raw,stem,extension,width,height):
 digest=sha(raw);name=f'{stem}.{digest[:12]}.{extension}';path=OUT/name
 if not path.exists():path.write_bytes(raw)
 return dict(url='/media/'+name,sha256=digest,bytes=len(raw),width=width,height=height)
def main():
 entries=json.loads((ROOT/'src/_data/project-photo-sources.json').read_text())
 manifest={'schema':1,'images':{}};audit=[]
 with tempfile.TemporaryDirectory(prefix='project-media-') as work:
  work=Path(work)
  for item in entries:
   source=ROOT/item['path']
   assert source.resolve().is_relative_to(ROOT) and not source.is_symlink()
   assert sha(source.read_bytes())==item['sha256'],f'Source changed: {source.name}'
   with Image.open(source) as im:width,height=im.size
   variants=[]
   for target in sorted(set(min(width,n) for n in (384,768,1280))):
    dest=work/f'{item["id"]}-{target}.webp'
    run('cwebp','-quiet','-q','82','-m','6','-metadata','none','-resize',str(target),'0',str(source),'-o',str(dest))
    with Image.open(dest) as im:w,h=im.size
    variants.append(publish(dest.read_bytes(),f'{item["id"]}-{w}','webp',w,h))
   fallback=work/f'{item["id"]}.jpg';target=min(width,1280)
   run('ffmpeg','-nostdin','-y','-v','error','-i',str(source),'-map_metadata','-1','-frames:v','1','-vf',f'scale={target}:-1','-q:v','3','-update','1',str(fallback))
   with Image.open(fallback) as im:w,h=im.size
   # Strip ICC/comment markers without decoding or changing the JPEG pixels.
   fallback_bytes=run('jpegtran','-copy','none','-optimize','-progressive',str(fallback))
   record={'webp':variants,'fallback':publish(fallback_bytes,f'{item["id"]}-{w}','jpg',w,h)}
   manifest['images'][item['id']]=record
   for asset in [*variants,record['fallback']]:
    audit.append(dict(id=item['id'],source=item['path'],source_sha256=item['sha256'],candidate=item.get('candidate',''),treatment=item['treatment'],**asset))
 (OUT/'project-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 with (ROOT/'migration/PROJECT_PHOTO_ASSETS.csv').open('w') as f:
  writer=csv.DictWriter(f,fieldnames=audit[0].keys(),lineterminator='\n');writer.writeheader();writer.writerows(audit)
 totals={'masters':len(entries),'source_bytes':sum((ROOT/i['path']).stat().st_size for i in entries),'derivatives':len(audit),'derivative_bytes':sum(i['bytes'] for i in audit),'largest_derivative_bytes':max(i['bytes'] for i in audit),'metadata':'EXIF, GPS and comments excluded from derivatives','retouching':'Explicitly labeled; source references retained locally'}
 (ROOT/'migration/PROJECT_PHOTO_RESULTS.json').write_text(json.dumps(totals,indent=2)+'\n')
 print(json.dumps(totals))
if __name__=='__main__':main()
