# Shared shell and V6 fidelity contract

Approved reference: local `_codex_handoff/approved-pilot/Olsen-Automation-Future-Pilot-v6-Single-File.html`, its QA report and two final-CTA screenshots. The pilot is never an output route. An exact localhost-only reference endpoint reads it in place for comparison; it is absent from dist.

## Shared sources

- `src/_data/site.json`: identity, public contact, navigation and footer links.
- `src/_data/statuses.json`: all eight owner-approved project classes, with explicit definitions; no project claims inferred.
- `src/_includes/layout.html`, `header.html`, `footer.html`: shared page structure; rendered once per page by the builder.
- `src/styles/tokens.css`: V6's ink/midnight, cyan, ember, gold, surfaces, lines, shadow, font stacks, 1220px width and 76/68px header tokens.
- `src/styles/shell.css`: navigation, focus, footer, mobile/no-JavaScript behavior and reduced motion.
- `src/styles/components.css`: common type scale, buttons, statuses, form fields and component examples.
- `src/styles/media.css`: workshop-only cinematic scene/door variant. The final CTA keeps V6's workshop sans-serif stack rather than inheriting the normal-page Avenir stack.

## Intentional scope decisions

The shell preview is a component specimen, not Slice 5's homepage. Its two-column reference image, review labels, explanatory text and component sections are deliberate review content. No guided homepage tour, atlas content, case studies or legacy page migration is included. The stance, header labels, brand treatment, color tokens, button geometry, footer and final-door wording come from V6.

Navigation retains V6's labels. Existing live destinations remain on the existing site: Selected work/Project atlas use #work; Process uses #approach; About temporarily uses #contact because no #about anchor exists in the baseline. Learn AI opens only the local media specimen. Production routes remain a later decision; no invented dead links or private routes are exposed.

The compact menu opens at 1040px, fixing V6's 761–1040px interval where ordinary navigation links were hidden without a menu toggle. Escape restores toggle focus; links remain accessible without JavaScript. Normal pages use no parallax at this checkpoint. Cinematic motion remains in the workshop specimen and is loaded on explicit intent.

## Fidelity review ledger

| Comparison | V6 evidence | Implementation and verification |
|---|---|---|
| Palette | V6 :root #050b10, #020609, #5fe4ef, #ff7a45, #f0c978 | Exact values in tokens.css; desktop/mobile screenshot review |
| Brand and navigation | OA mark, offset amber outline, Avenir copy, pill CTA | Shared header with same geometry, labels and gradients; corrected tablet menu boundary |
| Typography | Normal Avenir/system stack, tight display tracking; workshop Inter/system stack | Separate shared tokens for normal and workshop contexts; matched door hierarchy after fixing font inheritance |
| Buttons | 14px/4px cut corners; cyan primary | Same common geometry and focus ring; final door retains rounded cyan/lilac CTA and diagonal secondary arrow |
| Final copy | “The door is right ahead.”, interest CTA, secondary door action, no-payment note | Wording retained; primary direct focus, secondary portal with skip/cancel; no registration backend |
| Image treatment | Supplied hero and door/stair frames | Metadata-free derivatives of supplied sources; no invented graphics; mobile framing and overlays reviewed |
| Responsive behavior | 1440×900 and 390×844 QA references | Both preview pages and generated 404 checked at both dimensions; no horizontal overflow |
| Motion/focus | V6 direct interest jump, frame-based stairs | Direct instant jump/focus; 121 frames; keyboard slider does not fight scroll; reduced motion issues no motion requests |

Above-the-fold copy comparison: exact approved stance and header labels preserved. Specimen title/descriptive copy is intentionally different from homepage marketing text; no claim of a full-homepage pixel match. Within this checkpoint scope, shared primitives and the final CTA were visually checked against V6, including `view_image` on reference and current renders. Local screenshot evidence remains excluded from Git under `.migration-local/`.
