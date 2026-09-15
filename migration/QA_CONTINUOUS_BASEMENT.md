# Continuous basement exit — 2026-09-14

Brian reported that the Whale clips look good and basement navigation appears to work. He requested continuous scrolling after the workbench/text, returning through the room and up the stairs to the CTA, without an intervening exit choice. He also requested removal of the distracting pilot box. His feedback does not identify a device or establish acceptance of this subsequent change.

## Implementation

- The existing ten-second room-to-door clip starts at the workbench, returns through the room and climbs to the door. Continuing to scroll now drives that clip directly, including backward travel. No new footage or media encoding was needed.
- Absolute position within the stair section determines video time; scrolling through preceding text does not consume part of the walk. The final 14% of travel holds the door for the CTA. The optional position slider aligns the document to the same progression.
- Removed the separate Walk upstairs / Go straight to the door decision panel. A small motion disclosure retains keyboard seeking and Skip motion. The CTA appears at the door and focuses the interest form when selected.
- Removed the prominent pilot disclaimer. The first workshop remains explicitly In planning, with scheduling, pricing, privacy and no-reservation language intact. Detailed project evidence remains in a collapsed Workshop background disclosure within the workshop content, instead of a large record appended after the final CTA.
- Motion begins only after visitor scroll/control intent. Reduced motion, data saving, unavailable media and no JavaScript retain the static door and useful content. A failed clip has an explicit retry without blocking the CTA.

## Local verification

- `npm run check` passes: 35 public and four isolated pages, original content/assets, metadata, routes, links, forms/privacy boundaries, all 12 MP4 range tests and buffered-player regressions. A focused geometry test covers first entry, long preceding text, reverse travel, slider alignment and the final reading interval at desktop/mobile/short viewport dimensions.
- Only `/workshop.html` changed among the 35 generated public HTML pages; the other 34 match the prior hosted receipt byte for byte. Shared shell and other rendered pages retain the previously completed 78 desktop/mobile render checks. This change retests the affected page rather than repeating unchanged page screenshots.
- In-app Chromium at 1440×900: entered the room, selected Workbench, scrolled through the workshop text, reached the first stair frame without clicking an exit choice, advanced to 52% and then 100%, and reversed to 75%. Video time followed progression; the CTA was hidden/inert before arrival and visible at the door. End-key scrolling also reached the door. Selecting the final CTA focused First name.
- At 390×844: scrolling advanced to the final door, reverse scrolling returned to 43%, optional keyboard seeking reached 1% at 0.1004 seconds, and Skip motion released the video source and focused the CTA. The complete CTA fit within the viewport without horizontal overflow.
- At 844×390: the final reading position placed the complete CTA between 185 and 366 px, below the 77 px header. Motion controls remained above it without overlap; no horizontal overflow.
- Reduced-motion emulation loaded no video sources and showed the static door without the long scroll section. With JavaScript disabled, the complete content, project background, CTA and direct email remained accessible and no video loaded.
- Blocking the stair MP4 produced the static door, useful CTA and retry. After removing the block, Retry reached readyState 4 and 10 seconds, clearing the error. Browser console inspection returned no errors or warnings. All emulation and blocking overrides were removed after testing.
- Raw screenshots are retained only in ignored `.migration-local/continuous-basement-qa/`. These are Chromium viewport/emulation results; physical Safari/touch acceptance of this revision is not claimed. No email or real form submission was sent.

## Publication boundary

The standing approval covers pushing `site-redesign-v2` and updating the existing public-safe Cloudflare Workers Free branch preview only. Main remains `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`. Originals, frozen inventories, handoff exclusion, private-route isolation, live GitHub Pages, DNS, custom domain and production remain unchanged.

## Hosted receipt

- Pushed source commit: `70e8868a1d95180299304f9bd28d2adf5c6f4391`.
- Uploaded version: `5710c393-e50c-4e2a-a239-a7e655723b79`, using the guarded version-upload command only.
- Existing alias: https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/workshop.html
- Immutable version: https://5710c393-olsen-automation-v2-preview.brian-dbb.workers.dev/workshop.html
- Exactly four public assets changed: workshop HTML, workshop CSS, workshop JavaScript and the new scroll geometry module. The 421 other public files were reused.
- Hosted verification passes for all 425 file hashes, three route aliases, 20 excluded paths, blocked POST (405) and 24 range checks across all 12 MP4s. Machine receipt: ignored `.migration-local/hosted-http-checks.json`.
- At 390×844, hosted keyboard scrolling reached the door, reverse wheel scrolling reached 63% / 6.3358 seconds with the CTA hidden, and forward scrolling returned to 100% / 10 seconds with readyState 4. The complete CTA fit onscreen without horizontal overflow and focused First name when clicked. The pilot box is absent. Screenshot remains local-only.
- Temporary viewport overrides were reset. Remote main was rechecked at the unchanged baseline after publication. No production version deployment, trigger deployment, domain change or real submission occurred.
