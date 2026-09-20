#!/usr/bin/env python3
"""Create metadata-free, content-addressed web assets from the local approved handoff.
Never copies the handoff package or changes an original. Reuses matching outputs.
"""
import hashlib,io,json,subprocess,tempfile
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
HANDOFF=ROOT/'_codex_handoff'; OUT=ROOT/'public/media'; OUT.mkdir(parents=True,exist_ok=True)
WORK=ROOT/'.migration-local';WORK.mkdir(exist_ok=True)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def run(*args):
 result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if result.returncode:raise RuntimeError(result.stderr.decode()[-2000:])
 return result.stdout
def probe(path):return json.loads(run('ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)))
def publish(raw,stem,extension,**metadata):
 digest=sha(raw);name=f'{stem}.{digest[:12]}.{extension}';path=OUT/name
 if not path.exists():path.write_bytes(raw)
 return dict(url='/media/'+name,bytes=len(raw),sha256=digest,**metadata)
def image(raw,stem,width,fmt='WEBP'):
 with Image.open(io.BytesIO(raw)) as original:
  im=ImageOps.exif_transpose(original).convert('RGB');im.thumbnail((width,99999),Image.Resampling.LANCZOS)
  # Construct a fresh pixel image so EXIF/ICC/comments cannot ride along.
  clean=Image.new('RGB',im.size);clean.paste(im);buf=io.BytesIO()
  clean.save(buf,format=fmt,quality=82 if fmt=='WEBP' else 86,**({'method':6} if fmt=='WEBP' else {'optimize':True,'progressive':True}))
  return publish(buf.getvalue(),f'{stem}-{im.width}', 'webp' if fmt=='WEBP' else 'jpg',width=im.width,height=im.height)
manifest={'schema':1,'images':{},'videos':{},'stairs':{},'sources':[],'policy':{'audio':'removed from decorative derivatives','metadata':'removed; source hashes preserved','motion':'intent-gated; still fallback; no motion downloads for reduced motion/data saving','source_assets':'local handoff only; not deployed'}}
for name,file in [('hero','future-workshop-hero.png'),('whale-assembled','whale-assembled.jpeg'),('whale-kit-blue','whale-kit-blue.jpeg'),('whale-kit-white','whale-kit-white.jpeg')]:
 path=HANDOFF/'reference-images'/file;raw=path.read_bytes()
 manifest['sources'].append(dict(id=name,path='reference-images/'+file,bytes=len(raw),sha256=sha(raw)))
 widths=[640,1280,1672] if name=='hero' else [480,960]
 manifest['images'][name]={'webp':[image(raw,name,w) for w in widths],'fallback':image(raw,name,1280 if name=='hero' else 960,'JPEG')}
 print('image',name,flush=True)
with tempfile.TemporaryDirectory(prefix='media-',dir=WORK) as temp:
 temp=Path(temp)
 for name,file in [('portal','portal.mp4'),('entry','basement-entry-clean-test.mp4'),('workbench','basement-workbench-approach.mp4'),('stairs','basement-walkup-stairs-10s.mp4')]:
  source=HANDOFF/'reference-media'/file;raw=source.read_bytes();info=probe(source);stream=next(s for s in info['streams'] if s['codec_type']=='video' and not s.get('disposition',{}).get('attached_pic'))
  duration=float(stream.get('duration',info['format']['duration']));w=stream['width'];h=stream['height']
  manifest['sources'].append(dict(id=name,path='reference-media/'+file,bytes=len(raw),sha256=sha(raw),duration=duration,width=w,height=h))
  record={'duration':duration,'variants':[]}
  for target in sorted(set([min(w,640),min(w,1280)])):
   output=temp/f'{name}-{target}.mp4'
   run('ffmpeg','-nostdin','-y','-v','error','-i',str(source),'-map','0:v:0','-an','-sn','-dn','-map_metadata','-1','-map_chapters','-1','-vf',f'scale={target}:-2,fps=24','-c:v','libx264','-preset','medium','-crf','25','-pix_fmt','yuv420p','-g','12','-keyint_min','12','-sc_threshold','0','-movflags','+faststart',str(output))
   output_info=probe(output);outstream=output_info['streams'][0]
   assert len(output_info['streams'])==1 and outstream['codec_type']=='video'
   record['variants'].append(publish(output.read_bytes(),f'{name}-{target}','mp4',width=target,height=outstream['height'],duration=float(outstream['duration'])))
  poster=temp/f'{name}-poster.png';poster_time=min(duration-.08,9.95) if name=='stairs' else min(duration/3,2)
  run('ffmpeg','-nostdin','-y','-v','error','-ss',str(poster_time),'-i',str(source),'-map','0:v:0','-frames:v','1','-update','1',str(poster))
  record['posters']=[image(poster.read_bytes(),name+'-poster',width) for width in [640,min(w,1280)]]
  if name=='entry':
   # The first swipe must continue from the still image, not jump back from a
   # later promotional poster to the beginning of the room clip.
   start=temp/'entry-scroll-start.png'
   run('ffmpeg','-nostdin','-y','-v','error','-i',str(ROOT/'public'/record['variants'][0]['url'].lstrip('/')),'-frames:v','1','-map_metadata','-1','-update','1',str(start))
   record['scrollPoster']=image(start.read_bytes(),'entry-scroll-start',640)
  manifest['videos'][name]=record
  if name=='stairs':
   manifest['stairs']={'fps':12,'duration':duration,'variants':[]}
   for width in [480,960]:
    seqdir=temp/str(width);seqdir.mkdir()
    run('ffmpeg','-nostdin','-y','-v','error','-i',str(source),'-map','0:v:0','-an','-map_metadata','-1','-vf',f'fps=12,scale={width}:-2','-c:v','png',str(seqdir/'%04d.png'))
    frames=[image(p.read_bytes(),f'stairs-{i:04}',width) for i,p in enumerate(sorted(seqdir.glob('*.png')))]
    manifest['stairs']['variants'].append({'width':width,'count':len(frames),'bytes':sum(f['bytes'] for f in frames),'frames':frames})
  print('video',name,flush=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
files=[p for p in OUT.iterdir() if p.is_file()]
results={'source_bytes':sum(x['bytes'] for x in manifest['sources']),'production_bytes':sum(p.stat().st_size for p in files),'file_count':len(files),'largest_file_bytes':max(p.stat().st_size for p in files),'source_count':len(manifest['sources']),'ffmpeg':run('ffmpeg','-version').decode().splitlines()[0],'pillow':__import__('PIL').__version__}
(ROOT/'migration/MEDIA_RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results),flush=True)
