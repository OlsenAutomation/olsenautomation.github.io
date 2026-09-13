# Cloudflare branch preview publication

## Authorization and current state — 2026-09-13

Brian approved pushing `site-redesign-v2` and publishing its public-safe build as a Cloudflare Workers Free branch preview. That approval does not authorize main merge, live domain/DNS changes, paid features or publication of unlisted material.

GitHub branch push completed and was read back at `916d9001af9bc31c494dea918adf10ec0f803277`. Main was read back at the unchanged baseline `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`. GitHub Pages still reports `source.branch: main`, root path, `cname: olsenautomation.com`, status `built`. No tag was pushed. A documentation-only follow-up records this receipt.

Cloudflare publication is **pending account authorization**. No Worker, version, hosted preview URL, Cloudflare account plan, or deployed behavior is claimed as verified. Wrangler reports no active authentication; the browser offers the saved `brian@olsenautomation.com` Google sign-in profile. The official Wrangler OAuth flow is prepared for the owner. Its requested scopes are account/user read, Workers write, and Wrangler's required offline access. Credentials and OAuth callback material are not stored in the repository.

## Prepared artifact

- Official Wrangler `4.131.1` pinned in package/lockfile; npm audit reported zero vulnerabilities at installation.
- `npm run check` passes for the full public/unlisted build and preservation/visibility checks.
- Both Wrangler deploy dry-run and versions-upload dry-run pass with `wrangler.preview.json`.
- Upload target: new preview Worker `olsen-automation-v2-preview`, alias `site-redesign-v2`, stable workers.dev endpoint disabled, preview URLs enabled, no domains/routes/bindings/secrets configured.
- Asset directory: `dist` only, 342 files, approximately 23.5 MB. `dist-unlisted`, source, migration documents, original handoff and archives are excluded from that directory.
- Exact local upload file/size/SHA-256 list: `.migration-local/preview-upload-manifest.json` (ignored local evidence).
- Project telemetry disabled through `send_metrics: false` and the correct `WRANGLER_SEND_METRICS=false` setting in the publication wrapper.

## Resume after account authorization

1. Run `npx wrangler whoami` without printing tokens. Confirm the owner account and Workers Free entitlement through the account/dashboard before upload. Do not create a temporary account or enable paid services.
2. Confirm the preview Worker name is unused or belongs to this migration; do not overwrite an unrelated deployment.
3. Run `npm run preview:upload`. Its wrapper requires the approved branch and clean committed state, checks the explicit target/directory, runs validation, and tags the uploaded version with the exact commit.
4. Record the returned Worker/version identity and URL. Verify the exact hosted version: public routes, .html aliases, 404/private exclusions, noindex/CSP, asset range/caching, form draft-only behavior, desktop/mobile layouts and motion/fallback controls.
5. Preserve the existing GitHub Pages source/domain. Report the actual hosted result and remaining physical-device acceptance; no final cutover is implied.
