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

## September 17 acceptance results

- Candidate source `31d558e`; final silent version `6356e084-7e77-4541-a766-18c6d9053a34`. Temporary delivery tests used earlier guarded versions. The final version has `RELEASE_QA_EXPIRES=0`; both test routes return 404.
- Hosted validation passes: 466 exact files, root alias, 25 excluded routes, blocked POST, disabled ordinary alerts, 24 correct MP4 prefix/suffix ranges plus invalid-range rejection.
- One migrated intake submission, test `20260917-01`, received the real Google acknowledgement. Independent Gmail verification confirms one matching inbox message and its 2,590-byte JSON attachment, with fictional details, empty public address and no automatic-action permissions. No retry occurred. Raw receipts remain local.
- Notification delivery is **blocked**: one website test returned unavailable; the subsequent class test confirmed ntfy HTTP 429, daily message quota reached. Neither has a delivery receipt. The résumé test was not sent after the quota rejection. Do not infer real-device delivery from offline relay tests. No paid upgrade, alternate identity, quota bypass, or repeated send was attempted.
- Squarespace read-only inspection captured all nine configured DNS records, including Google Workspace MX/SPF/DKIM and Domain Connect, and verified DNSSEC disabled. Nothing was changed.

Provider behavior: [ntfy limits](https://docs.ntfy.sh/publish/#limitations) and [message caching](https://docs.ntfy.sh/publish/#message-caching). The current no-cache relay delivers only to connected subscribers and may miss reconnecting clients; actual phone acceptance remains necessary.

## Acceptance still to complete

Brian accepted the current candidate after checking it on his phone on September 20. Remaining: reconcile newer live-branch intake-route/shared-receiver changes, confirm Cloudflare zone/account readiness with assigned nameservers, and obtain final owner go-live approval. Brian deferred notification provider recovery and actual phone-delivery verification on September 17; they are no longer launch blockers. Prior unsuccessful test results remain historical evidence, and actual notification delivery is still unverified. Existing notification policy/settings remain unchanged. The existing GitHub Pages site remains live.

Stable device-review URL: https://fad13e0e-olsen-automation-v2-preview.brian-dbb.workers.dev/

Moving candidate alias: https://release-candidate-olsen-automation-v2-preview.brian-dbb.workers.dev/

The original acceptance-version recheck confirms the two specimen-only media assets return 404, ordinary alerts remain disabled, all 466 served files match local bytes, and all 12 MP4s retain correct range behavior. Both Whale clips decoded and played in the browser. Page bodies did not change between the 72 rendering measurements and this final upload. GitHub Pages still serves the unchanged live site from main/root with HTTPS enforced.

## Compact controls revision

Brian requested minimizing the basement panel. Current device-review candidate `71783a5b-afe2-46c2-94ab-b515709d0e4b` comes from source `c9b03eb` and starts with a 58px bar containing chapter, play/pause and an expandable Controls button. Room stops, scrubber and skip link remain available. Only workshop HTML/CSS/JS changed from the prior acceptance artifact. Local 1440/390/320px checks and hosted 1440/390px checks pass, including keyboard focus and the longest label on narrow phones. The 72-page render report and real-delivery receipts above describe the earlier acceptance version; this focused revision has its own workshop recheck. Hosted validation again passes all 466 files, 25 exclusions and 24 range checks. Candidate alerts remain disabled and no new messages were sent. Main, production traffic and DNS are unchanged.

## Staircase presentation and scroll repair

Current candidate `4b6a726d-2b9d-4076-969c-ab6a4c826811` from `9b7902b` supersedes the compact-controls version. The removed media stylesheet was still a workshop dependency; the earlier checks missed the resulting small video/unformatted CTA. Its reusable rules now live in shared `journey.css`, which is present in the release, while specimen files remain excluded. Release validation now checks linked scripts/styles after exclusions and reproduced this exact failure before repair.

Wheel gestures now ease the video toward accumulated destinations, including reverse travel, with cancellation for explicit controls, visibility changes, errors and still views. Hosted desktop 1440×900 and phone 390×844 show the video covering the stage and a fully visible CTA. Forward/reverse sampling, direct-click signup focus, local landscape, keyboard and reduced-motion checks pass; physical touch remains unverified. Hosted verification: 467 exact files, 25 exclusions, 24 correct video ranges, disabled alerts and no failures. No new messages, production deployment, main merge or DNS changes occurred.

## Whale v0.5 content and media revision

The current silent candidate is `15f7eccf-e775-4b39-9f04-9b89ce1513b0`, built from `14ba196` after adding reviewed media in `441ec57`. It updates the home/atlas cards, Whale record and workshop proof with September 16 v0.5 material. Five new image masters produce 20 responsive derivatives; a 16-second portrait mechanism excerpt has two variants and posters. Earlier media is retained unchanged. The AI-cleaned presentation is disclosed and paired with original build/detail images. Slicer estimates, owner-reported spacing/glue adjustments and unverified repeatable assembly remain distinct.

Eight local desktop/phone renders pass for the four affected pages. Hosted verification passes all 491 files, 25 exclusions and 28 media range checks. The hosted phone clip advances with readyState 4, and workshop proof loads the current original photo. Notifications and the test window remain disabled. The earlier 72-page report, real intake receipt and remaining launch gates are historical acceptance evidence, not rerun or reauthorized by this content refresh. No real messages, production traffic, main or DNS change occurred.

## Direct-entry, scroll-only revision — September 20

Current silent candidate `fad13e0e-302a-4b9e-8aa0-7eefa1f69ca4` is built from `a4eee2b`. The workshop opens directly, without a vortex, second entry gate, automatic walking or room/stair control panels. Native scrolling drives both scenes; workshop text continues into the return upstairs and final invitation. The extra Whale quote/explanation is removed while the full project record remains linked. All original/reference media remains preserved.

All 36 candidate pages pass desktop/phone renders (72 records). Additional short-phone/landscape, rapid/reverse gesture, slow decoder, keyboard, idle, reduced-motion, no-JavaScript and failed-video checks pass. Hosted verification passes 492 exact files, 25 exclusions and 28 video ranges. The hosted phone scene remains paused while scrolling advances it; the final invitation appears at the door and signup focuses the form. Notifications remain disabled on the candidate, with delivery testing deferred by owner.

Brian subsequently reported, “just checked it on my phone. it looks good,” for this exact candidate on September 20. Record this as owner phone acceptance and close its device-review gate. Phone model/browser were not specified and iPad review was not reported; this is not independent Safari verification or final go-live approval.

The read-only remote check found main has advanced to `7bbb4c7` with additional intake-route/shared-receiver changes. Reconcile these against the release before domain cutover; the baseline snapshot alone is no longer the complete current live content. This UI update did not merge, alter or overwrite main. See QA_SCROLL_ONLY_BASEMENT.md and RELEASE_ACCEPTANCE.json.
