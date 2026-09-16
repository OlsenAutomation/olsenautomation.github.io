"""Fill public-page metadata without changing preserved metadata or visibility."""
import html
from html.parser import HTMLParser

class Head(HTMLParser):
    def __init__(self, document):
        super().__init__()
        self.meta = {}
        self.canonical = None
        self.title = ''
        self.in_title = False
        self.feed(document.split('</head>', 1)[0])

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name', ''))] = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'title':
            self.in_title = True

    def handle_data(self, data):
        if self.in_title:
            self.title += data

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

def canonical_url(origin, route):
    return origin + ('/' if route == '/index.html' else route)

def add_public_metadata(dist, site, media, projects, photos):
    origin = site['canonical_origin']
    assert origin == 'https://olsenautomation.com', 'Do not change the approved canonical domain implicitly'
    by_route = {project['route']: project for project in projects}
    for path in sorted(dist.rglob('*.html')):
        route = '/' + path.relative_to(dist).as_posix()
        if route == '/404.html' or route.startswith('/preview/'):
            continue
        document = path.read_text()
        head = Head(document)
        canonical = head.canonical or canonical_url(origin, route)
        image = media['images']['hero']['fallback']
        image_alt = 'Illustrated Olsen Automation workshop; Human judgment. AI leverage. Real-world proof.'
        project = by_route.get(route)
        if project and project['slug'] in photos:
            items = photos[project['slug']]['items']
            selected = next((item for item in items if item['kind'].lower().startswith('original')), items[0])
            image = media['images'][selected['asset']]['fallback']
            image_alt = selected['kind'] + '. ' + selected['alt']
        defaults = {
            'og:type': 'website', 'og:site_name': site['name'],
            'og:title': head.title, 'og:description': head.meta['description'],
            'og:url': canonical, 'og:image': origin + image['url'],
            'og:image:alt': image_alt,
            'twitter:card': 'summary_large_image',
            'twitter:title': head.meta.get('og:title', head.title),
            'twitter:description': head.meta.get('og:description', head.meta['description']),
            'twitter:image': head.meta.get('og:image', origin + image['url']),
            'twitter:image:alt': head.meta.get('og:image:alt', image_alt),
        }
        # Preserve image dimensions for existing authored social images.
        if 'og:image' not in head.meta:
            defaults.update({'og:image:width': image['width'], 'og:image:height': image['height']})
        escape = lambda value: html.escape(str(value), quote=True)
        tags = [] if head.canonical else [f'<link rel="canonical" href="{escape(canonical)}">']
        for key, value in defaults.items():
            if key not in head.meta:
                attr = 'property' if key.startswith('og:') else 'name'
                tags.append(f'<meta {attr}="{key}" content="{escape(value)}">')
        path.write_text(document.replace('</head>', '\n'.join(tags) + '\n</head>'))
