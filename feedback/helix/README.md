# Helix content feedback

Live direct link: https://olsenautomation.com/feedback/helix/

This folder contains only the blank checklist, public business facts, and code.
Never commit responses, receipt records, screenshots of private answers, credentials,
or actual test-submission identifiers here.

`tools/build_release.py` copies this folder into the production release. The existing
production Worker serves it with no-store/noindex and routes the same-origin
`/api/helix-feedback` endpoint through `src/helix-feedback.js`. Existing production
configuration continues to point at `src/production-worker.js`, so future builds
of this source branch retain the handler automatically. No release is deployed by
the build command. The form is not added to navigation or the sitemap.

Answers travel from the browser through the existing Worker to the existing Google
Apps Script receiver. `src/receivers/helix.gs` validates the full ten-item schema,
stores a private receipt in ScriptProperties, and sends complete human-readable
answers only to fixed `brian@olsenautomation.com`. GET returns readiness only;
there is no public receipt-reading endpoint, and an ID grants no read access.
Project access was restricted to Brian when the authorized deployment was made.
Email/name supplied by a respondent do not authenticate their identity. This is
content feedback, not a contract, payment authorization, or launch approval.

The existing receiver in `src/receivers/intake.gs` stays unchanged because the
existing intake-preservation checks pin its bytes. Run `npm run receiver:helix`
to generate the combined receiver privately under ignored `.migration-local/`.
When editing a live script, supply a copied current Code.gs as the optional
argument and inspect the minimal patch. Keep the existing deployment URL,
AI Visibility/Joe handlers, scopes, execute-as account, and sharing settings.
Updating Apps Script still requires an explicit version update there; a Git
build does not deploy it. Do not accept a new OAuth grant automatically.

Run `node tools/check-helix-feedback.mjs` for simulated receiver/relay checks.
Run the normal `npm run check` and `npm run release:build` before a future release.
Actual inbox/private-receipt proof is retained in the task handoff outside Git.

Mobile QA used a desktop Chrome browser viewport of 390×844, not physical phone
hardware. The production flow was submitted in that emulated viewport and the
actual email arrived in the authorized business inbox.

Storage allows at most 40 receipts and refuses new records once 40 exist or stored
property bytes exceed 400KB. Existing records are retained; there is no deletion
or overwrite of old answers to make room. Exact existing sent receipts can still
return duplicate success when full. The UI shows unconfirmed delivery on refusal,
keeps entered answers visible and offers retry/contact Brian; it does not claim
success. Brian must review/archive storage before capacity. No automatic retention
or expanded storage has been added. A rare send-success/final-marker-write-failure
can resend an email on retry; the reference identifies duplicates.
