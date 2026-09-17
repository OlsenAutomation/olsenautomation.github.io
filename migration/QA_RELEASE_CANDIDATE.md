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

Final immutable candidate: `6356e084-7e77-4541-a766-18c6d9053a34`, from source `31d558e`. Hosted recheck: 466 exact files, 25 excluded routes, 24 MP4 range checks and zero failures. Default test routes return 404. The stable device-review URL is recorded in RELEASE_CANDIDATE.md.
