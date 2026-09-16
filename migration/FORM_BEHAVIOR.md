# Forms and privacy behavior

## ai-visibility.html / visibility-intake

Existing guided intake uses required field checks, progress state, a honeypot, authority/no-secrets confirmations, and client-side JSON generation. Submission downloads a JSON backup and constructs a hidden POST form targeting the Google Apps Script receiver in an iframe. Success requires a Google-origin `postMessage` on channel `olsen_ai_visibility_intake` with `ok` and `accepted`; timeout is 20 seconds. The receiver implementation is in `apps-script/Code.gs`. Preserve the exact endpoint in the original source; do not invoke it during QA.

Validation scope: use synthetic data and a locally intercepted receiver only. Test invalid input, downloaded JSON shape, success, rejection, and timeout. Never describe a mocked success as real delivery. Production-origin support and real delivery remain a go-live dependency.

September 15 launch preparation: `tools/check-intake-receiver.mjs` now exercises the exact preserved Apps Script source with in-memory MailApp/CacheService/LockService/Utilities/HtmlService replacements. Fixed recipient, payload attachment, required confirmations, forbidden credential fields, age/size/rate/duplicate limits, honeypot, quota rejection and mail-failure retry pass. No deployed code identity or mailbox delivery is inferred from these offline tests.

Brian subsequently authorized one clearly labeled synthetic real-delivery test. The existing live page was submitted once; receiver acknowledgement and one matching email with a verified 2,735-byte JSON attachment in Brian's inbox were independently confirmed at about 17:09 PDT. No real customer data or automatic-action permission was included. Authorization is consumed; no retry occurred. The migrated production form/CSP remains to be verified separately. Private mailbox receipt details remain ignored locally; see LAUNCH_READINESS.md.

## family-card-chaos-access.html / access-form

Existing form validates an email and constructs a mailto draft; it does not send or store the address. Copy Invite uses Clipboard API with a textarea fallback. Preserve the noindex/nofollow/noarchive/nosnippet directive. The guide is an unlisted public file; the separate game has Cloudflare Access. Do not copy the guide into the public shell preview or exercise email sending.

## application-view-ping.js

Present on territory and visual-AI application pages. Sends ntfy beacons/fetch after visible-time thresholds and résumé clicks; records cooldown in localStorage/sessionStorage. Exits on automation, frames, non-HTTPS, or `?no-ping=1`. Preserve existing behavior and privacy disclosure for later migration; do not load this script into the new shell or trigger notifications during tests. Any change to tracking policy requires an owner privacy decision.

## External links and privacy boundaries

Downloads: two tracked PDF résumés, plus an on-demand intake JSON. PDFs are scoped to existing application pages; no public-preview inclusion. No video files are present in the baseline tree. Eleven inline raster assets exist in the product-photo page. Existing noindex pages are omitted from preview navigation/output. Noindex alone does not restrict access.
