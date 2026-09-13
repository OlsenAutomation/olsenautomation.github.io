# Cloudflare branch preview configuration

Status: implemented and published with Brian's explicit approval on 2026-09-13. See `PREVIEW_PUBLICATION.md` for the exact version/commit and `QA_HOSTED_PREVIEW.md` for tested behavior. The original proposal has now been exercised against the owner's Workers Free account.

## Current configuration

`wrangler.preview.json` targets only `olsen-automation-v2-preview`. The branch alias is https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/ . Stable workers.dev serving is disabled; version previews are enabled. There are no custom domains, zone routes, secrets or paid services. Wrangler 4.131.1 is pinned and its project telemetry is disabled.

Only `dist` is uploaded as Static Assets: 35 public pages and their allowlisted assets. Four unlisted pages and private assets stay in `dist-unlisted`. Original handoff, source, migration documents, archives, Git metadata and CNAME are excluded. Public preview URLs are not access control; no private material is included. Every preview HTML page has noindex and a preview-only form mode.

`src/worker.js` handles only `/media/*.mp4` before Static Assets, using the sole `ASSETS` binding. It answers single byte-range requests because the initial hosted static-only version returned 200 and could not seek. Its video allowlist comes from the public runtime media manifest, and security headers come from shared `src/_data/preview-headers.json`. The largest current MP4 is 4,121,319 bytes. Pages, images, frame sequences and other matching assets retain direct static routing. MP4 requests use Workers Free's invocation allowance; no plan upgrade is enabled.

## Routing and validation

`html_handling: none` and `not_found_handling: 404-page` preserve explicit .html URLs. Three same-site 200 aliases from `src/_data/route-aliases.json` serve `/`, `/preview/shell/` and `/preview/media/`. Hosted checks verify those aliases, all 340 served file hashes, private/missing-path 404s, noindex/CSP, blocked POST and exact ranges across all eight MP4s.

The AI intake downloads a draft on hosted previews and never posts to the preserved Google receiver. Workshop interest prepares a reviewable email draft, with no automatic sending. Public/private boundaries and the original site's privacy settings remain separate from preview indexing.

## Future updates and production boundary

Use the existing repository and `site-redesign-v2`. Commit and review changes, push only the branch, then run `npm run preview:upload` within the authorized preview scope. The wrapper verifies branch, clean state, target, asset directory, MP4 routing and build checks before uploading a version tagged with the commit. Do not repeat the completed bootstrap. Verify the exact returned version and the alias after each update.

GitHub remains canonical. The current GitHub Pages site still serves main/root at olsenautomation.com. Main merge, production indexing/form activation, retained unlisted-route policy, DNS and custom-domain cutover require their separate owner authorization. Physical iPhone/iPad acceptance and real receiver delivery remain pending; the published preview does not imply go-live readiness.

References checked for implementation: [asset routing and binding](https://developers.cloudflare.com/workers/static-assets/binding/), [headers](https://developers.cloudflare.com/workers/static-assets/headers/), [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [version previews](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/), and [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
