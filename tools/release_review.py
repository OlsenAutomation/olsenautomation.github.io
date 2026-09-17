#!/usr/bin/env python3
"""Prepare route proposals; current acceptance receipts live in migration/RELEASE_CANDIDATE.md."""
import csv
import hashlib
import json
from pathlib import Path
from xml.etree import ElementTree as ET
from urllib.parse import urlsplit
from site_metadata import Head, canonical_url

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
LOCAL = ROOT / '.migration-local/launch-review'
ORIGIN = json.loads((ROOT / 'src/_data/site.json').read_text())['canonical_origin']

def prepare():
    if LOCAL.is_symlink():
        raise ValueError('Review output cannot be a symlink')
    LOCAL.mkdir(parents=True, exist_ok=True)
    original = list(csv.DictReader((ROOT / 'migration/ROUTE_MAP.csv').open()))
    preserved = {row['existing_url']: row for row in original}
    private = {item['route']: item for item in json.loads((ROOT / 'src/_data/pages.json').read_text()) if item['private']}
    generated = {'/' + path.relative_to(DIST).as_posix() for path in DIST.rglob('*.html')}
    aliases = json.loads((ROOT / 'src/_data/route-aliases.json').read_text())
    paths = sorted(set(preserved) | generated | set(aliases))
    rows, sitemap_urls = [], set()
    for route in paths:
        target = aliases.get(route, route)
        public = DIST / target.lstrip('/')
        isolated = ROOT / 'dist-unlisted' / target.lstrip('/')
        state = 'public preview' if public.is_file() else 'isolated local review' if isolated.is_file() else 'preserved source only'
        source = public if public.is_file() else isolated if isolated.is_file() else ROOT / target.lstrip('/')
        assert source.is_file(), f'Route has no recoverable bytes: {route}'
        indexing, decision = 'not a search landing page', ''
        proposal = 'Retain existing resource URL; include only after source/public-output review'
        if target in private:
            indexing = private[target]['robots']
            if 'family-card-chaos-access' in route:
                proposal = 'Keep exact route isolated until an approved access-controlled destination is verified'
                decision = 'Family access boundary'
            else:
                proposal = 'Retain exact direct-link route and existing noindex; exclude from navigation/sitemap'
                decision = 'Approved: direct-link/noindex portfolios; resume, site and class alerts for live release'
        elif isolated.is_file():
            proposal = 'Preserve exact supporting asset/download URL with its approved unlisted page policy'
            decision = 'Approved portfolio assets; family guide stays isolated'
        elif route.startswith('/assets/territory-execution/'):
            proposal = 'Preserve original bytes and URL under the portfolio visibility decision'
            decision = 'Unused source asset remains preserved; no cleanup authorized'
        elif route.startswith('/preview/'):
            proposal = 'Development specimen; exclude from production output'
            indexing = 'noindex'
        elif route == '/404.html':
            proposal = 'Preserve shared 404 with HTTP 404 for missing paths'
            indexing = 'noindex'
        elif public.is_file() and public.suffix == '.html':
            head = Head(public.read_text())
            expected = canonical_url(ORIGIN, target)
            assert head.canonical == expected, f'Missing launch metadata: {route}'
            assert 'noindex' in head.meta['robots'], f'Preview indexing was activated: {route}'
            sitemap_urls.add(expected)
            proposal = 'Retain route; enable indexing only in separately approved production artifact'
            indexing = 'indexable at approved launch; currently noindex'
        elif route == '/sitemap.xml':
            proposal = 'Replace in production with the locally prepared public-only sitemap'
        rows.append(dict(route=route,preview_state=state,production_proposal=proposal,production_indexing=indexing,
                         owner_decision=decision,recoverable_sha256=hashlib.sha256(source.read_bytes()).hexdigest()))
    with (ROOT / 'migration/LAUNCH_ROUTE_REVIEW.csv').open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), lineterminator='\n')
        writer.writeheader(); writer.writerows(rows)
    ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    urlset = ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
    for url in sorted(sitemap_urls):
        ET.SubElement(ET.SubElement(urlset, 'url'), 'loc').text = url
    ET.ElementTree(urlset).write(LOCAL / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    (LOCAL / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: ' + ORIGIN + '/sitemap.xml\n')
    # Route analysis alone does not establish launch readiness. Keep acceptance separate.
    gates = [
        'Approved unlisted boundaries and excluded private family guide',
        'Migrated form/CSP acknowledgement and independent mailbox receipt',
        'Physical iPhone/iPad Safari acceptance of the exact candidate',
        'Separate production artifact and hosted pre-cutover validation',
        'Current DNS snapshot, concrete rollback and explicit final go-live approval',
    ]
    summary = {'production_ready': False, 'deployable': False, 'reviewed_routes': len(rows),
               'sitemap_public_urls': len(sitemap_urls), 'isolated_pages': sum(not (DIST / r.lstrip('/')).exists() for r in private), 'approved_unlisted_pages': sum((DIST / r.lstrip('/')).exists() for r in private), 'scope': 'route proposals only; not a current test-status report', 'acceptance_record': 'migration/RELEASE_CANDIDATE.md', 'launch_gates': gates,
               'owner_deferred_checks': ['Notification provider recovery and actual phone delivery (2026-09-17)']}
    (LOCAL / 'readiness.json').write_text(json.dumps(summary, indent=2) + '\n')
    assert not (DIST / 'sitemap.xml').exists(), 'Draft sitemap must not enter preview output'
    assert (DIST / 'robots.txt').read_text() == 'User-agent: *\nDisallow: /\n'
    assert all(urlsplit(url).path not in private for url in sitemap_urls)
    assert not any('/preview/' in url or '/404.html' in url for url in sitemap_urls)
    print(json.dumps(summary, indent=2))

if __name__ == '__main__':
    prepare()
