# Local migration QA — 2026-09-13

Environment: Codex in-app Chromium browser, localhost public port 43187 and isolated unlisted port 43189. These checks do not claim physical Safari, deployed Cloudflare behavior, external-link uptime or real message delivery.

## Page coverage

All 35 public-safe pages and four unlisted pages were rendered at 1440×900 and 390×844. `RENDER_QA.csv` records all 78 route/size combinations. Each had one H1 and preview noindex, with zero detected horizontal overflow, broken loaded images or unlabeled controls. Every route had a captured viewport, reviewed through contact sheets; key V6 and repaired layouts were also inspected at full screenshot size. Long legacy body preservation is checked separately by content/anchor validation, not inferred from an above-fold screenshot.

Local evidence is kept in the ignored `.migration-local` directory: `render-migration-checks.json`, `functional-migration-checks.json`, `qa-1440-*.png`, `qa-390-*.png`, original V6 comparison captures, and final room-transition captures. No screenshots of unlisted materials enter the public build.

## Functional checks

| Area | Observed result |
| --- | --- |
| Shared navigation | Mobile menu opens/closes; Escape returns focus to toggle; menu links navigate; no-JavaScript navigation remains visible. |
| Guided tour | Six ordered stops with correct counter/title and heading focus; Back disables at first stop; Finish and Escape restore the start button. |
| Atlas | All six category filters produce matching counts: 26 total, 6 systems, 6 games/learning, 6 hardware, 7 visual/business, 1 education. Expand shows 26; the initial view shows 12. |
| Forward portal | Muted playback starts after link activation; natural end and Skip reach workshop; cancellation restores a visible trigger or mobile menu toggle. |
| Workshop room | No initial MP4 requests. Entry loads after intent; position control reaches workbench at 100%, seeks to 9.9917 of 10.041667 seconds, and shows only active scene copy. |
| Stairs | Keyboard Home displays frame 0, End frame 120; final CTA is enabled at the door; signup focuses first name without reverse playback. |
| Return portal | Cancel restores door-link focus; Skip reaches homepage. |
| Reduced motion | Still views, no MP4/frame requests, motion controls unavailable; direct door/signup path remains usable. |
| No JavaScript | Workshop text, still scene and navigation remain available; direct email fallback explains preparation requirement. Preparation controls start hidden until scripts initialize. |
| Media failure | Blocked video request leaves poster, class information and an explicit retry/still message available. |
| Workshop form | Empty submission focuses required first name; all five synthetic inputs appear in a review dialog and downloaded text. Closing restores preparation-button focus. No email app was opened or message sent. |
| Intake validation | Empty submission focuses business name. Required groups reach 100% after synthetic completion. Permissions, no-secrets confirmations, schema and recipient fields survive JSON generation. |
| Intake accepted | Same-origin local iframe acknowledgement reports local acceptance, explicitly stating nothing was sent. |
| Intake rejected | Local rejection retains the backup download and shows an error; no success claim. |
| Intake timeout | After 20 seconds, backup remains available and delivery is explicitly unconfirmed; retry is enabled. |
| Hosted-preview guard | Tested on the IPv4-mapped loopback hostname outside the local-fixture allowlist: button becomes Download intake draft; draft downloads; zero Google/test-receiver requests. This tests the guard locally, not hosting. |
| Family access | Isolated page validates email and prepares a synthetic mailto link with the correct requested address. Preview does not launch email automatically. |
| Downloads | Workshop text contains all five inputs and reservation boundary; intake JSON contains expected schema, synthetic identity, six always-required approvals, no credentials and honest pending-delivery wording. Existing PDFs remain byte-identical and isolated. |
| Privacy and source preservation | Public routes cannot reach handoff, Git, migration documents, four unlisted pages, application-view code or unlisted assets. All 60 baseline files other than the intentionally extended .gitignore match SHA-256. |
| Metadata and content | Twelve legacy body fragment checks retain all captured content; canonicals/social tags and exact unlisted robots values match. Verification code/public key match. Internal links, fragments, module imports and media hashes resolve. |
| HTTP | All public routes and aliases respond without unwanted redirects; unknown/private paths return 404; POST is rejected except isolated local fixture; video byte ranges return 206 and invalid ranges 416. |

The two downloaded synthetic drafts were inspected in the local Downloads folder. No real form, email, family invitation or application-view notification was sent. Clipboard invite copying and launching external mail applications are not claimed as newly tested.

## Corrections found during review

- Grouped Living Lights and territory-execution hero text before placing imagery beside it; retained all source content.
- Removed intake grid overflow and allowed narrow checkbox labels to wrap.
- Removed an inherited invisible-video rule and inactive intro-copy override that overlapped the workbench heading.
- Positioned mobile room controls between the video and scene copy so they do not cover the scene action.
- Restored visible keyboard focus when a portal is cancelled after the mobile menu closes.
- Replaced workshop outcome certainty with “Learning aims for the first workshop”; added semantic owner-reported labels and a clearly illustrative demo-room caption.
- Guarded hosted-preview forms against real delivery and separated successful acknowledgement from preparation/download.
- Preserved the original application-view script's classic/deferred loading and data attributes; a module conversion would have disabled its `document.currentScript` behavior. The validator now checks original external script attributes, and localhost made no notification request.

Final mobile workbench geometry: room controls end at y=442.875, heading begins at y=463.734, and the scene action begins at y=703.688 in a 390×844 viewport. Only workbench copy is visible. PDF response MIME type is `application/pdf`; existing bytes and noindex headers are preserved on the isolated review server.

## Pending acceptance

Physical iPhone/iPad Safari playback and memory behavior; hosted CSP/HTML aliases/noindex/caching/range behavior; external-link availability; owner-authorized real receiver delivery; final production SEO/sitemap/noindex policy and all retained unlisted URLs. All remain outside a claim of production readiness.
