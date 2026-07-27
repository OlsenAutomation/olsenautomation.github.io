#!/usr/bin/env python3
import argparse,base64,hashlib,io,json,os,pathlib,re,time,urllib.request
from PIL import Image

NAMES=['jack-daniels-holiday-coca-cola.jpg','jack-daniels-patriotic.jpg','jack-daniels-flavor-portfolio.jpg','titos-mule-mug.jpg','jack-daniels-football-feature.jpg','cutwater-stadium.jpg']
SHAS='ce6a856d8514fbf39e1b87da5944b6ab0c0dd41e 5c3b30319506c463ffbdd70b1d030911413f6b57 f68e7bdb15d503f26b2c8ca90297a974250523ff 31d3d1c309f51167ac22e8229e72bfc8c46eaede c3903a94904d1ded6b1d651f771d818a05b12349 c3721b2a6c38b2847f439c110344e7e24c1c8f0c 01626896a09194adc6ac6534a9211310c50cbde2'.split()
KEY='20260726-source-reupload-final'
OUT=pathlib.Path('/tmp/territory')

def request(url,token=None):
    headers={'User-Agent':'territory-repair'}
    if token: headers.update({'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'})
    else: headers.update({'Cache-Control':'no-cache','Pragma':'no-cache'})
    with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=30) as response:
        return response.read(),response.headers.get('Content-Type','')

def fetch_blob(repo,token,sha):
    raw,_=request(f'https://api.github.com/repos/{repo}/git/blobs/{sha}',token)
    payload=json.loads(raw)
    data=base64.b64decode(payload['content'],validate=True)
    if len(data)!=payload['size']: raise RuntimeError(f'{sha}: GitHub size mismatch')
    return data

def metrics(image):
    pixels=list(image.convert('RGB').resize((180,240),Image.Resampling.LANCZOS).convert('HSV').getdata())
    def fraction(test,start=0,end=240):
        return sum(test(h/255,s/255,v/255) for y in range(start,end) for h,s,v in pixels[y*180:(y+1)*180])/((end-start)*180)
    return {
      'red':fraction(lambda h,s,v:(h<.055 or h>.965) and s>.43 and v>.22),
      'redlow':fraction(lambda h,s,v:(h<.055 or h>.965) and s>.43 and v>.22,100),
      'orange':fraction(lambda h,s,v:.035<=h<.125 and s>.34 and v>.25),
      'orangetop':fraction(lambda h,s,v:.035<=h<.125 and s>.34 and v>.25,0,145),
      'yellow':fraction(lambda h,s,v:.125<=h<.205 and s>.43 and v>.42),
      'yellowtop':fraction(lambda h,s,v:.125<=h<.205 and s>.43 and v>.42,0,145),
      'greenlow':fraction(lambda h,s,v:.205<=h<.455 and s>.30 and v>.20,100),
      'teal':fraction(lambda h,s,v:.43<=h<.59 and s>.28 and v>.22),
      'blue':fraction(lambda h,s,v:.56<=h<.76 and s>.32 and v>.24),
      'neutral':fraction(lambda h,s,v:s<.24 and .30<v<.92,0,145),
    }

def recover():
    repo=os.environ['REPO'];token=os.environ['GH_TOKEN'];OUT.mkdir(exist_ok=True)
    rows=[]
    for sha in SHAS:
        data=fetch_blob(repo,token,sha)
        try:
            with Image.open(io.BytesIO(data)) as image:
                if image.format!='JPEG': continue
                image.verify()
            with Image.open(io.BytesIO(data)) as image:
                image.load()
                if image.size!=(900,1200): raise RuntimeError(f'{sha}: expected 900x1200, got {image.size}')
                if image.info.get('progressive') or image.info.get('progression'): raise RuntimeError(f'{sha}: progressive JPEG')
                scene=metrics(image)
        except Exception as error:
            if data.startswith(b'\xff\xd8'): raise RuntimeError(f'{sha}: incomplete JPEG: {error}') from error
            continue
        if len(data)<25000 or not data.endswith(b'\xff\xd9'): raise RuntimeError(f'{sha}: truncated or undersized JPEG')
        rows.append({'sha':sha,'data':data,'metrics':scene,'sha256':hashlib.sha256(data).hexdigest()})
    if len(rows)!=6: raise RuntimeError(f'Expected six valid JPEGs; found {len(rows)}')
    remaining=rows[:]
    def take(name,score):
        item=max(remaining,key=score);remaining.remove(item);item['name']=name;return item
    football=take(NAMES[4],lambda x:2.2*x['metrics']['yellowtop']+x['metrics']['yellow'])
    holiday=take(NAMES[0],lambda x:1.5*x['metrics']['red']+.45*x['metrics']['redlow'])
    titos=take(NAMES[3],lambda x:1.8*x['metrics']['orangetop']+.2*x['metrics']['orange'])
    cutwater=take(NAMES[5],lambda x:1.8*x['metrics']['teal']+.15*x['metrics']['orange'])
    flavor=take(NAMES[2],lambda x:1.5*x['metrics']['greenlow']+.35*x['metrics']['redlow']+.15*x['metrics']['yellow'])
    patriotic=remaining.pop();patriotic['name']=NAMES[1]
    checks=[football['metrics']['yellowtop']>.006,holiday['metrics']['red']>.025,titos['metrics']['orangetop']>.025,cutwater['metrics']['teal']>.018,flavor['metrics']['greenlow']>.025,patriotic['metrics']['neutral']>.20,patriotic['metrics']['blue']>.004]
    if not all(checks): raise RuntimeError(f'Scene-to-caption checks failed: {checks}')
    manifest={}
    for item in [holiday,patriotic,flavor,titos,football,cutwater]:
        (OUT/item['name']).write_bytes(item['data'])
        manifest[item['name']]={'sha256':item['sha256'],'bytes':len(item['data']),'source_blob':item['sha']}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2,sort_keys=True))

def prepare():
    recover()
    asset=pathlib.Path('assets/territory-execution');asset.mkdir(parents=True,exist_ok=True)
    for name in NAMES: (asset/name).write_bytes((OUT/name).read_bytes())
    page=pathlib.Path('territory-sales-execution.html');html=page.read_text(encoding='utf-8')
    html=html.replace('Five spirit-forward examples demonstrating','Six spirit-forward examples demonstrating')
    for name in NAMES:
        if name==NAMES[4] and name not in html: continue
        html,count=re.subn(rf'assets/territory-execution/{re.escape(name)}(?:\?v=[^"\s]+)?',f'assets/territory-execution/{name}?v={KEY}',html)
        if count!=1: raise RuntimeError(f'{name}: expected one existing reference, found {count}')
    if NAMES[4] not in html:
        marker='<div class="photo"><img loading="lazy" src="assets/territory-execution/cutwater-stadium.jpg'
        image_at=html.find(marker);article_at=html.rfind('        <article class="work">',0,image_at)
        if image_at<0 or article_at<0: raise RuntimeError('Football-card insertion point missing')
        card=f'''        <article class="work">
          <figure>
            <div class="photo"><img loading="lazy" src="assets/territory-execution/{NAMES[4]}?v={KEY}" alt="Jack Daniel's football-themed retail display with a custom goalpost and branded football"></div>
            <figcaption class="work-copy"><span class="tag">Sports occasion</span><h3>Jack Daniel’s football feature</h3><p>A custom goalpost, oversized branded football, seasonal balloons, disciplined case mass, and visible pricing turn a game-day program into a high-impact destination.</p></figcaption>
          </figure>
        </article>
'''
        html=html[:article_at]+card+html[article_at:]
    spirits=html[html.index('<section id="spirits"'):html.index('<section id="wine"')]
    if spirits.count('<article class="work">')!=6: raise RuntimeError('Spirits gallery must contain six cards')
    for name in NAMES:
        if spirits.count(f'assets/territory-execution/{name}?v={KEY}')!=1: raise RuntimeError(f'{name}: final reference mismatch')
    for token in ['data-b64=','decodeBase64Image','Image temporarily unavailable','territory-execution/data/','.b64','data:image/']:
        if token in html: raise RuntimeError(f'Legacy workaround remains: {token}')
    page.write_text(html,encoding='utf-8')
    manifest=json.loads((OUT/'manifest.json').read_text())
    for name,expected in manifest.items():
        path=asset/name;raw=path.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=expected['sha256']: raise RuntimeError(f'{name}: hash changed before commit')
        with Image.open(path) as image: image.verify()
        with Image.open(path) as image:
            image.load()
            if image.format!='JPEG' or image.size!=(900,1200): raise RuntimeError(f'{name}: full decode failed')
            if image.info.get('progressive') or image.info.get('progression'): raise RuntimeError(f'{name}: progressive JPEG')

def verify():
    sha=os.environ['FINAL'];manifest=json.loads((OUT/'manifest.json').read_text())
    page=f'https://olsenautomation.com/territory-sales-execution.html?verify={sha}';html=None
    for attempt in range(48):
        try:
            raw,_=request(page+f'&attempt={attempt}');candidate=raw.decode('utf-8')
            if KEY in candidate and NAMES[4] in candidate: html=candidate;break
        except Exception: pass
        time.sleep(15)
    if html is None: raise RuntimeError('New production HTML did not publish within twelve minutes')
    evidence={'commit':sha,'page':page,'cache_key':KEY,'images':{}}
    for name,expected in manifest.items():
        url=f'https://olsenautomation.com/assets/territory-execution/{name}?v={KEY}&verify={sha}'
        raw,content_type=request(url);digest=hashlib.sha256(raw).hexdigest()
        if digest!=expected['sha256'] or 'image/jpeg' not in content_type.lower(): raise RuntimeError(f'{name}: production bytes or MIME mismatch')
        with Image.open(io.BytesIO(raw)) as image: image.verify()
        with Image.open(io.BytesIO(raw)) as image:
            image.load()
            if image.format!='JPEG' or image.size!=(900,1200): raise RuntimeError(f'{name}: production decode mismatch')
            if image.info.get('progressive') or image.info.get('progression'): raise RuntimeError(f'{name}: progressive production JPEG')
        evidence['images'][name]={'url':url,'sha256':digest,'bytes':len(raw),'content_type':content_type,'dimensions':[900,1200],'full_decode':True}
    pathlib.Path('production-verification.json').write_text(json.dumps(evidence,indent=2,sort_keys=True));print(json.dumps(evidence,indent=2,sort_keys=True))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','verify']);args=parser.parse_args()
    prepare() if args.mode=='prepare' else verify()
