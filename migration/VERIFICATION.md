# Inventory checkpoint verification

- Branch: site-redesign-v2; tag resolves to frozen remote main `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`.
- All 61 baseline paths remain present. All 60 original files other than .gitignore match baseline bytes exactly. .gitignore only adds exclusions for handoff material and local inventory review artifacts.
- CNAME and every existing HTML, CSS, JavaScript, image, PDF, Apps Script, and sitemap file are unchanged.
- Whole-tree Git bundle verification passed at creation. Bundle SHA-256: `d9398edd897dd9e2de1ee3670ccef5cb24708f603f2c72c700465f4a16b471b4`.
- All three inventory utilities reran successfully with identical CSV/summary bytes. Archive proposals survived the rerun unchanged.
- 221 HTML references inventoried; zero unresolved local file/fragment targets. External links and live service responses were not exercised.
- 48 image-file/embedded occurrences inspected; 46 decoded with Pillow, two failed and are explicitly recorded. Nine near-image pairs were visually reviewed in local contact sheets; originals retained.
- `_codex_handoff/approved-pilot/Olsen-Automation-Future-Pilot-v6-Single-File.html` is ignored. No handoff files are tracked.
- Desktop/mobile rendering, keyboard, forms, media playback, reduced motion, and cloud preview acceptance were not run: implementation is paused by owner instruction. No claim of browser acceptance or live delivery is made.
- No clone, additional repository folder, push, merge, deployment, domain/DNS change, account change, or form submission occurred. The required backup is a bundle and manifest in the existing sibling backup directory, not a checkout.
