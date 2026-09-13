# Hosted basement usability correction — 2026-09-13

Verified version: `27859d44-20fa-4ed1-bbe8-d2ac5061a735`. Implementation: `16639b74917769bb3c2577e4b8015faac02cf060`. [Branch preview](https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/).

Brian's device feedback identified slow/unclear room scrolling, weak stair control and duplicated basement entry language after the original QA. This correction adds play/pause/replay and three named room stops, keeps staircase controls in the scene, shortens long scroll regions, and fetches each small clip once after intent. The staircase uses an existing MP4 instead of requesting separate frames during movement. The featured workshop card now links to the learning section; that section retains the single featured basement entrance. Original media and frame sequences are preserved.

| Check | Result |
| --- | --- |
| Identity, content and layout | PASS: all 35 public pages at 1440×900 and 390×844 (70 records), correct title/URL, one H1, useful content, no horizontal overflow, broken visible images or unlabeled controls. Short-phone 375×667 workshop checked locally; normal flow keeps the lower actions reachable. |
| Overlays and console | PASS: no framework overlays or relevant warning/error logs in the full hosted page sweep. Deliberate local media blocking is recorded separately. |
| HTTP, metadata, privacy | PASS: 341 served file hashes, three aliases, 17 excluded paths, POST 405, noindex, blocked public form-action, all 16 valid video range cases and eight invalid ranges. Only media-src gains blob: for same-origin downloaded clips; no external connections or private content added. |
| Room interaction | PASS: automatic entry→workbench playback finishes at 100%; Play/Pause/Replay, Entrance/Room/Workbench stops and keyboard end seeking work. Hosted wheel scroll advances 40→59%. Two MP4 fetches total across playback and repeated seeking. 157 + 241 decoded frames, zero drops reported in normal in-app Chromium. |
| Stairs | PASS: walk finishes at 100% with door active; one 802,269-byte MP4 request, zero numbered-frame requests. Reverse seeking, pause and wheel movement (39→63%) work while the panel stays at top 82 px. Direct-door shortcut restores focus to the door link. 241 decoded frames and zero reported drops in normal in-app Chromium. |
| Slower connection | PASS locally at 2 Mbps, 150 ms latency and 4× CPU emulation: entry 3.267 s, workbench 3.920 s (prefetched during entry), stairs 3.472 s. Loading text and skip remain usable. Encoded room/stair buffers total at most 2,516,948 bytes; this is not total browser memory. |
| Fallback and recovery | PASS locally: reduced motion requests no videos, still mode releases buffers, blocked MP4 shows poster and useful status, retry succeeds, no-JavaScript class content/direct email/door link remain. All temporary emulation was removed. |
| Homepage entrance | PASS: one main-content “Enter the basement workshop” link. Flagship card points to #learn. Portal reaches workshop automatically using the smaller clip at 1.5× speed. |
| Physical devices | PENDING for this version. Native Safari retesting was interrupted by app/window focus and a clipboard/navigation timeout. Touch-event injection is not supported by the in-app CDP tool. No actual phone/tablet touch, Safari or memory claim is made. |

Flow: homepage entrance → portal → Enter the room → pause/stops/keyboard/wheel → Walk upstairs → pause/slider/wheel → door shortcut. No form receiver, email or notification was sent. Existing draft-only forms and privacy boundaries remain unchanged.

Validation commands: `npm run check`; `node tools/check-hosted.mjs <exact-version-url>` and branch alias; `wrangler versions view <version> --json`. CUA supplied DOM, viewport screenshots, mouse-wheel input and temporary network/CPU/reduced-motion/no-JS emulation. The Browser plugin is not installed; the available Computer Use browser API handled validation without an external browser dependency.

Evidence: `HOSTED_RENDER_QA.csv` now records this version. Ignored `.migration-local/basement-fix/render.json` and its 70 screenshots preserve the hosted page measurements. The HTTP receipt is `.migration-local/hosted-http-checks.json`. Unit regressions exercise rapid/reverse seek, one-fetch-per-clip behavior, replay, clip handoff, buffer cleanup, failure retry and late-work cancellation. All previous receipts below remain historical evidence; the old Safari pass does not certify this updated implementation.

---

# Previous hosted QA — version 29e16c24, 2026-09-13

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
