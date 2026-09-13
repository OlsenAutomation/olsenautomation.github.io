# Olsen Automation V2 component checkpoint

Development branch: `site-redesign-v2`. The existing root site remains intact. This checkpoint generates only a shared-shell specimen, a workshop media specimen and a 404 page. It does not migrate the homepage or any live page.

## Local review

Requires Node.js 22+ and Python 3.12+. No npm dependencies or install step are required for build, validation or preview.

```sh
npm run check
npm run preview
```

- Shared shell: http://127.0.0.1:43187/preview/shell/
- Workshop media: http://127.0.0.1:43187/preview/media/
- Local source comparison only: http://127.0.0.1:43187/reference/v6

The server binds only to 127.0.0.1 and serves allowlisted generated output. The reference endpoint reads the approved pilot in place; it is never part of `dist`. The form specimen only previews/downloads a local text draft. It does not send, register, charge or store submissions.

## Rebuilding media, only when needed

Committed derivatives allow normal builds without the local handoff or FFmpeg. Rebuilding derivatives requires the readable `_codex_handoff` symlink, FFmpeg/ffprobe with libx264, and Pillow 12.0.0 (see requirements-media.txt). The recorded run used FFmpeg 8.1.2. Different encoder versions can produce different hashes.

```sh
npm run media
npm run check
```

The pipeline preserves original bytes and writes content-addressed derivatives plus provenance. It does not clean up superseded derivatives automatically. Review any future orphan through the archive manifest before removal.

Read [the checkpoint report](migration/CHECKPOINT_SLICES_2_4.md), [design system](migration/DESIGN_SYSTEM.md), [media results](migration/MEDIA_PIPELINE.md), [QA](migration/QA_SLICES_2_4.md), and [Cloudflare preview plan](migration/CLOUDFLARE_PREVIEW_PLAN.md).

No push/deploy command, automatic deployment workflow, account credential, paid dependency, or production routing configuration is added. Review is the next step.
