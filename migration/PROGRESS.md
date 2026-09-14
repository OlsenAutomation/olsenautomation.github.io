# Site V2 progress

Owner: Brian Olsen. Active branch: `site-redesign-v2`.

## Project-context audit — 2026-09-14

Whale follow-up: Brian identified today's V4.1 build; the source release message labels it v0.4.1. The local review now includes two original clips (51.8-second crank demonstration and 28.9-second assembly timelapse), seven supplied images, version context and byte-verified source copies. Visual review of the images and sampled video frames establishes visible motion on the assembled, owner-modified prototype beyond the earlier hinge test. The documented retention/bracing corrections remain part of the evidence; no claim of glue-free reliability or completed correction tests was added. The local card checklist is updated and no further Whale photos or recording are needed for drafting. No public content or deployment changed.

Brian requested a card-by-card review of existing chat context, extending the earlier photo discovery. All 26 current registry entries now have a local readiness checklist with available material, remaining extraction/verification work, claim limits and source references. No new project briefs or repeated photo uploads are needed to prepare bounded drafts.

- Searched the existing read-only archive of 2,237 conversations (dated through July 20), screened 22,176 message bodies across 204 primary local Codex histories, and supplemented those results with current ChatGPT searches and recent-page reads from 32 relevant conversations/tasks. This is broad discovery plus selected close reading, not a claim that every cloud message was read.
- Located additional project imagery and context, including existing motion footage, dashboard images, versioned project packages, direct owner test results and corrections. Historical proposals, owner reports and implementation evidence remain distinct; older successes do not validate newer candidates.
- The detailed 26-row checklist, 34-source index and raw evidence snapshots remain local and ignored under `.migration-local/project-context-audit/`. No private chat excerpts, account/customer data or source package entered the Git index or public build.
- This is a research checkpoint only. Public cards/statuses, existing inventories, source assets, private/unlisted boundaries, the Cloudflare preview, main, DNS and the custom domain are unchanged. No push or deployment was performed.

## Project-photo implementation — 2026-09-13

Brian authorized using the reviewed project photos on the new page and cleaning up messy images. The homepage now has three physical-build features, the shared atlas has images on seven project cards, and five project records have galleries with ten images. Existing public ARC//FORGE and Living Lights imagery also supplies their atlas cards. Project statuses and original evidence remain unchanged.

- Three built-in image edits clean the backgrounds of the Whale, Tomb and cedar photographs. These are explicitly labeled AI-retouched presentations. Original build/assembly/detail photos appear in the records; all untouched source references remain local. Generative retouching may reinterpret fine detail and is not additional physical-test evidence.
- Ten selected metadata-free masters plus three existing public images produce 52 responsive WebP/JPEG derivatives totaling 4,134,800 bytes; the largest is 292,461 bytes. Card images use smaller variants and lazy loading. Derivatives carry no EXIF, ICC or comment metadata. Sources, prompts and hashes are documented in the project-photo manifests.
- All 35 public routes passed desktop/mobile rendering measurements (70 records), and four retained unlisted pages passed both sizes locally (eight records). All five new galleries loaded every image; photo links, atlas filtering, mobile navigation, keyboard focus and reduced motion passed. Browser checks were in Chromium at 1440×900 and 390×844, not physical Safari. Full build, preservation, link, form-isolation, metadata, media-range and buffered-player checks passed.
- Private customer/family captures, uncertain attribution and images belonging to unlisted pages remain held. The handoff and full discovery catalog remain ignored. Thirteen unused first-pass JPEG encoding trials were retained in an ignored local archive with hashes; no inventoried source was moved or deleted.
- Published implementation `8874ee7e9741c638c01469042ab44a9fec0a14cf` as Cloudflare preview version `ce003752-0a75-499a-988a-f79a3c18ade6` at the existing branch alias. All 394 hosted files match the build SHA-256 values; three aliases, 22 excluded paths, blocked POST and all eight MP4 range checks pass. Seven photo surfaces passed both desktop/mobile sizes again (14 hosted records). Remote main remains `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`; GitHub Pages, DNS and the custom domain are unchanged.

See `PROJECT_PHOTO_QA.md`, `PROJECT_PHOTO_RENDER_QA.csv`, `PROJECT_PHOTO_PROVENANCE.csv`, `PROJECT_PHOTO_ASSETS.csv`, and `PROJECT_PHOTO_EDIT_PROMPTS.md`.

## Image discovery checkpoint — local review, 2026-09-13

Brian asked to find reusable project images in the relevant project folders and conversations. A separate, ignored review catalog now accounts for all 26 entries in the current site registry. This did not rerun or replace the frozen migration inventories.

- Indexed 4,072 accessible image paths and hashed them: 2,377 unique byte hashes, with 719 exact-duplicate groups and 1,695 extra copies. Many are build/cache/worktree copies, not distinct portfolio images. No consolidation or deletion occurred.
- Recovered 37 supplied image attachments from six relevant conversations and visually reviewed 82 representative candidates across 15 project entries. The local catalog marks 27 as recommended for selection, 32 as reference-only, and 23 as held. Selection is not publication approval.
- Strong finds include physical Whale and Easter Tomb development photos, cedar bracket-cover build photos, a clean Scribr application view, Wing & Light simulator captures, and existing Living Lights and historical display photography. Renders, partial builds, and simulator output keep their evidence distinctions.
- Customer screenshots, personal backgrounds, private application data, uncertain performance claims, and third-party design attribution remain held locally. Missing or restricted sources are recorded per project. No image, private context package, or source-path manifest entered the public build or Git index.
- Review files and recovered copies are under `.migration-local/project-image-review/`, excluded from Git. The review server binds only to `127.0.0.1:43190`. Original sources, the handoff, current Cloudflare preview, main, DNS, and the live site are unchanged. No owner input is needed to retain and review this catalog.

## Current checkpoint — basement usability correction published, 2026-09-13

Brian reported slow basement videos, unclear scrolling, weak stair interaction, and a repeated basement link. The branch now has a short play/pause room tour, three named room stops, visible sliders and scroll instructions, controls inside the stair scene, and shorter scroll distances. The featured workshop card points to the existing learning section; that section contains the single featured basement entrance.

Room and stair clips are fetched once after intent into releasable local Blob URLs, using existing 640-wide derivatives. The next room clip preloads after the first clip is ready. Stairs use one 802,269-byte MP4 rather than loading individual frames during movement. Original videos and frame assets remain preserved. The portal uses the smaller existing clip at 1.5× playback; room/stairs play at 1.25× and remain pausable/scrubbable.

Local browser checks passed at 1440×900, 390×844, and 375×667: play/stop/replay, named stops, keyboard seeking, wheel seeking, door shortcut, reduced motion, failed-media retry, no-JavaScript content and no horizontal overflow. Under 2 Mbps / 150 ms latency / 4× CPU emulation, entry loaded in 3.267 s, the prefetched workbench in 3.920 s, and stairs in 3.472 s. Repeated scrubbing made no additional MP4 requests. No actual phone performance claim is made. Native Safari retesting could not be completed because app focus kept returning to another window and navigation timed out; the new version still needs physical Safari acceptance.

`npm run check` includes meaningful buffered-player regression checks for rapid/reverse seeks, clip transition, replay, cleanup, retry, and cancellation. Public/private preservation checks still pass. Implementation commit `16639b74917769bb3c2577e4b8015faac02cf060` is pushed and published as version `27859d44-20fa-4ed1-bbe8-d2ac5061a735` at the existing branch alias. All 35 public pages passed desktop/mobile checks again (70 records); all 341 served files match SHA-256, with three aliases, 17 excluded paths, blocked POST and all eight video range checks passing. Hosted room playback decoded 157 entrance and 241 workbench frames with zero reported drops; stairs decoded 241 frames with zero reported drops in in-app Chromium. Room wheel motion advanced 40→59 percent; stair wheel motion advanced 39→63 percent with the control panel fixed at 82 px from the top. These are emulator/browser observations, not physical Safari results. Main, DNS and the live site remain untouched.

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
