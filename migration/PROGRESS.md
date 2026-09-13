# Site V2 progress

Owner: Brian Olsen. Active branch: `site-redesign-v2`.

## Basement usability correction — local verification complete, 2026-09-13

Brian reported slow basement videos, unclear scrolling, weak stair interaction, and a repeated basement link. The branch now has a short play/pause room tour, three named room stops, visible sliders and scroll instructions, controls inside the stair scene, and shorter scroll distances. The featured workshop card points to the existing learning section; that section contains the single featured basement entrance.

Room and stair clips are fetched once after intent into releasable local Blob URLs, using existing 640-wide derivatives. The next room clip preloads after the first clip is ready. Stairs use one 802,269-byte MP4 rather than loading individual frames during movement. Original videos and frame assets remain preserved. The portal uses the smaller existing clip at 1.5× playback; room/stairs play at 1.25× and remain pausable/scrubbable.

Local browser checks passed at 1440×900, 390×844, and 375×667: play/stop/replay, named stops, keyboard seeking, wheel seeking, door shortcut, reduced motion, failed-media retry, no-JavaScript content and no horizontal overflow. Under 2 Mbps / 150 ms latency / 4× CPU emulation, entry loaded in 3.267 s, the prefetched workbench in 3.920 s, and stairs in 3.472 s. Repeated scrubbing made no additional MP4 requests. No actual phone performance claim is made. Native Safari retesting could not be completed because app focus kept returning to another window and navigation timed out; the new version still needs physical Safari acceptance.

`npm run check` includes meaningful buffered-player regression checks for rapid/reverse seeks, clip transition, replay, cleanup, retry, and cancellation. Public/private preservation checks still pass. Branch-preview update is the next action under Brian's existing approval; main, DNS and the live site remain untouched.

## Previous checkpoint — Cloudflare preview published, 2026-09-13

Brian authorized the branch push and public-safe Workers Free preview, then completed Wrangler authorization in Safari. The reviewed source commit is `3ef1d449aa9ebb7f63e7c9f63f30241ed19b14bf`, pushed to GitHub. Cloudflare version `29e16c24-e5ed-4578-8e94-5d2455b172c0` is available at [the branch preview](https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/).

- Workers Free verified in the account dashboard. Stable workers.dev serving is disabled; version previews are enabled. No custom route, domain, DNS, paid feature, main merge or GitHub Pages source change occurred.
- All 340 served files match the reviewed build SHA-256 values. Three route aliases pass; 17 private/source/missing paths return 404; POST returns 405. All eight MP4s pass exact prefix/suffix and invalid-range checks.
- Fixed a real hosted seek failure with an MP4-only Worker and public Static Assets binding. Images, frames, scripts and pages retain static routing. The browser now reaches 9.9917 seconds of the 10.041667-second workbench clip at both desktop and mobile sizes.
- All 35 public pages passed 1440×900 and 390×844 rendering checks (70 records). Guided tour, atlas, mobile navigation, portals, stairs, forms, downloads, reduced motion, no-JavaScript content and failed-media fallback were exercised. Native macOS Safari also reached the final workbench frame with the slider.
- Intake and workshop tests used synthetic data and created local drafts only. No email, receiver submission, notification or customer data was sent. Four retained unlisted pages remain outside the public artifact.
- Frozen inventories, archives, original pages and assets are preserved; the local-only handoff remains untracked and excluded. Remote main remains `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`; GitHub Pages remains main/root at olsenautomation.com.

See `PREVIEW_PUBLICATION.md`, `QA_HOSTED_PREVIEW.md`, and `HOSTED_RENDER_QA.csv`. Physical iPhone/iPad acceptance, production form delivery, final SEO/private-route policy and owner go-live approval remain separate gates. The sections below record earlier checkpoints and their authority at the time.

## Local site migration checkpoint — historical, 2026-09-13

Brian asked to continue after the Slices 2–4 checkpoint. This continuation implemented the homepage, project atlas, workshop and legacy-page migration locally. The no-push/no-deploy restriction remained in force during that checkpoint. See `LOCAL_MIGRATION_CHECKPOINT.md` and `QA_LOCAL_MIGRATION.md`.

- 35 public-safe preview pages and four isolated unlisted review pages now use the shared shell. All 14 original HTML files remain untouched. The 12 legacy body fragments retain their checked content and anchors; the homepage uses approved V6 composition and retains the original capabilities, contact and project destinations through the atlas.
- The 26-project atlas and project records now share one data registry and status vocabulary. Family Card Chaos and Olsen Music Studio have public summaries; detailed family access and application materials stay outside the public upload directory.
- Workshop portal, room seeking, stair sequence and email preparation are connected to real page routes. No giant pilot, base64 media or handoff package enters generated output.
- All 39 generated pages passed desktop/mobile rendering checks (78 measurements). Form validation, local accepted/rejected/timeout acknowledgements, downloads, keyboard navigation, reduced motion, no-JavaScript reading, media failure and portal controls were exercised. Physical Safari and Cloudflare-hosted acceptance remain pending.
- Baseline assets and archive proposals remain unchanged. Eleven embedded images were extracted byte-for-byte into the isolated unlisted asset set with `DERIVATIVE_ASSETS.csv`; nothing was consolidated, moved or deleted. Content/route tracking gained progress fields and new route records without rerunning the inventories.
- Preview mode prevents real intake delivery. Local QA used synthetic fixtures. No email, notification, access request or customer submission was sent.
- `npm run check` passes. Publishing a Cloudflare branch preview requires Brian's approval and account authorization. Final production routing/SEO activation, real receiver delivery and device checks precede any separate go-live decision.

## Prior foundation checkpoint (historical)

Brian supplied the local-only approved V6 handoff and authorized continuation from the existing checkpoint into Slices 2–4 only. No new clone, backup, tag, branch or inventory run was performed.

- Slice 0 complete: current remote main recorded, annotated local backup tag created, full Git bundle verified, branch created from remote main. No tracked changes existed at start.
- Slice 1 complete for the frozen repository: all 61 tracked files inventoried; page/route/form/link/script/metadata/download and image hashes recorded; attribution and visibility reviewed; duplicate and archive proposals documented.
- Slice 2 complete: shared V6-derived tokens, typography, header, footer, navigation, status definitions, buttons, form primitives, focus and responsive rules. Component preview only; no homepage migration.
- Slice 3 complete: allowlisted static builder, localhost preview server, preservation/privacy/link/media validation, HTTP and motion-boundary checks. Three generated pages tested at desktop/mobile sizes.
- Slice 4 complete for this checkpoint: eight source assets optimized into 272 files (20,245,087 bytes), with responsive imagery, silent videos, posters and two 121-frame stair sequences. Original media hashes unchanged. Further real-device and migrated-page performance acceptance is explicitly pending.
- Slices 5 onward not started. Stop for owner review of `CHECKPOINT_SLICES_2_4.md`.

Verified local-only pilot: `_codex_handoff/approved-pilot/Olsen-Automation-Future-Pilot-v6-Single-File.html`. The symlink resolves to the canonical GitHub Desktop repository's handoff folder; this existing Codex checkout is a separate clone, not a linked worktree. All expected files were readable. The exact local Git exclusion remains in the path returned by `git rev-parse --git-path info/exclude`; no package or symlink is tracked. See `HANDOFF_VERIFICATION.md` for A–G and the three unchanged checkpoint hashes.

Review `CHECKPOINT_SLICES_2_4.md`, `DESIGN_SYSTEM.md`, `MEDIA_PIPELINE.md`, `QA_SLICES_2_4.md`, and `CLOUDFLARE_PREVIEW_PLAN.md`. The frozen inventories, duplicate evidence and archive proposals remain unchanged. All 60 inventoried source files other than the intentionally extended .gitignore still match their recorded SHA-256 values. No baseline pages, assets, forms, scripts, metadata, sitemap or CNAME changed.

All continuation commits remain local. No main edit, merge, push, site deployment, external form submission, notification, account action, DNS change, custom-domain change or paid-service action was performed. Local form QA used synthetic data and produced only a local draft download.

## Branch-preview publication authorized — historical preparation, 2026-09-13

Brian approved pushing `site-redesign-v2` and publishing the public-safe build as a Cloudflare Workers Free branch preview. Main, existing GitHub Pages, CNAME and DNS remain outside this approval. Wrangler 4.131.1 is pinned; local build and Wrangler dry-run pass. GitHub Pages was rechecked: main at repository root, olsenautomation.com, built. Cloudflare CLI authentication and hosted validation are in progress.

The branch push completed and was verified at `916d9001af9bc31c494dea918adf10ec0f803277`; remote main remains the recorded baseline. Cloudflare publication is awaiting owner sign-in/authorization, with the official OAuth screen prepared. No Worker/version/preview URL has been created. See `PREVIEW_PUBLICATION.md` for the receipt, prepared artifact and resume steps.
