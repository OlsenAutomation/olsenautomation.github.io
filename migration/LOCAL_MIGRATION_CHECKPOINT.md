# Olsen Automation V2 — local page migration checkpoint

The approved V6 design is now a working local site: homepage, guided tour, project atlas, project records, workshop and preserved legacy pages. All work remains on `site-redesign-v2`. Nothing has been pushed, deployed, merged into main or attached to a domain.

Implementation commits in this combined checkpoint:

- `52cf97d530ebe924b6d4aa1738710f6174fdcf4a` — homepage, shared atlas/project data and navigation/portal sources.
- `08572cd4e2e8819ddeb19f5039df47c53acbeace` — workshop page, scenes, stairs and reviewable email drafts.
- `2ba55c64b66a6665d56edc93fb793b3842769590` — preserved legacy fragments, metadata, forms and isolated unlisted assets.
- `cf8729bb6099e498740178870fc7284dbd66c675` — full-site build, privacy/delivery guards, aliases and validation.

Run validation at the combined checkpoint: the earlier source commits are connected by the final builder commit. The following documentation commit records measurements and review status. Existing Slices 0–4 checkpoints, tag and backup remain unchanged.

## Review

- [Homepage](http://127.0.0.1:43187/)
- [Project atlas](http://127.0.0.1:43187/projects.html)
- [Workshop](http://127.0.0.1:43187/workshop.html)
- [AI visibility intake](http://127.0.0.1:43187/ai-visibility.html) — isolated local receiver; no real submission
- [Shared shell](http://127.0.0.1:43187/preview/shell/) and [media components](http://127.0.0.1:43187/preview/media/)

The four existing noindex pages remain available at their exact paths on `http://127.0.0.1:43189`: family access, product photo production, territory sales execution and visual AI evaluation. Their PDFs, embedded images and application-view script are excluded from public upload output. This temporary preview separation does not remove their existing live URLs.

Run `npm run check` then `npm run preview` to restart the public preview. For isolated unlisted review use `SITE_PRIVATE_REVIEW=1 SITE_PREVIEW_PORT=43189 npm run preview`. Both bind only to localhost.

## What changed

The homepage retains V6's hero, six-stop tour, four flagship compositions, process, atlas, teaching introduction and About/contact flow. The atlas and project records render from one 26-project registry. Public summaries identify prototypes, local applications, private implementations, research and owner-reported evidence instead of treating them all as releases.

The workshop connects the actual portal, two room scenes and 121-frame staircase to a real local page. Visitors can skip, cancel, seek with the keyboard, use still views or opt out through reduced motion. Its form prepares an email for review and download; it does not reserve a seat, collect payment or send the message.

Twelve legacy main-body fragments retain their checked headings, paragraphs, list items, code, disclosures, captions and anchors. Existing titles, descriptions, social metadata, canonical URLs, verification commands, public key and asset bytes are preserved. The homepage retains the original capabilities and public project destinations in the new organization. Shared chrome supplies the corrected public phone on every page. All original root HTML/assets remain unchanged.

## Source organization

```text
src/_data/             identity, taxonomy, projects, page registry, asset allowlists, aliases
src/_includes/         layout, header, footer, portal and atlas-card templates
src/pages/             V6-derived homepage/workshop and explicit legacy fragments
src/pages/project-details/  richer Family Card Chaos and Olsen Music Studio summaries
src/styles/            shared tokens/shell/components and scoped page rules
src/scripts/           shared navigation/portal, tour, filters, forms and media controllers
public/media/          272 optimized derivative/manifest files from the foundation checkpoint
public/unlisted-media/ 11 exact embedded-image extractions; isolated from public output
tools/                 build, local server, preservation/route/privacy/media validators
migration/             inventories, evidence, manifests, decisions and QA records
dist/                  35 public-safe preview pages; the only proposed upload directory
dist-unlisted/         four noindex pages and supporting assets; local review only
_codex_handoff         excluded local symlink; read in place, never copied or committed
wrangler.preview.json  local configuration proposal; no account or domain configuration
```

The full generated public preview is approximately 23.5 MB, including all responsive variants and frame sequences. This is total output size, not initial transfer. No video/frame sequence downloads before intent. The existing eight source assets still produce 20,245,087 bytes of optimized media; mobile videos remain 66.0–89.7% smaller than their sources. No source media was modified. See `MEDIA_PIPELINE.md` and `DERIVATIVE_ASSETS.csv`.

## Validation and cleanup

`npm run check` passes. All 39 pages were rendered at 1440×900 and 390×844, with no detected horizontal overflow, missing loaded images or unlabeled form controls, and one H1 per page. Browser interaction and download evidence is summarized in `QA_LOCAL_MIGRATION.md`; measurements are in `RENDER_QA.csv`.

The frozen inventories were not rerun. Original inventory facts/hashes remain, with progress columns added to the content matrix and new local routes recorded separately in the route map. Eleven embedded-image occurrences have exact hash-to-file mappings. No exact whole-file/image duplicate was found in the original inventory. Retain the six portfolio near-duplicate pairs and three distinct ARC lighting states. Shared CSS now replaces repeated legacy chrome in generated pages, while the originals remain intact. All four archive proposals remain proposals; nothing was consolidated, moved or deleted.

## Remaining work and owner input

The next external step is a Cloudflare Workers Free branch preview using only the public-safe build. Brian's explicit no-push/no-deploy instruction still applies, so publishing that preview and authorizing the account requires his approval. The prepared configuration uses explicit aliases and preserves `.html` routes; actual Cloudflare behavior is unverified until a preview exists.

Before a later go-live, test the exact hosted build, physical iPhone/iPad Safari, real receiver acknowledgement/delivery under owner-authorized testing, final public metadata/sitemap/indexing, and every retained unlisted production route. Preview noindex and draft-only forms must remain until a separately reviewed production build is prepared. No secrets, family records, customer data or account credentials are needed for local review.

There is no missing V6 input or ordinary technical decision requiring Brian to unblock this local checkpoint. Claims without independent evidence remain explicitly owner-reported or limited; no release status, attribution or commercial commitment has been inferred. Final main merge, live domain and DNS approval remain separate from branch-preview approval.
