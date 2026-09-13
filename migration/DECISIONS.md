# Migration decisions

- 2026-09-12: GitHub is canonical. Work only on `site-redesign-v2`. Remove inherited origin/main upstream to prevent an accidental plain push to main.
- Preserve all baseline files and public routes throughout this checkpoint. Inventories are internal review documents, excluded from deploy output.
- Approved stance: “Human judgment. AI leverage. Real-world proof.” Public phone: (805) 500-8865 / tel:+18055008865.
- Brian is not a sports photographer. The Photographer They Call Back is his friend’s manuscript, reviewed by Brian, not his book or portfolio project.
- Preserve exact noindex settings and private-route boundaries; noindex is not access control. Private content must never enter public preview output.
- Significant project claims require source evidence or explicit owner-reported/planned/experimental/unverified labels. No upgrade from a pilot to released work by inference.
- No paid services or paid Cloudflare features. Workers Free with Static Assets is the deployment target; branch preview precedes any owner-approved cutover.
- V6 is the approved design. Do not substitute newly invented concept art or deploy the single-file pilot. Await its location while completing independent work.
- Owner follow-up: narrow current work to backup/rollback and inventories/duplicate analysis. No visual implementation, generator, media pipeline, clone, or additional repository folder. Await local-only `_codex_handoff/approved-pilot/Olsen-Automation-Future-Pilot-v6-Single-File.html`; ignore the entire handoff directory.
- Current duplicate analysis records canonical proposals only; no consolidation while the scope is inventory-only.
- Existing noindex/sitemap conflict is documented without changing privacy settings. Existing failed image decodes are documented without substituting uncertain media.

## Continuation after approved handoff arrived

- Brian explicitly resumed Slices 2–4 only. The earlier inventory-only pause is superseded for these slices. Slices 0–1, their records and three commits remain intact; homepage/live-page migration remains paused.
- Reuse the existing separate Codex clone and branch. Link the canonical handoff once, exclude it via Git's resolved local info/exclude, and never copy or commit the handoff package.
- Use V6 source and supplied QA screenshots for shared visual primitives and workshop interaction details. Do not invent a new visual direction, import the pilot's project atlas/claims, or deploy the single-file artifact.
- Generate only explicit preview routes. Shared sources supply all rendered headers, footers, typography, controls and navigation. Legacy root content is never glob-copied into dist. All preview pages are noindex and contain only public-safe specimens.
- Preserve V6 navigation labels while pointing to existing public baseline anchors; the temporary About link uses #contact. Full production navigation and URL migration belong to a later slice. Provide a usable mobile menu through 1040px and usable links without JavaScript.
- Optimize approved media locally with FFmpeg/Pillow; use responsive content-hashed derivatives with provenance. Strip decorative audio/metadata from derivatives only. Keep originals, frozen inventory assets and archive candidates untouched.
- Motion loads on intent and yields to reduced motion/data saving. Retain a still, keyboard controls, direct form focus, portal skip/cancel and error fallbacks. The media form is an isolated local draft specimen; it has no production registration endpoint or persistence.
- Use a dependency-free static build plus targeted validation. No hosted CMS, paid services, Cloudflare media service, npm runtime dependencies or automatic deployment workflow.
- Cloudflare config is a reviewed local proposal, not account/deployment verification. Future public branch preview requires separate authorization; private material cannot rely on noindex for access control. Production must preserve legacy .html behavior rather than inherit preview HTML redirects blindly.
- Stop after the Slices 2–4 checkpoint. Physical iPhone/iPad testing, final page performance, claims/attribution exceptions, account authorization and final go-live are not implied by this completion.

## Local full-page continuation — 2026-09-13

- The owner's request to continue after the checkpoint is treated as permission to advance local page migration. It does not override the prohibition on push, deployment, main edits or domain changes.
- Approved V6 supplies homepage composition, copy hierarchy, project illustrations, tour sequence and workshop interaction. Project descriptions are qualified using the existing inventory and owner-reported V6 material; the pilot alone is not independent evidence of releases or device tests. Professional practice/history labels are separate from software release states.
- The atlas and project records render from `projects.json`; taxonomy labels come from `statuses.json`; all pages use the shared layout/header/footer. Existing legacy main content, metadata, anchors and assets are preserved through explicit fragments and asset allowlists. The old phone is corrected in generated content, while baseline files remain recoverable unchanged.
- The homepage's capabilities and existing public project destinations remain available through About, the atlas and shared navigation. The private family access guide is represented publicly by a safe project summary. The illustrative family card uses “Demo room” so its mock code cannot be mistaken for a real invitation.
- Four existing noindex pages are retained at their original paths on a separate localhost review port. This is a preview isolation measure, not a decision to delete them, make them indexable, or change their eventual production access policy. Preserve their current noindex/visibility boundaries when preparing the production release candidate.
- All generated pages carry an explicit preview-mode marker. Hosted preview intake can download a draft only. Local tests post solely to an isolated synthetic receiver. The original Google endpoint, payload fields, invitation flow and application-view script are retained for later production behavior review. No real submission or notification was sent.
- Eleven base64 images are extracted without re-encoding, hashed and mapped to separate unlisted files. Existing originals, six near-duplicate portfolio pairs, three meaningful ARC light states and all archive candidates remain in place. No duplicate cleanup is performed at this stage.
- Cloudflare preview now proposes `html_handling: none` plus three explicit same-site 200 aliases. This retains `.html` routes without canonicalizing them to extensionless paths. It needs validation on the actual hosted preview before use for production.
- Local validation cannot establish physical Safari playback, real intake delivery, external site health or Cloudflare account behavior. Those remain explicit release gates; final go-live approval remains separate.

## Preview publication approval — 2026-09-13

- Owner approved the specific branch push and public-safe Cloudflare Workers Free preview. This supersedes the prior no-push/no-deploy restriction only for that preview. No main merge, existing Pages change, domain cutover or DNS action is authorized.
- Pin official Wrangler 4.131.1 with a lockfile. Keep telemetry disabled for this project. A publication wrapper requires the approved branch, clean committed sources, the explicit preview Worker/configuration, and passing preservation/build checks.
- Use version upload with alias `site-redesign-v2`; upload only `dist`. The handoff and `dist-unlisted` remain excluded. Record exact remote branch SHA, Worker/version identity and hosted QA before reporting publication complete.
# Hosted preview media correction — 2026-09-13

Brian authorized branch push and a public-safe Workers Free preview. Account authorization is now verified with account/user read and `workers_scripts:write`; the earlier generic `workers:write` grant did not permit the version API. The account dashboard reports Free as the current plan.

The first hosted version preserved all 340 served file hashes and excluded all private/source paths, but returned complete MP4s to Range requests. Browser testing reproduced a zero-length seekable interval and a room position stuck at time zero. A small Worker now handles only `/media/*.mp4`, using only the public Static Assets binding and the public runtime media manifest. It returns exact single byte ranges with the shared preview security headers. All pages, images, frames and scripts continue through ordinary Static Assets routing. MP4 requests consume the existing Workers Free invocation allowance; no paid plan, storage, transformation service, DNS or domain change is enabled. Hosted validation passed on version `29e16c24-e5ed-4578-8e94-5d2455b172c0`: all eight MP4 prefix/suffix responses match source bytes, invalid ranges return 416, and desktop/mobile Chromium plus a native Safari spot check reach the final workbench frame. See `QA_HOSTED_PREVIEW.md`.
