# Final candidate preparation — September 17, 2026

Brian approved preparing the annotated launch plan, including migrated intake and actual alert-delivery checks. Final production go-live, DNS/custom-domain changes and a main merge remain unauthorized. This checkpoint supersedes the older preparation-only blockers in LAUNCH_READINESS.md; hosted acceptance is recorded below as it completes.

## Separate build outputs

- `dist`: existing silent branch preview; noindex throughout.
- `dist-production`: local launch artifact, 36 HTML pages (32 public, three direct-link portfolios, one 404). Only public routes enter the sitemap. No specimen pages, development registry, private family guide, handoff, receiver source or migration documents.
- `dist-candidate`: the same page bodies, assets and forms, with candidate mode, noindex headers/meta and robots disallow-all. Ordinary visitors cannot submit intake or send engagement alerts. Canonical metadata retains the eventual production URLs.

`npm run release:build` validates the existing site, builds both release outputs, and checks indexing, body equivalence, unlisted boundaries, expired/unauthorized test access, silent previews and the www redirect. Original source content and inventory hashes remain intact. Nine harmless legacy resources keep their URLs and original bytes. Two unused historical WebPs are truncated in the baseline (10,827/58,528 and 19,348/92,316 actual/declared bytes); they remain unreferenced, unchanged and recoverable. No archive cleanup occurred.

## Delivery testing and publication boundary

`npm run release:upload` only uploads a version of the existing `olsen-automation-v2-preview` Worker, alias `release-candidate`. It refuses dirty/unapproved branches, different targets, routes, active production notifications or an enabled default test window. It never runs `deploy` or changes traffic/domains. The usual `site-redesign-v2` alias remains separately available.

The optional `--owner-delivery-test` enables a token-protected test window lasting at most one hour. Secrets and receipts stay under ignored `.migration-local/release-candidate/`. Only authenticated intake HTML gets production form behavior; all normal candidate pages remain silent. Three fixed synthetic alert types use the same production relay, prefixed SYNTHETIC RELEASE TEST. This staging module is not imported into the production Worker. The final candidate is uploaded with the test window closed. Provider acceptance is not proof of delivery to Brian's phone.

One clearly labeled fictional intake is authorized for this candidate check. Log the attempt before submission; do not retry an uncertain result. The earlier September 15 test covered the old live site and is not reused as candidate evidence.

## Proposed production configuration

`wrangler.production.proposed.json` is review material only. It targets a separate `olsen-automation-v2` Worker with Static Assets, root/www custom domains, no workers.dev URL, no preview URLs, and the approved engagement relay. All requests pass through the Worker so www canonical redirects and dynamic headers apply consistently; this uses Workers Free request/CPU allowances. No paid plan or feature is enabled. Deployment remains a final owner action after the gates in DOMAIN_CUTOVER_PLAN.md.

Production intake permits only the existing Google Apps Script destination and its response frames in CSP. All other forms remain blocked by default; the workshop prepares an email draft and does not silently subscribe or send.

## Acceptance still to complete

Hosted candidate bytes/headers/routes/media, desktop/mobile rendering and interactions; one migrated real-form acknowledgement plus independent mailbox receipt; three synthetic relay provider receipts; physical iPhone/iPad acceptance; complete authoritative DNS export and account access; final owner go-live approval.
