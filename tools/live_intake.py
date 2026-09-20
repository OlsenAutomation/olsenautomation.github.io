"""Preserve the newer direct-link intake from pinned Git objects, locally only.

The personalized source is already canonical on main. Do not duplicate its raw
content into this branch or upload it through a public preview build.
"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'src/_data/live-intake-preservation.json').read_text())


def sources():
    files = {}
    for record in CONFIG['files']:
        data = subprocess.check_output(['git', 'show', CONFIG['reviewed_main_commit'] + ':' + record['path']], cwd=ROOT)
        if len(data) != record['bytes'] or hashlib.sha256(data).hexdigest() != record['sha256']:
            raise ValueError('Pinned intake source no longer matches the reviewed record')
        files[record['path']] = data
    receiver = files['apps-script/Code.gs']
    if (ROOT / 'src/receivers/intake.gs').read_bytes() != receiver:
        raise ValueError('Prepared receiver differs from the reviewed live-branch contract')
    return files


def build(output):
    from build import render, links, escape
    files = sources()
    route = CONFIG['route']
    prefix = route.lstrip('/')
    original = files[prefix + 'index.html'].decode()
    main = re.search(r'<main\b[^>]*>(.*?)</main>', original, re.S)[1]
    frames = '\n'.join(re.findall(r'<iframe\b.*?</iframe>', original, re.S))
    attribution = re.search(r'<footer\b[^>]*>(.*?)</footer>', original, re.S)[1]
    title = re.search(r'<title>(.*?) \| Olsen Automation</title>', original)[1]
    description = re.search(r'<meta name="description" content="([^"]+)"', original)[1]
    # Only presentation classes change. Inputs, wording, options and form IDs stay exact.
    main = main.replace('class="button ', 'class="btn ')
    # With JavaScript unavailable, native forms must never put answers in a GET
    # query string. Self POST is rejected by CSP/Worker; the email fallback remains.
    main = main.replace('<form ', '<form method="post" action="' + route + '" ')
    site = json.loads((ROOT / 'src/_data/site.json').read_text())
    header = render('_includes/header.html', name=escape(site['name']), navigation=links(site['navigation']))
    footer = render('_includes/footer.html', footer_links=links(site['footer']), email=escape(site['email']), telephone=escape(site['telephone']), phone=escape(site['phone']))
    page = render('_includes/layout.html', title=title, description=description,
                  content='<div class="conversation-page wrap">' + main + '<p class="small">' + attribution + '</p>' + frames + '</div>', header=header, footer=footer,
                  page_styles='<link rel="stylesheet" href="./intake.css">',
                  page_scripts='<script src="./intake.js" defer></script>')
    # The shared shell must never generate visitor alerts for a client conversation.
    page = page.replace('data-site-mode="preview"', 'data-site-mode="unlisted"')
    page = page.replace('</head>', '<link rel="canonical" href="' + site['canonical_origin'] + route + '">\n</head>')
    dest = output / prefix
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'index.html').write_text(page)
    (dest / 'intake.js').write_bytes(files[prefix + 'intake.js'])
    (dest / 'intake.css').write_bytes((ROOT / 'src/preserved/conversation.css').read_bytes())
    if main not in page or attribution not in page:
        raise ValueError('Original intake wording or attribution was lost')
    return route
