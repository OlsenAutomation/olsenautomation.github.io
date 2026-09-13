# Slices 2–4 validation record

Scope: local generated component previews on `site-redesign-v2`. Browser: Codex in-app Chromium on macOS. These are actual browser checks at resized desktop/mobile dimensions, not physical-device or Safari acceptance. No unchanged legacy page was represented as newly migrated or retested.

## Rendered-page matrix

| Page | 1440×900 | 390×844 | Shared header/footer | Visibility |
|---|---|---|---|---|
| /preview/shell/ | Pass | Pass | Identical generated shared sources | noindex,nofollow,noarchive,nosnippet |
| /preview/media/ | Pass | Pass | Identical generated shared sources | noindex,nofollow,noarchive,nosnippet |
| /404.html | Pass | Pass | Identical generated shared sources | noindex,nofollow,noarchive,nosnippet |

All six captures had one H1, no horizontal overflow and zero failed loaded images. The final door component was additionally reviewed at both dimensions against the supplied V6 desktop/mobile screenshots. Its note and both actions remain within the mobile viewport. Font inheritance and stage sizing were corrected during review. The shell deliberately shows component specimens rather than the V6 homepage composition; the fidelity ledger records this distinction.

Local-only evidence: `.migration-local/render-checks.json`, `shell-1440.png`, `shell-390.png`, `media-1440.png`, `media-390.png`, `404-1440.png`, `404-390.png`, `media-door-desktop.png`, `media-door-mobile.png`, `v6-desktop.png`. These screenshots are excluded from Git and build output.

## Interaction checks

| Check | Observed result |
|---|---|
| Navigation | Mobile menu opens/closes; Escape restores toggle focus; tablet 900px exposes menu; mobile navigation remains visible without JavaScript |
| Keyboard | Visible focus rules; scene range End reaches near clip end; stair range End reaches frame 120 and activates final actions; slider/manual input no longer fights scroll |
| Initial media | Zero MP4/stair-frame requests until motion controls are used; still posters visible |
| Portal | Plays muted after intent; skip stops playback and reaches the room |
| Basement / workbench | Each loads only on its button; both reach readyState 4; seek end observed near 6.5 / 10 seconds respectively |
| Stairs | 121 frames per variant; observed first and last frames, final card activation and bounded neighboring-frame requests |
| Final primary action | Direct jump to interest area with focus on first-name field; no reverse animation |
| Final secondary action | Opens return portal; cancel restores focus; skip navigates back to shared shell |
| Reduced motion | Still views active, motion toggle locked to system preference, no MP4/frame requests, final door actions remain available |
| Failed media | Deliberately blocked entry video produced retry text and preserved the still; network blocking then cleared |
| Form validation | Empty required name prevents draft dialog; valid synthetic name/email/goal opens draft with “Nothing has been sent” |
| Draft download | Local workshop-interest-preview.txt downloaded, 250 bytes, verified synthetic content; no external submission or registration |
| Dialog focus | Escape closes draft; focus returns to the prepare button; return portal also supports cancel |
| Metadata / boundaries | HTML and HTTP noindex, robots disallow all, no production canonical, no inline handlers/scripts, form-action none, no handoff/private/source output |
| Existing downloads/media | Baseline PDF/image/script/page hashes unchanged; no replacement or deletion. Legacy service availability and physical-device playback remain outside this checkpoint |

## Repeatable checks

`npm run check` rebuilds from the source allowlist, validates all generated routes and asset references/fragments, checks shared-shell identity and metadata, verifies every generated media hash, and compares the 60 preserved baseline files against the frozen inventory. It also verifies branch and local handoff exclusion, asset count and individual file-size limits.

The Node checks exercise numeric frame/seek bounds and responsive variant selection, then start an isolated localhost server to test 200/404/405 responses, source/private-route exclusion, noindex/CSP, valid byte-range 206 and invalid-range 416 responses. Browser tests supplement these checks; they are not inferred from build success.

Additional measured checks: eight original handoff media SHA-256 values match; all eight generated MP4s have one silent video stream and faststart ordering; all generated WebP/JPEG images have no EXIF/ICC payload. Existing inventory CSVs show no diff from `ebbbddc`.

Temporary viewport, script-disable, reduced-motion and URL-blocking overrides were restored after testing. The local preview remains available on port 43187.

## Explicit limits

No physical iPhone/iPad Safari, hosted Cloudflare preview, real user form endpoint, external email delivery, live-page migration, DNS or custom-domain behavior was tested. No public project claim or device-tested status is inferred from these results. Full migrated-page QA must be repeated when those pages exist.
