# Hosted branch preview QA — 2026-09-13

Verified version: `29e16c24-e5ed-4578-8e94-5d2455b172c0`, implementation commit `3ef1d449aa9ebb7f63e7c9f63f30241ed19b14bf`.

Review: https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/

The flow under test was: homepage → guided tour/project atlas → workshop portal → room and stairs → reviewable interest draft; AI intake → local draft download with no hosted delivery.

## Findings and repair

The first preview returned HTTP 200 for valid and invalid Range requests. Chromium showed a zero-length seekable interval and the workbench remained at time zero. An MP4-only Worker now returns exact byte ranges from the public Static Assets binding. Public pages and all other asset hashes remain unchanged. Prefix and suffix responses for all eight videos match the original bytes; unsatisfiable requests return 416. Room seeking reaches 9.9917 of 10.041667 seconds at desktop and mobile sizes. Native macOS Safari also displayed the final workbench frame at slider value 100.

## Checks

| Check | Result and evidence |
| --- | --- |
| Page identity and content | PASS: all 35 public pages at 1440×900 and 390×844; correct title, one H1, nonempty main content, correct URL. 70 records in `HOSTED_RENDER_QA.csv`. |
| Responsive layout | PASS: no detected horizontal overflow, broken visible images or unlabeled form controls. Viewport captures saved for every route/size; homepage and workbench reviewed in full. |
| Overlay and console health | PASS: no framework error overlays; browser warning/error log empty after the full route sweep. The deliberate MP4-blocking test is isolated from that result. |
| Exact artifact | PASS: all 340 served assets match local SHA-256. `_headers` and `_redirects` are configuration files and are not served. |
| Routes and visibility | PASS: three explicit aliases, original .html routes, 17 private/source/unknown/extensionless paths returning 404, POST returning 405. Four unlisted pages remain outside the upload. |
| Metadata and headers | PASS: delivered HTML matches reviewed canonical/social/robots metadata; HTTP noindex and CSP `form-action 'none'` are present. Main-site indexing was not activated. |
| Range and cache | PASS: 16 prefix/suffix checks over all eight MP4s plus eight invalid-range checks. Media cache control is public, max-age=86400. |
| Navigation and tour | PASS: mobile menu opens/closes with Escape focus restoration; all six tour stops update title/counter and heading focus; Finish returns focus to the start button. |
| Project filters | PASS: 12 initially visible of 26; category counts 6/6/6/7/1. Labels remain explicit about project status and evidence. |
| Portals and stairs | PASS: muted playback after intent; cancel restores visible trigger focus; forward Skip reaches workshop and return Skip reaches homepage; staircase reaches frame 120 and signup focuses first name. |
| Workshop draft | PASS: all five synthetic values appear in the review dialog and downloaded text. Status says nothing was sent. No mail application or real message was launched. |
| Intake draft | PASS: empty submission focuses business name, required groups reach 100%, draft JSON downloads, and visible status says nothing was sent. Network events recorded no external or test-receiver request. |
| Reduced motion | PASS: still mode, disabled motion control, no MP4 or numbered-frame requests. |
| Media failure | PASS: intentionally blocked MP4 leaves poster and class information visible with an explicit unavailable message. |
| No JavaScript | PASS: workshop heading/content, navigation links and direct-email explanation remain; preparation button stays hidden. |
| Safari spot check | PASS: real macOS Safari loaded the exact version, entered the room and displayed the final workbench frame after native slider interaction. This was not an all-page Safari matrix. |

Commands: `npm run check`, Wrangler dry-run/version upload, `node tools/check-hosted.mjs <exact-version-url>`. Browser tests used Computer Use's in-app Chromium controls (navigation, DOM inspection, screenshots, viewport and temporary CDP emulation); Safari account authorization and spot checking used native Computer Use. No external Playwright process or browser installation was needed. Temporary emulation and viewport overrides were reset.

Local ignored evidence: `.migration-local/hosted-http-checks.json`, `hosted-http-initial.json`, `hosted-render-checks.json`, `hosted-functional-checks.json`, `cloudflare-publication-receipt.json`, `hosted-1440-*.png`, `hosted-390-*.png`, `hosted-mobile-workbench.png`, and `hosted-safari-workbench.png`. Synthetic Downloads files were inspected: the 327-byte workshop text and 2,471-byte intake JSON contain only test values. No screenshot or draft is included in the public build.

## Remaining acceptance

Physical iPhone/iPad Safari playback, memory and touch behavior; real receiver delivery; external-link availability; production SEO and retained unlisted-route policy; final owner approval before main/domain/DNS cutover. No production-readiness, real message delivery, workshop reservation or paid feature is implied by this preview.
