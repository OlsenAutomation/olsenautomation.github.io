"""One source and renderer for the public account of every atlas project."""
import html, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def esc(value): return html.escape(str(value), quote=True)
def load(): return json.loads((ROOT / 'src/_data/project-stories.json').read_text())

def story(slug, record):
    steps = ''.join(f'<li><span aria-hidden="true">{i:02d}</span>{esc(text)}</li>' for i, text in enumerate(record['flow'], 1))
    sections = ''.join(f'<div class="story-part"><h3>{title}</h3><p>{esc(record[key])}</p></div>' for key, title in [('origin', 'Where it started'), ('built', 'What took shape'), ('lesson', 'What the work revealed'), ('next', 'The next step')])
    return f'<section class="project-story" data-project-story="{esc(slug)}" aria-labelledby="story-{esc(slug)}"><p class="eyebrow">Inside the project</p><h2 id="story-{esc(slug)}">{esc(record["headline"])}</h2><ol class="project-flow" aria-label="Project workflow">{steps}</ol><div class="story-parts">{sections}</div><aside class="story-evidence"><h3>Evidence and current scope</h3><p>{esc(record["evidence"])}</p><small>Source history reviewed September 2026.</small></aside></section>'

def videos(slug, media):
    if slug != 'mechanical-whale': return ''
    clips = [
        ('whale-v05-mechanism', 'Inside the v0.5 mechanism', '16-second mechanism close-up', 'September 16: a close-up of the v0.5 wave drive after Brian adjusted spacing and retention. This is the modified physical assembly, shown at the supplied recording speed. The final clip still needed glue; repeatable retention is not yet established.'),
        ('whale-v041-motion', 'Earlier v0.4.1 motion', '12-second motion excerpt', 'September 14: Brian turns the hand crank on the assembled v0.4.1 prototype. The whale and wave supports move together. This normal-speed excerpt remains as development history, with incidental audio removed.'),
        ('whale-v041-assembly', 'Earlier v0.4.1 assembly', '29-second assembly timelapse', 'September 14: the supplied timelapse follows the earlier physical assembly on the workbench. Parts are fitted and adjusted before the complete whale is shown. The original timelapse speed is retained.')
    ]
    output = []
    for identity, title, duration, description in clips:
        video = media['videos'][identity]; small, large = video['variants']; poster = video['posters'][-1]
        orientation = ' portrait' if large['height'] > large['width'] else ''
        output.append(f'<figure class="project-clip{orientation}" data-project-clip><h3 id="{identity}-title">{title}</h3><video width="{large["width"]}" height="{large["height"]}" playsinline preload="none" poster="{esc(poster["url"])}" aria-labelledby="{identity}-title" aria-describedby="{identity}-description" tabindex="0" data-small="{esc(small["url"])}" data-large="{esc(large["url"])}"></video><div class="clip-actions"><button class="btn primary" type="button" data-clip-play hidden>Play {duration}</button><a href="{esc(large["url"])}">Open MP4 <span class="clip-size">({large["bytes"]/1000000:.1f} MB)</span></a></div><p class="clip-status" role="status" aria-live="polite"></p><figcaption id="{identity}-description">{description}</figcaption></figure>')
    return '<section class="project-videos" aria-label="Whale build recordings"><p class="eyebrow">v0.5 and earlier v0.4.1 · September 2026</p><h2>From printed parts to motion.</h2><p>The latest mechanism close-up, followed by the earlier motion and assembly recordings. Press Play to load a clip.</p><div class="project-video-grid">' + ''.join(output) + '</div></section>'
