"""Shared project photos for homepage features, atlas cards, and detail galleries."""
import html,json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def esc(value):return html.escape(str(value),quote=True)
def load():return json.loads((ROOT/'src/_data/project-photos.json').read_text())
def picture(item,media,compact=False,eager=False):
 record=media['images'][item['asset']]
 fallback=record['fallback']
 # Cards never request full-size portrait images. The original remains available in the record.
 variants=record['webp'] if not compact else [v for v in record['webp'] if v['width']<=768] or record['webp'][:1]
 srcset=', '.join(f'{esc(v["url"])} {v["width"]}w' for v in variants)
 sizes='(max-width: 760px) 90vw, (max-width: 1040px) 45vw, 30vw' if compact else '(max-width: 760px) 90vw, 960px'
 return f'<picture><source type="image/webp" srcset="{srcset}" sizes="{sizes}"><img src="{esc(fallback["url"])}" width="{fallback["width"]}" height="{fallback["height"]}" alt="{esc(item["alt"])}" loading="{"eager" if eager else "lazy"}" decoding="async"></picture>'
def card(item,media):
 return f'<div class="atlas-photo fit-{esc(item.get("fit","cover"))}">{picture(item,media,compact=True)}<span class="photo-kind">{esc(item["kind"])}</span></div>'
def figure(item,media,hero=False):
 return f'<figure class="project-photo {"project-photo-hero" if hero else ""} fit-{esc(item.get("fit","cover"))}">{picture(item,media,eager=hero)}<figcaption><span class="photo-kind">{esc(item["kind"])}</span><p>{esc(item["caption"])}</p></figcaption></figure>'
def gallery(record,media):
 items=record['items']
 return '<section class="project-photo-section" aria-label="Project images">'+figure(items[0],media,True)+('<div class="project-photo-grid">'+''.join(figure(i,media) for i in items[1:])+'</div>' if len(items)>1 else '')+'</section>'
def highlights(records,projects,media):
 cards=[]
 for slug in ['mechanical-whale','easter-tomb','cedar-bracket-cover-planters']:
  project=next(p for p in projects if p['slug']==slug);record=records[slug];item=record['items'][0]
  cards.append(f'<article class="build-photo-card"><a href="{esc(project["route"])}"><div class="build-photo">{picture(item,media,compact=True)}</div><div class="build-photo-copy"><p class="status-label">{esc(project["status"].capitalize())}</p><h3>{esc(project["title"])}</h3><p>{esc(record["teaser"])}</p><span class="photo-kind">{esc(item["kind"])}</span><span class="build-photo-link">See the build record <span aria-hidden="true">→</span></span></div></a></article>')
 return '<div class="build-photo-grid">'+''.join(cards)+'</div>'
