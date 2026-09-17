#!/usr/bin/env python3
"""Prepare reviewed, silent Whale excerpts. Raw chat media stays local-only."""
import argparse, hashlib, json, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/media'

def run(*args):
    result = subprocess.run(args, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode()[-2000:])
    return result.stdout

def publish(path, stem, width, height):
    data = path.read_bytes(); digest = hashlib.sha256(data).hexdigest()
    name = f'{stem}.{digest[:12]}{path.suffix}'
    target = OUT / name
    if not target.exists():
        target.write_bytes(data)
    return dict(url='/media/' + name, sha256=digest, bytes=len(data), width=width, height=height)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-directory', type=Path, default=ROOT / '.migration-local/project-context-audit/whale-v4.1-2026-09-14/originals')
    parser.add_argument('--only', action='append', help='Update selected clip IDs while preserving previously reviewed media bytes and URLs')
    args = parser.parse_args()
    sources = json.loads((ROOT / 'src/_data/project-video-sources.json').read_text())
    manifest = {'schema': 1, 'videos': {}}; audit = []
    if args.only:
        assert set(args.only) <= {item['id'] for item in sources}, 'Unknown clip ID'
        manifest = json.loads((OUT / 'project-video-manifest.json').read_text())
        audit = [item for item in json.loads((ROOT / 'migration/PROJECT_VIDEO_RESULTS.json').read_text()) if item['id'] not in args.only]
        sources = [item for item in sources if item['id'] in args.only]
    with tempfile.TemporaryDirectory(prefix='whale-video-') as temp:
        temp = Path(temp)
        for item in sources:
            identity, filename = item['id'], item['source_filename']
            start, duration, poster_time = item['start'], item['duration'], item['poster_time']
            directory = ROOT / item['source_directory'] if item.get('source_directory') else args.source_directory
            source = directory / filename
            assert source.name == filename and source.parent == directory
            assert source.resolve().is_relative_to(ROOT / '.migration-local') and not source.is_symlink()
            source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
            assert source_hash == item['sha256'], f'Unreviewed source bytes: {filename}'
            variants = []; posters = []
            for width in item.get('widths', (640, 910)):
                output = temp / f'{identity}-{width}.mp4'
                run('ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', str(start), '-i', str(source), '-t', str(duration), '-map', '0:v:0', '-an', '-sn', '-dn', '-map_metadata', '-1', '-map_chapters', '-1', '-vf', f'scale={width}:-2,setsar=1', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-maxrate', '900k', '-bufsize', '1800k', '-pix_fmt', 'yuv420p', '-g', '30', '-movflags', '+faststart', str(output))
                probe = json.loads(run('ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(output)))
                stream = probe['streams'][0]
                assert len(probe['streams']) == 1 and stream['codec_type'] == 'video'
                assert output.stat().st_size < 4_200_000
                record = publish(output, f'{identity}-{width}', stream['width'], stream['height'])
                record['duration'] = float(probe['format']['duration']); variants.append(record)
                frame = temp / f'{identity}-{width}.png'; poster = temp / f'{identity}-{width}.webp'
                run('ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', str(poster_time), '-i', str(source), '-frames:v', '1', '-vf', f'scale={width}:-2,setsar=1', '-update', '1', str(frame))
                run('cwebp', '-quiet', '-q', '82', '-metadata', 'none', str(frame), '-o', str(poster))
                posters.append(publish(poster, f'{identity}-poster-{width}', stream['width'], stream['height']))
            manifest['videos'][identity] = dict(variants=variants, posters=posters)
            audit.append(dict(id=identity, source_filename=filename, source_sha256=source_hash, source_bytes=source.stat().st_size, excerpt_start_seconds=start, excerpt_duration_seconds=duration, audio='removed', speed='unchanged from supplied source', **manifest['videos'][identity]))
    (OUT / 'project-video-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    (ROOT / 'migration/PROJECT_VIDEO_RESULTS.json').write_text(json.dumps(audit, indent=2) + '\n')
    print(json.dumps({'clips': len(audit), 'video_bytes': sum(v['bytes'] for a in audit for v in a['variants']), 'largest_video_bytes': max(v['bytes'] for a in audit for v in a['variants'])}))

if __name__ == '__main__':
    main()
