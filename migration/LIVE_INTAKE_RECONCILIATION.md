# Newer live intake reconciliation — September 20, 2026

The current main commit `7bbb4c7ed7924c6e6a3309dec5eefe6eef723c42` adds three direct-link conversation-page files and updates the shared Apps Script receiver. All three live page assets return 200 and match that commit exactly. This preparation reconciles those changes without merging or changing main, sending a message, or deploying a receiver.

## Preservation and visibility

`src/_data/live-intake-preservation.json` records the commit, exact paths, byte counts and SHA-256 hashes of all four files. The frozen Slice 0–1 inventories remain untouched. Original personalized HTML/JavaScript/CSS are read from pinned canonical Git objects during the local release build, not copied into this branch's working source or a public preview. A shallow checkout must fetch the pinned main history first.

The local production artifact preserves the existing conversation URL, title, description, noindex, form IDs/fields/defaults, questions, business terms, attribution, mail links, public phone, print access, and exact client-side submission JavaScript. Shared includes supply header/footer/navigation, fonts, tokens and buttons. Page-specific layout comes from `src/preserved/conversation.css`. Form tags explicitly use POST so a browser without JavaScript cannot serialize answers into a GET URL; CSP and the Worker reject that unsupported direct submission while the email fallback remains readable.

The route is excluded from both public previews, public navigation, route registry and sitemap. Its production response enforces noindex/noarchive/nosnippet, no-referrer, no-store, exact Google form/frame permissions, and no visitor alerts. Slashless requests redirect to the existing trailing-slash URL; trailing slash and index.html both serve the intake. Missing siblings remain 404 and direct POST returns 405. Link-only visibility remains the existing policy, not authentication. Personalized content is prepared locally for the final launch review; it has not been uploaded.

`src/receivers/intake.gs` is an exact derivative of the newer main receiver. The frozen `apps-script/Code.gs` remains unchanged and is not the receiver to redeploy from this migration. Both intake contracts continue to use the existing endpoint. There is no receiver deployment in this task, and source-level tests do not prove a new real email delivery.

## Verification

The flow under test is: direct-link intake → required-field validation → four questionnaire steps → answer review, plus follow-up validation and readable email/print fallbacks.

| Check | Evidence |
| --- | --- |
| Source/live preservation | Three HTTP 200 files match pinned main; receiver derivative matches its fourth source hash |
| Existing public experience | All 492 served files match the owner-phone-accepted `fad13e0e` candidate exactly; no new preview upload needed |
| Build/privacy/routing | Full release suite passes: 37 local production / 36 public candidate pages; unchanged 32-entry sitemap; intake excluded from public discovery and preview |
| Receiver behavior | In-memory tests cover original intake plus initial-call/follow-up, exact attachment fields, fixed recipient, correlated errors, duplicate receipts, changed-answer rejection, age/size/secret checks, shared quota and mail failure; no real send |
| Page identity/content/overlay | Local browser title and one H1 match intended intake; meaningful content, no blank page or framework overlay |
| Desktop and phone | 1440×900 and 390×844 inspected; additional 320×568 passes without horizontal overflow |
| Interaction/focus | Empty Next focuses reply email; valid fictional local values advance all four steps; review shows those values; empty follow-up focuses its reply email |
| Keyboard, reduced motion, print | Standard buttons and focus work; reduced motion gives auto scrolling; print reveals all four steps and hides site controls |
| No JavaScript | All four steps and email fallback readable; native forms use POST rather than putting answers in URL |
| Console and messages | No unexpected application warnings/errors; external Google form destinations blocked in the temporary QA tab; no form, email or alert sent |

Browser path: Codex Browser/CUA, local-only `http://127.0.0.1:43190`; no external browser-automation fallback. Screenshots, source comparison and console/DNS receipts remain in ignored `.migration-local/cutover-2026-09-20/`. Main, live domain, production traffic, receiver deployment and notification settings are unchanged. The existing phone acceptance covers the unchanged public pages; the additional intake's layout checks are local browser evidence, not a new owner phone test.
