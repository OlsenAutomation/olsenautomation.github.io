# Cloudflare branch preview configuration plan

Status: configuration proposal only. No Cloudflare account was accessed, Worker created, version uploaded, preview published, domain bound, DNS changed, or paid feature enabled. GitHub remains canonical; the current GitHub Pages site stays live. Brian explicitly prohibited push/deploy in this continuation.

`wrangler.preview.json` defines a separate proposed preview Worker and serves only `dist`. It has no main script, bindings, account ID, environment secrets, custom routes or domains. `workers_dev: false` avoids a stable worker endpoint; `preview_urls: true` explicitly allows a future version preview. No Wrangler dependency is installed and this configuration has not been run against Wrangler or a Cloudflare account.

## Proposed later sequence, after authorization to publish a preview

1. Confirm Brian's existing account and Workers Free entitlement; use the existing authorization flow only when authorized. Pin an official Wrangler version at that time and validate the configuration.
2. Build from a reviewed `site-redesign-v2` commit with `npm run check`. Inspect the generated file allowlist and keep all handoff, source, inventory, archive and private material outside the upload.
3. Create/upload only to the separate preview Worker using version upload with a `site-redesign-v2` preview alias. Record commit, version ID and exact returned URL. Do not attach any domain or modify the existing Pages project.
4. Verify HTTP 404 behavior, noindex headers/robots, asset caching/range requests, all preview pages at desktop/mobile sizes, keyboard/reduced motion, and form isolation on that exact URL.
5. Keep production cutover separate. Main merge, production indexing/form activation, custom-domain assignment and DNS remain outside this checkpoint and require the corresponding owner approval.

Cloudflare version preview URLs are public. `noindex` discourages indexing and is not access control. The current build contains 35 public-safe preview pages; four existing noindex pages and their unlisted assets are isolated in `dist-unlisted`, which must not be uploaded. Their eventual production URLs and visibility remain to be verified separately. Any request to expand exposure of private material requires a privacy/access decision; it must not be treated as safe merely because a URL is a preview.

Every preview page has `data-site-mode="preview"`. On a hosted preview, the AI intake creates a downloadable draft only; it never sends to the preserved Google endpoint. The localhost synthetic receiver is not part of the upload. Workshop email preparation remains reviewable and user-initiated. No production CSP exception or real form submission is enabled here.

## Routing and limits

The proposed preview now uses `html_handling: none` and `404-page`. The builder emits three same-site 200 proxy rules from `src/_data/route-aliases.json`: `/` to `/index.html`, `/preview/shell/` to its index file, and `/preview/media/` to its index file. Explicit `.html` URLs remain exact assets rather than being redirected to extensionless URLs. The localhost server uses the same alias source. This configuration change is based on Cloudflare's documented HTML handling and relative-URL proxy support; it has not been validated on Cloudflare. See [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/) and [same-site proxying](https://developers.cloudflare.com/workers/static-assets/redirects/#proxying), rechecked 2026-09-13.

Check both `/` and `/index.html`, legacy `.html` pages, missing routes, query strings, all three aliases and noindex headers on the exact hosted version before accepting the route layer. Production must separately preserve the baseline canonical metadata, activate the appropriate public indexing policy, and serve the retained unlisted URLs with their original visibility. No current live URL is changed here.

The generated build is below the documented Workers Free 20,000-static-file and 25 MiB-per-file limits; the validator enforces those limits. These are size/count checks, not a claim that account entitlement, deployed routing or real-device playback has been verified. No Worker runtime or paid media transformation service is needed for these static derivatives.

Official documentation consulted for this plan:

- [Static site generation routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Advanced HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Version preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

Recheck these documents and the actual account when preview publication is authorized. No owner decision is required to retain this local plan.
