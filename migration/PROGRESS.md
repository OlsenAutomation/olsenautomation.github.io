# Site V2 progress

Owner: Brian Olsen. Active branch: `site-redesign-v2`.

## Local site migration checkpoint — 2026-09-13

Brian asked to continue after the Slices 2–4 checkpoint. This continuation implemented the homepage, project atlas, workshop and legacy-page migration locally. The earlier no-push/no-deploy restriction remains in force. See `LOCAL_MIGRATION_CHECKPOINT.md` and `QA_LOCAL_MIGRATION.md`.

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

## Branch-preview publication authorized — 2026-09-13

Brian approved pushing `site-redesign-v2` and publishing the public-safe build as a Cloudflare Workers Free branch preview. Main, existing GitHub Pages, CNAME and DNS remain outside this approval. Wrangler 4.131.1 is pinned; local build and Wrangler dry-run pass. GitHub Pages was rechecked: main at repository root, olsenautomation.com, built. Cloudflare CLI authentication and hosted validation are in progress.

The branch push completed and was verified at `916d9001af9bc31c494dea918adf10ec0f803277`; remote main remains the recorded baseline. Cloudflare publication is awaiting owner sign-in/authorization, with the official OAuth screen prepared. No Worker/version/preview URL has been created. See `PREVIEW_PUBLICATION.md` for the receipt, prepared artifact and resume steps.
