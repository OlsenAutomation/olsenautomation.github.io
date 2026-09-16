"""Publish only the three explicitly approved unlisted portfolios and their assets."""
import hashlib,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def publish(dist,isolated):
    policy=json.loads((ROOT/'src/_data/unlisted-publication.json').read_text())
    assert set(policy['approved_routes'])=={'/product-photo-production.html','/territory-sales-execution.html','/visual-ai-evaluation.html'}
    replacements=json.loads((ROOT/'src/_data/unlisted-derivatives.json').read_text())
    files=[r.lstrip('/') for r in policy['approved_routes']]
    files+=json.loads((ROOT/'src/_data/unlisted-assets.json').read_text())
    files += [p.relative_to(isolated).as_posix() for p in (isolated/'unlisted-media').rglob('*') if p.is_file()]
    for relative in files:
        source=isolated/relative
        if relative in replacements:
            item=replacements[relative];source=ROOT/item['source']
            assert hashlib.sha256(source.read_bytes()).hexdigest()==item['sha256']
        if relative=='assets/js/application-view-ping.js':source=ROOT/'src/scripts/application-view-ping.js'
        assert source.is_file() and not source.is_symlink()
        target=dist/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
    assert not (dist/'family-card-chaos-access.html').exists()
