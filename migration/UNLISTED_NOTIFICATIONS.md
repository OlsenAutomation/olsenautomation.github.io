# Direct-link portfolios and engagement alerts

Brian approved unlisted portfolio access, retained résumé notifications, and added website/class-information visit notifications on September 15, 2026. This resolves the two owner choices from the launch-preparation checkpoint. Final go-live approval remains separate.

## Access

- Keep `/product-photo-production.html`, `/territory-sales-execution.html` and `/visual-ai-evaluation.html` at their exact established paths. Retain their robots metadata; all preview responses, including PDFs/images, also carry HTTP noindex. Omit these pages from navigation, public route registry and the draft production sitemap.
- Links can be forwarded or guessed. These are unlisted professional work samples, not confidential or authenticated pages. Noindex requests search exclusion; it is not an access boundary or a guarantee of removal from existing caches.
- The family guide and its script remain excluded. Do not publish private family content as an unlisted static page. This implementation grants no new account access.
- Two website résumé derivatives correct the obsolete phone to the approved 805 number. Original PDFs and URLs remain preserved. All other extracted text matches; all three PDF pages were rendered and inspected. No home address appears in their extracted content.
- Seven visual-AI JPEG derivatives remove EXIF, Photoshop and ICC metadata with jpegtran; decoded image pixels are identical. Eleven extracted product images and eleven territory images already lacked identifying metadata. The hash/provenance manifest is `src/_data/unlisted-derivatives.json`. No original inventory item moved, changed or disappeared.

## Alert behavior

| Event | Trigger | Repeat suppression |
| --- | --- | --- |
| Website visit | Public or approved portfolio page is visible for eight seconds | Once per browser per 30 minutes across pages |
| Class information viewed | Home `#learn`, or workshop `#learn`, `#workshop`, or `#interest` spends eight seconds within the central viewport | Once per browser per 30 minutes across class sections/pages |
| Resume opened | Trusted click on the résumé link on either corresponding portfolio | Once per résumé per browser per 30 minutes; high priority |

These are best-effort engagement signals, not unique-person counts, verified human identity, completed downloads, confirmed reading, registrations or sales. Hidden tabs/prerendering do not accrue dwell time. Obvious automation, `?no-ping=1`, Do Not Track, Global Privacy Control and the footer opt-out suppress events. If storage is unavailable, per-document deduplication still applies but cannot persist across navigation. Opt-out still works for that document.

The browser sends only an allowlisted event and route to `/api/visit`. The Worker formats a fixed message and relays it to Brian's existing ntfy destination without visitor headers, IP address, query/referral tags, form contents or a visitor identifier. Ordinary hosting infrastructure still processes requests. The legacy public notification script remains preserved in the baseline; its published compatibility entry point loads the shared module without duplicate handlers. The old reference/scroll/device payload is not carried into the broader site alerts.

The shared footer disclosure is collapsed by default and provides a browser opt-out. No cookies, tracking identifiers, analytics database, paid services or new Cloudflare storage products were added. Existing ntfy topics are not treated as confidential channels; notification content is deliberately generic.

## Free limits and preview isolation

ntfy documents a 250-message daily limit and rate limits on its free public service; alerts can be dropped on quota/network failure. The relay adds a 12-per-minute burst ceiling per Worker isolate, not a global quota or anti-bot guarantee. It does not retry failures or switch to paid services. [ntfy publishing limits](https://docs.ntfy.sh/publish/#limitations).

Cloudflare Workers Free includes 100,000 dynamic requests/day; static assets remain on the existing Static Assets path. Only the existing MP4 handling and exact `/api/visit` route run the Worker first. No paid feature was enabled. [Cloudflare limits](https://developers.cloudflare.com/workers/platform/limits/).

Both `data-site-mode="production"` and the existing production hostname are required by the client. The server also requires `VISIT_NOTIFICATIONS=enabled` and the production hostname; the preview configuration explicitly sets `disabled`, and the upload guard enforces it. The endpoint returns `state: disabled` on previews without contacting ntfy. No live notification was sent during this checkpoint; transport tests are mocked. Existing GitHub Pages résumé notifications are untouched.

Before approved production cutover, wire production mode and the enabled variable into the separate production artifact, verify the relay and receipt on Brian's existing subscription, preserve unlisted HTTP noindex, and retest the exact candidate. This is technical release work under the selected policy, not another unresolved privacy choice.

## Validation

`npm run release:review` checks baseline hashes, allowlisted routes and derivatives, private-family exclusions, noindex/navigation/sitemap boundaries, links/downloads, media ranges, intake isolation, and notification behavior. Notification checks cover dwell time, repeat suppression, trusted résumé clicks, hidden tabs, storage failure, opt-out/DNT/GPC, preview gates, payload/origin/path validation, provider failure and burst limiting. No external email or alert is sent by these tests.

All 38 publishable HTML pages were rendered locally at 1440×900 and 390×844: one H1, meaningful main content, privacy disclosure present, preview/noindex intact, no horizontal overflow, no console warnings/errors. Keyboard disclosure operation and opt-out persistence across pages passed. Three PDF pages were visually checked. Raw screenshots and receipts remain ignored in `.migration-local/unlisted-review/`. Physical Safari acceptance and actual new-alert delivery remain later release checks.
