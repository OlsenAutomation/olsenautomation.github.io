#!/usr/bin/env python3
"""Produce separate launch/staging artifacts from the validated shared build. No upload."""
import hashlib,json,re,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'dist'
PRODUCTION=ROOT/'dist-production'
CANDIDATE=ROOT/'dist-candidate'
LOCAL=ROOT/'.migration-local/release-candidate'
NOINDEX='noindex, nofollow, noarchive, nosnippet'
def build():
    from release_review import prepare
    prepare()
    LOCAL.mkdir(parents=True,exist_ok=True)
    for output in (PRODUCTION,CANDIDATE):
        if output.is_symlink():raise ValueError('Release output must not be a symlink')
        if output.exists():shutil.rmtree(output)
    shutil.copytree(SOURCE,PRODUCTION)
    shutil.rmtree(PRODUCTION/'preview')
    (PRODUCTION/'route-registry.json').unlink()
    # These modules belong exclusively to the removed media specimen.
    for name in ('media.js','media.css'):
        (PRODUCTION/'assets'/name).unlink()
    public_routes={r['route'] for r in json.loads((SOURCE/'route-registry.json').read_text())}
    unlisted=json.loads((ROOT/'src/_data/unlisted-publication.json').read_text())['approved_routes']
    for path in PRODUCTION.rglob('*.html'):
        route='/'+path.relative_to(PRODUCTION).as_posix();text=path.read_text()
        text=text.replace('data-site-mode="preview"','data-site-mode="production"')
        if route in public_routes:
            text=re.sub(r'<meta name="robots"[^>]*>', '<meta name="robots" content="index,follow">',text)
        text=text.replace(' Preview pages send no alerts.','')
        path.write_text(text)
    # Preserve harmless historical resource URLs as well as currently referenced ones.
    for relative in json.loads((ROOT/'src/_data/release-assets.json').read_text()):
        target=PRODUCTION/relative;target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(ROOT/relative,target)
    shutil.copyfile(ROOT/'.migration-local/launch-review/sitemap.xml',PRODUCTION/'sitemap.xml')
    shutil.copyfile(ROOT/'.migration-local/launch-review/robots.txt',PRODUCTION/'robots.txt')
    headers=json.loads((ROOT/'src/_data/production-headers.json').read_text())
    intake_csp=headers['Content-Security-Policy'].replace("form-action 'none'","form-action https://script.google.com https://script.googleusercontent.com; frame-src https://script.google.com https://*.googleusercontent.com")
    rules='/*\n'+''.join(f'  {k}: {v}\n' for k,v in headers.items())
    rules+='/ai-visibility.html\n  ! Content-Security-Policy\n  Content-Security-Policy: '+intake_csp+'\n'
    hidden=[*unlisted,'/404.html','/api/*','/assets/territory-execution/*','/assets/visual-ai/*','/unlisted-media/*','/Brian_Olsen_DataAnnotation_Visual_AI_Trainer_Resume.pdf']
    rules+=''.join(path+'\n  X-Robots-Tag: '+NOINDEX+'\n' for path in hidden)
    rules+='/assets/*\n  Cache-Control: no-cache\n/media/*\n  Cache-Control: public, max-age=86400\n'
    (PRODUCTION/'_headers').write_text(rules)
    (PRODUCTION/'_redirects').write_text('/ /index.html 200\n')
    shutil.copytree(PRODUCTION,CANDIDATE)
    for path in CANDIDATE.rglob('*.html'):
        text=path.read_text().replace('data-site-mode="production"','data-site-mode="candidate"')
        text=re.sub(r'<meta\b(?=[^>]*\bname=[\"\']robots[\"\'])[^>]*>',f'<meta name="robots" content="{NOINDEX}">',text)
        path.write_text(text)
    (CANDIDATE/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
    (CANDIDATE/'_headers').write_text(rules+'/*\n  X-Robots-Tag: '+NOINDEX+'\n')
    records={}
    for mode,output in [('production',PRODUCTION),('candidate',CANDIDATE)]:
        records[mode]={p.relative_to(output).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(output.rglob('*')) if p.is_file()}
    (LOCAL/'artifact-hashes.json').write_text(json.dumps(records,indent=2)+'\n')
    print(f'Release artifacts prepared: {len(list(PRODUCTION.rglob("*.html")))} HTML pages, {len(records["production"])} files. Not deployed.')
if __name__=='__main__':build()
