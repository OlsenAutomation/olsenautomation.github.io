# Cloudflare branch preview configuration plan

Status: configuration proposal only. No Cloudflare account was accessed, Worker created, version uploaded, preview published, domain bound, DNS changed, or paid feature enabled. GitHub remains canonical; the current GitHub Pages site stays live. Brian explicitly prohibited push/deploy in this continuation.

`wrangler.preview.json` defines a separate proposed preview Worker and serves only `dist`. It has no main script, bindings, account ID, environment secrets, custom routes or domains. `workers_dev: false` avoids a stable worker endpoint; `preview_urls: true` explicitly allows a future version preview. No Wrangler dependency is installed and this configuration has not been run against Wrangler or a Cloudflare account.

## Proposed later sequence, after authorization to publish a preview

1. Confirm Brian's existing account and Workers Free entitlement; use the existing authorization flow only when authorized. Pin an official Wrangler version at that time and validate the configuration.
2. Build from a reviewed `site-redesign-v2` commit with `npm run check`. Inspect the generated file allowlist and keep all handoff, source, inventory, archive and private material outside the upload.
3. Create/upload only to the separate preview Worker using version upload with a `site-redesign-v2` preview alias. Record commit, version ID and exact returned URL. Do not attach any domain or modify the existing Pages project.
4. Verify HTTP 404 behavior, noindex headers/robots, asset caching/range requests, all preview pages at desktop/mobile sizes, keyboard/reduced motion, and form isolation on that exact URL.
5. Keep production cutover separate. Main merge, public-page migration, custom-domain assignment and DNS remain outside this checkpoint and require the corresponding owner approval.

Cloudflare version preview URLs are public. `noindex` discourages indexing and is not access control. This build therefore contains only the reviewed public-safe component specimens. Any future request to include private material requires an actual privacy/access decision before upload; it must not be treated as safe merely because a URL is a preview.

## Routing and limits

The preview uses `auto-trailing-slash` for its two directory-index routes and `404-page` for unknown paths. Production must not blindly reuse this setting: Cloudflare's automatic HTML handling can redirect existing `.html` URLs. A later production route layer must implement `ROUTE_MAP.csv`, preserve `.html` responses where needed (evaluate `html_handling: none` plus explicit index/alias handling), and preserve noindex/private boundaries. No existing public URL is changed here.

The generated build is below the documented Workers Free 20,000-static-file and 25 MiB-per-file limits; the validator enforces those limits. These are size/count checks, not a claim that account entitlement, deployed routing or real-device playback has been verified. No Worker runtime or paid media transformation service is needed for these static derivatives.

Official documentation consulted for this plan:

- [Static site generation routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Advanced HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Version preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

Recheck these documents and the actual account when preview publication is authorized. No owner decision is required to retain this local plan.
