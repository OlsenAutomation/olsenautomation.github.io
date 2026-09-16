# Launch preparation — September 15, 2026

Status: this launch-preparation checkpoint is complete on `site-redesign-v2`; production is not ready or authorized. The currently live GitHub Pages site, main branch and domain configuration remain untouched.

## Completed in the metadata checkpoint (historical)

- All 32 public content pages now have a canonical URL, Open Graph and Twitter title/description/image metadata generated from shared sources. Existing authored metadata is preserved. Project imagery retains its evidence label in share-image descriptions; original build photographs are preferred where available.
- Canonical and social URLs target the existing production domain for the later cutover. New media paths are verified inside the build/preview, but are not yet served by the old live site; this is metadata preparation, not a claim that external share-card caches already display the new site.
- All 35 public HTML bodies match the preceding hosted preview byte for byte. No page layout, copy, form, script, video, download or project status changed. The four isolated HTML pages are also unchanged. The established desktop/mobile page checks remain relevant; six additional representative renders at 1440×900 and 390×844 passed, with no overflow, no premature video loading or console errors. Mobile navigation and atlas filtering worked (Hardware & making: six results).
- `npm run release:review` runs the full build/preservation/link/privacy/media suite and prepares a separate 87-route release matrix. It does not create an uploadable production build. The new matrix supplements the frozen inventory instead of recreating it.
- The local draft sitemap contains 32 public canonical URLs. It excludes the four unlisted pages, development specimens and 404. This resolves the original proposal conflict where a noindex product-photo page was listed in the old sitemap, without editing the old sitemap or any live setting.
- The original Apps Script receiver is tested offline with in-memory Google service replacements: valid payload and exact attachment, fixed recipient, duplicate/rate limits, age/size limits, confirmations, credential-field rejection, honeypot, quota rejection and retry following mail failure. No Google endpoint or mailbox was invoked; these tests do not establish deployed receiver identity or actual delivery.
- The existing backup bundle and baseline tag were verified again, without recreating either. Remote main remains `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`.
- Seven external link destinations were checked. Apple, GitHub, both Google help pages and Bing responded successfully. The photography site rejected the automated HTTP check but loaded normally in the browser. LinkedIn restricted automated access (999); it remains unverified rather than classified as broken.

Local evidence: `.migration-local/launch-review/` contains body comparisons, six screenshots/render records, external-link observations, the draft sitemap/robots and a machine-readable readiness report. No local report, handoff material or source transcript is part of `dist`. The subsequent owner-approved portfolio publication is recorded below.

## Production route and privacy decisions

`LAUNCH_ROUTE_REVIEW.csv` accounts for every recorded route plus generated pages and aliases: 74 preview destinations (including approved unlisted resources), one isolated family destination and 12 source-only destinations. These counts include assets and aliases, not just HTML pages. Every row records recoverable bytes and a proposed disposition. No item is deleted, moved or consolidated.

1. **Approved: direct-link professional portfolios.** Brian selected unlisted access for `/product-photo-production.html`, `/territory-sales-execution.html` and `/visual-ai-evaluation.html`, including their two résumés and supporting images. These exact URLs are now included in the preview allowlist with the existing noindex directives and excluded from navigation, the public route registry and the draft sitemap. This is link sharing, not authentication; anyone holding a link can forward it. Originals remain untouched. Website résumé copies use the approved public phone, and seven image copies have metadata removed without changing decoded pixels.
2. **Approved: engagement alerts.** Preserve résumé-click alerts and add site-visit/class-information alerts using the existing ntfy destination. A first-party Worker relay accepts only fixed event/route values; no form data, identifiers, query strings or visitor IP are forwarded. The shared footer provides an opt-out; DNT/GPC are honored. Both client and server gates keep previews silent. Activation and delivery verification belong to the later production release. See `UNLISTED_NOTIFICATIONS.md` for exact event semantics and limits.
3. **Family guide.** Keep `/family-card-chaos-access.html` isolated until the exact production route has verified access control. No private family content may be added to an unprotected static asset directory. Retain the URL and source; do not replace it with a public redirect that exposes private instructions. Preparing the access-controlled destination and account authorization is a separate step after the owner chooses the route policy.

## Real intake test — completed after explicit approval

Purpose: verify the existing AI Visibility intake receiver can acknowledge a synthetic submission and deliver its JSON attachment to the fixed mailbox `brian@olsenautomation.com`.

Use one submission clearly labeled **SITE MIGRATION QA — SYNTHETIC — NOT A CUSTOMER**. Use `https://example.com`, `qa@example.com`, a fictional business and one synthetic target query. No customer details, credentials, home address, payment, actual service request or commercial commitment. The full test fixture remains local at `.migration-local/launch-review/intake-test.json`.

Brian explicitly approved one synthetic test email during this checkpoint. At approximately 17:09 PDT on September 15, the existing live form was submitted once with test ID `20260915-01`. The page displayed its receiver acknowledgement. A separate Gmail search/read confirmed exactly one matching message in the recipient inbox and the 2,735-byte JSON attachment. The attachment contained the fictional contact, one synthetic query, no physical/public address, no credential/customer information and an empty automatic-actions list. The notes explicitly forbid starting a real workflow or engagement. The one-send authorization is consumed; no repeat was made.

Detailed mailbox identifiers, attachment and browser attempt receipt remain only in ignored local evidence. Browser DOM inspection masked the email input values, so the delivered attachment—not those empty readback strings—was used to verify `qa@example.com`. This confirms the existing live form/receiver delivery path; it does not yet validate the future migrated production mode and CSP. Workshop interest remains a user-reviewed mailto draft and does not require a new backend.

## Remaining production preparation

- Build a separate production artifact from the approved branch commit. Keep the approved public metadata and exact legacy `.html` routing. Remove preview-only pages and diagnostic registry files; preserve all approved original resource/download URLs, including held resources according to their disposition.
- Apply indexable headers/robots only to the approved public pages. Preserve exact noindex on retained unlisted HTML and use appropriate noindex headers for its approved downloads. The local sitemap/robots are drafts, not activated settings.
- Use a separate production security-header source in both static responses and the MP4 Worker. The existing Worker intentionally imports preview noindex headers, so copying the preview build to production would be incorrect. Cloudflare does not apply `_headers` to Worker-generated responses; those headers must be set by the Worker itself. [Cloudflare header behavior](https://developers.cloudflare.com/workers/static-assets/headers/).
- Activate the existing intake endpoint only in the separately reviewed production mode, with narrowly scoped Google form/frame CSP allowances and the preserved receiver contract. Keep preview form isolation and the current no-referrer policy. Validate against the actual Google redirect/frame behavior after the authorized synthetic test.
- Retain `html_handling: none` and explicit aliases to avoid changing established `.html` URLs. [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).
- Allow crawling where the production noindex directives need to be read; robots disallow alone does not enforce noindex. Access control, not indexing directives, must protect family information. [Google indexing directives](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).
- Test that exact production candidate on a non-indexable staging host, including public and approved unlisted URLs, 404 status, form acknowledgement/delivery, downloads, keyboard navigation, reduced motion and video seeking. Repeat changed-page desktop/mobile renders; preserve unchanged-page evidence.
- Obtain physical iPhone/iPad Safari acceptance for entry, workbench, natural scroll through text and stairs, final CTA, orientation change, reduced motion and Whale video. Chromium viewport checks and earlier owner feedback do not substitute for this exact-candidate test.

## Cutover and rollback handoff

No executable production deployment command or domain mutation is included in this checkpoint. Before requesting final go-live approval, record the current DNS/Worker routes/Pages source and domain settings read-only, with exact values and timestamp. Prepare the smallest concrete change that routes only the approved domain to the reviewed Worker while preserving unrelated mail and service records. The owner must review that exact change and its inverse; do not guess DNS record IDs, current proxy state or the production Worker identity.

The cutover packet must identify the approved source commit, artifact hashes, Worker version, route/privacy decisions, test receipts, DNS/routing diff and rollback values. Keep the existing GitHub Pages site and its source intact during the reversible cutover. On a regression, restore the captured routing/domain state, verify legacy public and retained direct-link routes, and record the rollback. Main is never edited or merged as part of this work.

Final owner go-live approval remains separate from preview publication, test-email authorization and privacy choices.

## Preview publication receipt

Source commit `476e475a93a69c8e3021b58909362817d1a81c98` is pushed to `site-redesign-v2`. Metadata-only changes to 32 HTML files were uploaded as Worker version `cadfe07a-dee0-4007-9665-5344d744cfec`. The existing branch alias now serves that version; all 425 file hashes, three aliases, 20 excluded paths, blocked POST (405) and 24 ranges across 12 MP4s pass hosted verification. Browser inspection confirms canonical/social metadata, preview mode and noindex remain correct. The other 393 public files were reused unchanged.

Version preview: https://cadfe07a-olsen-automation-v2-preview.brian-dbb.workers.dev/

The real test used the unchanged live intake page under its separate one-email authorization. No production build, main merge, DNS change, custom-domain mutation, telemetry-policy change, unlisted upload or duplicate cleanup occurred. Those choices were pending at that historical checkpoint; Brian subsequently approved the direct-link and notification policies above.

## Subsequent approved privacy checkpoint

The direct-link and alert choices above are implemented in source `76b0719` and branch preview version `9aab3e8f-58c0-4650-b16a-abdc073b0683`. Hosted verification passes for all 461 files, three aliases, 17 exclusions and 24 video ranges; the alert endpoint is confirmed disabled on preview. The exact event policy, derivative provenance, desktop/mobile checks and remaining production activation steps are recorded in `UNLISTED_NOTIFICATIONS.md`. The two privacy decisions are resolved. Production artifact preparation, live relay receipt, production-form validation, physical Safari acceptance and final owner go-live review remain.
