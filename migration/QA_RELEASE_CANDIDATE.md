# Release candidate QA — September 17, 2026

The tested flow is candidate homepage → navigation/project media → basement/workbench → workshop information → stairs/CTA → class email draft, plus one authenticated synthetic migrated-intake submission.

Environment: Cloudflare version preview, Codex browser at 1440×900 and 390×844. Physical iPhone/iPad Safari is still an owner acceptance gate. The candidate's HTML/JS/CSS/media match the proposed production artifact except for mode, indexing/robots and staging headers. The candidate cannot exercise a real custom-domain certificate before domain onboarding.

| Check | Result |
| --- | --- |
| Identity, meaningful page content, no error overlay | Pass, all 36 pages at both widths |
| Console | No relevant errors or warnings during rendered checks and real intake acknowledgement |
| Layout | No settled horizontal overflow; one immediate Visual AI measurement was transient before layout settled, and was checked again at 1425px document / 1440px viewport |
| Images | No failed loaded images on the rendered pages; two unused, already-truncated legacy WebPs remain preserved and unreferenced |
| Keyboard/navigation | Skip link receives first keyboard focus; phone menu opens and Escape closes it |
| Basement/stairs | Entrance and workbench controls work; continued scroll reaches stair video at 10s and final CTA, without an exit-choice prompt |
| Reduced motion | OS preference selects still views, no video plays, workshop content remains available |
| Whale | 12-second actual build clip reached readyState 4 and its 12s end; assembly clip reached readyState 4 and 27.2s/28.9s while playing |
| Class form | Fictional inputs produce the reviewable email dialog; Close works; no email app or send action invoked |
| Migrated intake | One authenticated candidate submission showed success; independent Gmail inbox and 2,590-byte JSON attachment verified |
| Notifications | **Blocked:** visit attempt unavailable, class attempt rejected by ntfy daily quota (HTTP 429), no retry and no résumé send afterward |
| Silent candidate | Ordinary browser `/api/visit` returns disabled; real browser request supplies expected same-origin headers |
| No JavaScript | Homepage heading and 57 links remain available; alerts disabled |
| Preservation | Baseline inventory hashes and original root files unchanged; no moves or cleanup |

All 72 rendering measurements are in RELEASE_RENDER_QA.csv. Original screenshots and private synthetic email/provider receipts stay in ignored `.migration-local/release-candidate/`; no mailbox identifiers or account registration information enter the public repository.

Commands: `npm run release:build`, production Worker `versions upload --dry-run`, and `node tools/check-hosted-release.mjs <immutable-version-url>`. Browser checks used the Computer Use browser DOM, screenshots, viewport control, media preference emulation, keyboard input and visible controls. Temporary emulation and test cookies were cleared. The delivery-test capability is disabled in the final candidate; previous guarded versions expire independently within one hour.

Remaining: physical Safari touch/scroll/seek acceptance, ntfy provider recovery and real phone delivery, Cloudflare zone readiness, and explicit final go-live approval. A provider 429 is not delivery, and the current no-cache relay may miss subscribers that are offline. No paid service or new notification destination was introduced.

Original acceptance candidate: `6356e084-7e77-4541-a766-18c6d9053a34`, from source `31d558e`. Hosted recheck: 466 exact files, 25 excluded routes, 24 MP4 range checks and zero failures. Default test routes return 404. The stable device-review URL is recorded in RELEASE_CANDIDATE.md.

## Compact room controls follow-up

The room control panel now defaults closed: 58px tall at 1440, 390 and 320px widths (expanded phone panel about 215px). Verified opening/closing, room-stop selection, keyboard slider movement, Escape collapse with focus return, and still-view mode hiding controls/stopping videos. No console errors or horizontal overflow. `npm run release:build` passes. Only workshop HTML/CSS/JS changed; earlier whole-site and delivery receipts remain historical evidence, and physical owner acceptance is still pending for this revision.

Published compact-controls candidate: `71783a5b-afe2-46c2-94ab-b515709d0e4b`, source `c9b03eb`. Hosted recheck passes: 466 exact files, 25 exclusions, 24 ranges, disabled alerts and zero failures. Hosted workshop checks at 390×844 and 1440×900 confirm the 58px collapsed bar, expansion, keyboard Escape/focus return and no console errors or overflow. The longest Workbench label also fits within the bar at 320px after allowing it to wrap. No new messages were sent.

## Recording-driven staircase and scroll regression

The earlier 71783a5b release was missing `/assets/media.css`, which workshop HTML still requested. This invalidates the earlier implication that its staircase presentation passed; file-hash and exclusion checks did not test that dependency. The new release check fails on that artifact with “workshop.html requires missing release asset /assets/media.css.” Production now uses the extracted shared `journey.css`; the media specimen loads the same file.

The repaired local candidate shows a 1425×824 staircase stage/video at desktop 1440×900 and a 375×776 stage/video at phone 390×844. Final CTA fits at both sizes and at 844×390 landscape. Browser wheel samples move through intermediate video times in both directions while the stage remains pinned; the door appears at 100 percent. Native page scrolling is unchanged. Controls/slider/skip cancel pending easing; first-name focus and still/reduced-motion access pass. Deterministic 60/120Hz burst/reverse/cancellation checks supplement the existing media buffering tests. An initial local requestAnimationFrame binding error was found during browser testing and corrected before publication. Source recording and raw samples stay local. Physical-device feel remains an owner acceptance check.

Repair publication: `4b6a726d-2b9d-4076-969c-ab6a4c826811`, source `9b7902b`. Hosted 467-file/25-exclusion/24-range verification passes. The served shared stylesheet restores full-stage video (1425×824 desktop, 375×776 phone). Final direct mouse clicks at both sizes focus `first-name`; ordinary locator clicks during responsive repositioning were unreliable and were replaced by clicks at the inspected visible button coordinates. No fresh hosted console errors occurred. The in-app browser does not support raw touch dispatch, so phone dimensions are verified but physical touch feel is not. No new messages were sent.
