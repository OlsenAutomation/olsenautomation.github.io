# Domain cutover and rollback — proposed, not executed

September 17, 2026. GitHub remains canonical. Production must be built from a reviewed commit on `site-redesign-v2`; no main edit or merge is required by this plan. The existing GitHub Pages deployment stays recoverable on main at `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`. Baseline tag `site-v2-baseline-20260912` and `../site-v2-backup/site-v2-baseline.bundle` are already established; do not recreate them.

## Current read-only observations

GitHub Pages: legacy build, main/root, HTTPS enforced, custom domain olsenautomation.com, status built.

| Name | Type | Current value |
| --- | --- | --- |
| apex | NS | ns-cloud-c1/c2/c3/c4.googledomains.com |
| apex | A | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| www | CNAME | olsenautomation.github.io. |
| apex | MX | priority 1 smtp.google.com. |
| apex | TXT | v=spf1 include:_spf.google.com ~all |

Web, mail and SPF TTLs observed: 3600 seconds; NS 21600 seconds. Apex AAAA, CAA, DS and `_dmarc` TXT queries returned no answers. These queries are **not a complete zone export**, and absence of a query result does not authorize removing records. DKIM selectors, verification tokens, other subdomains and registrar DNSSEC settings must come from the current DNS account. Raw timestamped snapshot is ignored locally.

The current Wrangler authorization can upload Workers, but does not grant zone/DNS administration. Safari is at a signed-out Cloudflare profile; no authorization scope was expanded. The current registrar/DNS account and full zone export remain to be confirmed.

## Staged change, after explicit owner approval

1. Capture the complete existing zone, registrar nameservers, DNSSEC/DS state and GitHub Pages settings. Record the reviewed source commit and exact production artifact hashes. Stop for discrepancies or unknown email records.
2. Add/review a Cloudflare **Free** full DNS zone, preserving every existing mail/verification/subdomain record. Keep apex A records and www CNAME pointing to GitHub Pages during DNS onboarding. Do not rely on automatic DNS scanning as a complete export.
3. Present the exact two Cloudflare-assigned nameservers and any DNSSEC transition steps before the owner approves the registrar change. Existing active DNSSEC requires coordinated DS handling; do not disable it speculatively. Keep the old zone in place throughout propagation.
4. Once the Cloudflare zone is active and the old site and email still work, publish the reviewed production Worker and attach its root/www custom domains as the final website cutover. Cloudflare custom domains require an active zone and create DNS/certificates. Existing conflicting records, especially the www CNAME, must be resolved deliberately at this approved step.
5. Verify TLS, root/www redirect, every preserved route/download, real 404 responses, public sitemap/indexing, noindex professional pages, excluded family guide, media ranges and the approved intake/alert behavior. Use `?no-ping=1` on routine browser QA to avoid false engagement events. Any further real messages need a clearly scoped test authorization.
6. Keep main, its CNAME file, the old DNS zone/export and the GitHub Pages configuration available through the acceptance/rollback window. Do not disable GitHub Pages as an incidental cleanup.

## Rollback

- **Candidate failure:** no public-domain change exists to undo. Keep the current GitHub Pages site live; upload a corrected staging version.
- **DNS onboarding failure:** restore the recorded registrar nameservers and corresponding DNSSEC state using the complete export. Propagation follows resolver caches; it is not instantaneous. Preserve both zones until verified.
- **Website cutover failure after Cloudflare DNS is active:** detach the two Worker custom domains, restore the four GitHub Pages apex A records and the original www CNAME from the snapshot, and confirm Pages still has olsenautomation.com/HTTPS enabled. This keeps the functioning Cloudflare DNS zone and mail records in place. Restore registrar nameservers only if the DNS layer itself is at fault.
- **Content-only regression after launch:** upload the previous reviewed production Worker version and deploy that version, retaining DNS. The owner-approved live incident/rollback authority must be explicit; none is inferred here.

Potential outage triggers: missing mail/verification records, conflicting DS records, certificate issuance delays, incomplete nameserver propagation, or adding a custom domain over an existing CNAME. A full zone export and two-stage rollout keep these independently reviewable.

Sources: [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [full DNS setup and record review](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/), [Static Assets headers and Worker responses](https://developers.cloudflare.com/workers/static-assets/headers/).
