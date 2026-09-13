# Cloudflare branch preview publication

## Authorization and current state — 2026-09-13

Brian approved pushing `site-redesign-v2` and publishing its public-safe build as a Cloudflare Workers Free branch preview. That approval does not authorize main merge, live domain/DNS changes, paid features or publication of unlisted material.

GitHub branch push and read-back completed. The published implementation is `3ef1d449aa9ebb7f63e7c9f63f30241ed19b14bf`; later documentation/test-only commits record its QA without changing the published files. Main was read back at the unchanged baseline `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`. GitHub Pages still reports `source.branch: main`, root path, `cname: olsenautomation.com`, status `built`. No tag was pushed.

Cloudflare publication is **complete and hosted QA passed**. Brian authorized Wrangler in Safari with account/user read, `workers_scripts:write`, and background access. The earlier generic Workers write scope failed the version API and was replaced through a second owner authorization. Credentials are encrypted locally with their key in macOS Keychain; no credentials or OAuth callback material are in the repository. The dashboard explicitly reports Free as the current Workers plan.

- Worker: `olsen-automation-v2-preview`.
- Branch alias: https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/
- Exact verified URL: https://29e16c24-olsen-automation-v2-preview.brian-dbb.workers.dev/
- Version: `29e16c24-e5ed-4578-8e94-5d2455b172c0`, created 2026-09-13T19:48:59.843845Z, tag `3ef1d449aa9e`.
- API read-back confirms `enabled: false`, `previews_enabled: true`, and the exact version's source-commit annotation and alias.

Version upload requires an existing Worker. A one-time bootstrap `wrangler deploy --config wrangler.preview.json` created version `9b94a3a4-c741-4059-bcdb-6c21d259e9a7` with no deployment targets. Version `b7880bf4-ff51-41a1-8dc6-e64cf9983f94` then exposed a real media seek failure. The current version above includes the tested MP4 range correction. Those older versions are historical, not the accepted branch preview.

## Published artifact

- Official Wrangler `4.131.1` pinned in package/lockfile; npm audit reported zero vulnerabilities at installation.
- `npm run check` passes for the full public/unlisted build and preservation/visibility checks.
- Both Wrangler deploy dry-run and versions-upload dry-run pass with `wrangler.preview.json`.
- Upload target: preview Worker `olsen-automation-v2-preview`, alias `site-redesign-v2`, stable workers.dev endpoint disabled, preview URLs enabled, no custom domains/routes/secrets. The sole binding is the public `dist` Static Assets collection.
- Asset directory: `dist` only, 342 files, approximately 23.5 MB. `dist-unlisted`, source, migration documents, original handoff and archives are excluded from that directory.
- Exact local upload file/size/SHA-256 list: `.migration-local/preview-upload-manifest.json` (ignored local evidence).
- Project telemetry disabled through `send_metrics: false` and the correct `WRANGLER_SEND_METRICS=false` setting in the publication wrapper.
- A 48.13 KiB Worker bundle handles only MP4 requests for byte-range seeking. It uses the public runtime media manifest and shared preview security headers. It does not access private files or external services. Other matching assets bypass Worker code. MP4 invocations use Workers Free's allowance.
- All 340 served assets (342 directory files minus `_headers` and `_redirects`) match source SHA-256. Full hosted QA and limits are recorded in `QA_HOSTED_PREVIEW.md`.

## Subsequent approved preview updates

1. Confirm the approved branch, commit, account and existing preview Worker. Preserve the Free plan; never use a temporary account or an unrelated deployment.
2. Do not repeat the completed bootstrap. The Worker already exists; subsequent updates use version upload only.
3. Run `npm run preview:upload`. Its wrapper requires the approved branch and clean committed state, checks the explicit target/directory, runs validation, and tags the uploaded version with the exact commit.
4. Record the returned Worker/version identity and URL. Verify the exact hosted version: public routes, .html aliases, 404/private exclusions, noindex/CSP, asset range/caching, form draft-only behavior, desktop/mobile layouts and motion/fallback controls.
5. Preserve the existing GitHub Pages source/domain. Report the actual hosted result and remaining physical-device acceptance; no final cutover is implied.
