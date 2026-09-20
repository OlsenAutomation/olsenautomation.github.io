# Domain cutover and rollback — production launched September 20, 2026

## Execution receipt — September 20

Brian’s **“final approval given”** authorized the prepared nameserver change and root/www production cutover. Squarespace saved the assigned Cloudflare pair at 11:32 AM Pacific. After zone activation and unchanged-mail checks, the production Worker was uploaded and both custom domains attached. Existing CLI credentials lacked zone lookup permissions; authenticated dashboard controls completed domain attachment without expanding credentials. Exactly four legacy apex A records and the www CNAME were replaced; the other four records were preserved.

Final Worker version `2e9d62e4-a39e-42c5-a22e-0c07b262a78b` was deployed at 18:50:31 UTC (11:50:31 AM Pacific), from `4234fab777c1fcd0a98d37c16e40b7bcd63d4caf`. The HTML-only `no-transform` response directive prevents automatic proxy analytics injection; rendered artifacts are unchanged. Both domains have valid HTTPS certificates. All 495 served bytesets, 37 HTML pages, six aliases/redirects, 26 exclusions and video-range checks pass. MX/SPF/DKIM/Domain Connect remain exact. Both public resolvers checked return the Cloudflare target; local/browser DNS caches can still show the legacy site.

See PRODUCTION_LAUNCH.json for evidence hashes and verification limits. Main, its CNAME, GitHub Pages, old registrar-zone values and the local nine-record restore file remain available. No main merge, receiver redeployment, paid feature or real-message test occurred. Notification delivery verification remains deferred. The original preparation observations and instructions below are retained as history; they do not describe the current live state.


Updated September 20, 2026. GitHub remains canonical. Production must be built from a reviewed commit on `site-redesign-v2`; no main edit or merge is required by this plan. The frozen migration baseline is `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`; it is recoverable through the baseline tag/bundle. Main has subsequently advanced; see the September 20 reconciliation note below. Baseline tag `site-v2-baseline-20260912` and `../site-v2-backup/site-v2-baseline.bundle` are already established; do not recreate them.

## September 20 live-branch reconciliation

A read-only fetch verified main at `7bbb4c7ed7924c6e6a3309dec5eefe6eef723c42`. Its three newer intake assets match the live site's bytes exactly. The route and receiver are now reconciled in the local launch build; see LIVE_INTAKE_RECONCILIATION.md. Source hashes pin the four newer files without changing frozen inventories. The personalized page remains excluded from public previews and the sitemap. No receiver deployment, merge or main edit occurred. Refresh main immediately before cutover; if it has advanced, reconcile the new delta before publishing. Do not substitute the older baseline for current live intake behavior.

## Current read-only observations

GitHub Pages: legacy build, main/root, HTTPS enforced, custom domain olsenautomation.com, status built.

| Name | Type | Current value |
| --- | --- | --- |
| apex | NS | ns-cloud-c1/c2/c3/c4.googledomains.com |
| apex | A | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| www | CNAME | olsenautomation.github.io. |
| apex | MX | priority 1 smtp.google.com. |
| apex | TXT | v=spf1 include:_spf.google.com ~all |
| google._domainkey | TXT | Existing Google Workspace RSA public DKIM key, captured exactly in the local DNS snapshot |
| _domainconnect | CNAME | _domainconnect.domains.squarespace.com. |

Web, mail and SPF TTLs observed: 3600 seconds; Domain Connect 14400 seconds; NS 21600 seconds. Apex AAAA, CAA, DS and `_dmarc` TXT queries returned no answers. Initial public queries were not a complete zone export. Brian then opened Squarespace Domains in Safari. Read-only inspection captured all nine configured records (eight custom records plus Domain Connect), including the exact DKIM key; authoritative DNS queries cross-checked that record set. DNSSEC is disabled in the registrar UI. Raw timestamped DNS/table snapshots remain ignored locally. Refresh this record set immediately before cutover.

September 20 refresh: the complete Squarespace UI still has nine records with matching authoritative values, and DNSSEC remains disabled. Its registrar nameservers are still the four names above. GitHub Pages remains built from main/root with the same domain and HTTPS setting. The local restore file is `.migration-local/cutover-2026-09-20/restore-github-pages.zone`, SHA-256 `2fcaf2bbd36d111f3481102e5fbeef0ad8bfcaec968a28ee187113176738f9b5`. It contains the exact nine current records, including the public DKIM key. UI and query receipts are stored beside it. Recheck immediately before any live mutation.

## Approved zone preparation — completed September 20

Brian explicitly answered **“Approve zone preparation only.”** Created the zone on the Free plan in the existing Cloudflare account and staged all nine records, DNS-only, retaining the GitHub Pages web targets and exact Google Workspace records. The zone remains pending; its overview reports no Workers connected. Registrar nameservers, active DNS, live website and email configuration are unchanged. No paid feature, registrar transfer, billing change or account-permission expansion occurred. Wrangler's existing scopes remain user/account read and Workers script write.

| Item | Prepared value |
| --- | --- |
| Cloudflare account | `2dbb4e55d89cba10d0e21ff338e83fd7` |
| Cloudflare zone | `b32cba28fbc2e5b48bba69e73df77cf2` |
| Plan / status | Free / pending registrar nameserver change |
| Assigned nameserver 1 | `andronicus.ns.cloudflare.com` |
| Assigned nameserver 2 | `ara.ns.cloudflare.com` |
| Staged records | Nine; all DNS-only; every name/type/value/priority/TTL matches current authoritative DNS |
| Verification | Twelve query-set comparisons across both assigned nameservers passed at 2026-09-20 16:57 UTC |

Squarespace displays Domain Connect as one hour, while its authoritative DNS reports four hours. The staged record was corrected to 14400 seconds through a one-record BIND import; the final comparison includes that exact TTL. Cloudflare Bot Preference Sync is off so the site's existing robots/indexing policy is not replaced. Default crawl permissions remain unchanged.

The local verification receipt is `.migration-local/cutover-2026-09-20/staged-zone-verification.json`, SHA-256 `6e66075e43560cf4c863dfdec7e544daf9dfba4ee90069b3369f40f76dbd214a`. Complete UI and authoritative-query receipts are alongside it. The exact assigned pair above is ready for final owner review. **Zone preparation does not authorize changing Squarespace nameservers, deploying production, attaching custom domains or switching the website.**

Notification acceptance update, September 17: Brian skipped provider recovery and actual phone-delivery verification as a launch gate. Existing alert policy/settings remain approved; delivery is unverified. This deferral does not authorize another message or change the DNS/go-live approval boundary.

## Staged change, after explicit owner approval

1. Capture the complete existing zone, registrar nameservers, DNSSEC/DS state and GitHub Pages settings. Record the reviewed source commit and exact production artifact hashes. Stop for discrepancies or unknown email records.
2. The Cloudflare **Free** full zone and nine DNS-only records are already staged; do not create another zone. Recompare them with a fresh complete Squarespace snapshot. Keep apex A records and www CNAME pointing to GitHub Pages during DNS onboarding. Do not rely on automatic DNS scanning as a captured record set. No paid features, registrar transfer or speculative security-policy changes.
3. Present the exact two Cloudflare-assigned nameservers and any DNSSEC transition steps before the owner approves the registrar change. Existing active DNSSEC requires coordinated DS handling; do not disable it speculatively. Keep the old zone in place throughout propagation.
4. Once the Cloudflare zone is active and authoritative DNS, the old site and mail records still match, publish the reviewed production Worker and attach its root/www custom domains as the final website cutover. Cloudflare custom domains require an active zone and create DNS/certificates. The existing www CNAME must be removed only at this approved step, immediately before attaching www; preserve its exact restore value. Let the approved root custom-domain operation replace the web records deliberately. Never alter MX, SPF, DKIM or Domain Connect. Verify certificates for both hostnames before declaring launch complete. Do not redeploy the Apps Script receiver: its current endpoint and newer contract are retained.
5. Verify TLS, root/www redirect, every preserved route/download, real 404 responses, public sitemap/indexing, noindex professional pages, excluded family guide, media ranges and the approved intake/alert behavior. Use `?no-ping=1` on routine browser QA to avoid false engagement events. Any further real messages need a clearly scoped test authorization.
6. Keep main, its CNAME file, the old DNS zone/export and the GitHub Pages configuration available through the acceptance/rollback window. Do not disable GitHub Pages as an incidental cleanup.

The production artifact contains 37 HTML pages: 32 public pages, three existing unlisted portfolios, the preserved unlisted conversation intake, and a 404 page. The public candidate remains 36 pages and contains no personalized client intake. The 32-entry sitemap is unchanged. All 492 served files of the phone-accepted public candidate match exactly; its approval remains applicable. The additional intake has separate local desktop/phone and offline form checks.

Before execution, record the exact reviewed branch commit, current main commit, local production manifest hash and Cloudflare account/zone IDs. A shallow checkout must fetch the pinned main history so `tools/live_intake.py` can reproduce the preserved route. Rebuild and validate before uploading. This plan does not itself authorize a production upload or deployment.

Current implementation commit: `eff361ce00ed2a2d34185eb195ae0a1bb3acb08f`. Local production contains 497 files including the two platform control files. Its sorted, compact JSON path-to-SHA256 map hashes to `27a339ad0f4baa1c5a22ae66434685a3f12209225f77e77e75febec0dc95efe9`; the public candidate map remains `e9e3ec2fb356919ab4193c93fb8d000bbdcf5b0764e1560aeb47909041e41509`. The subsequent preparation receipt only clarifies tag/commit metadata and documentation. Keep the original hosted candidate/source provenance in RELEASE_ACCEPTANCE.json; do not relabel the accepted preview as this unpublished production artifact.

## Cutover verification and stop conditions

- Before nameservers change: compare all nine staged records by name/type/value/TTL, confirm mail records stay DNS-only, and verify no parent DS record. Keep the old zone available.
- After nameservers change: query the two assigned authoritative servers and public resolvers; confirm old website TLS/body, www behavior and unchanged MX/SPF/DKIM. Do not continue while results disagree. No test email is needed for these read-only checks.
- After website attachment: verify root HTTPS 200, www 301 with path/query preserved, all public/unlisted route statuses, the direct-link intake's slash/index aliases, 404s, CSP, noindex and sitemap exclusions, and media ranges. Use read-only HTTP and `?no-ping=1` for browser checks. Do not send forms or resume notification tests.
- Roll back immediately under separately granted incident authority for persistent TLS/routing failures, missing client or public routes, privacy/indexing exposure, or changed mail records. Never declare success from an accepted deployment alone. If incident authority was not granted with go-live, present the exact rollback for Brian to approve.

## Rollback

- **Candidate failure:** no public-domain change exists to undo. Keep the current GitHub Pages site live; upload a corrected staging version.
- **DNS onboarding failure:** restore the recorded registrar nameservers and corresponding DNSSEC state using the captured record set. Propagation follows resolver caches; it is not instantaneous. Preserve both zones until verified.
- **Website cutover failure after Cloudflare DNS is active:** detach the two Worker custom domains, restore the four GitHub Pages apex A records and the original www CNAME from the snapshot, and confirm Pages still has olsenautomation.com/HTTPS enabled. This keeps the functioning Cloudflare DNS zone and mail records in place. Restore registrar nameservers only if the DNS layer itself is at fault.
- **Content-only regression after launch:** upload the previous reviewed production Worker version and deploy that version, retaining DNS. The owner-approved live incident/rollback authority must be explicit; none is inferred here.

Potential outage triggers: missing mail/verification records, conflicting DS records, certificate issuance delays, incomplete nameserver propagation, or adding a custom domain over an existing CNAME. A full zone export and two-stage rollout keep these independently reviewable.

Sources: [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [full DNS setup and record review](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/), [Static Assets headers and Worker responses](https://developers.cloudflare.com/workers/static-assets/headers/).
