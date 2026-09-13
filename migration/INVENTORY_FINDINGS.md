# Repository inventory checkpoint

Scope: frozen remote main `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`. This is the existing public repository, not the future V6 handoff or any private project repository. Brian narrowed this turn to backup, rollback, inventories, attribution, and duplicate analysis. No visual implementation, site generator, media pipeline, or deployment work has begun.

## Inventory findings

- 61 tracked files, 14 HTML pages, 14,761,940 bytes total (~14.1 MiB).
- 37 image files and 11 embedded image occurrences. The embedded images total 2,090,487 decoded bytes; the product-photo HTML is about 2.8 MB.
- 221 HTML link/media/form references. All inventoried local file and fragment targets exist. This checks resolution, not successful media decoding, external service availability, or browser behavior.
- Two forms: AI Visibility creates a JSON backup and posts to Apps Script; Family Card Chaos prepares a mailto draft. No form was submitted.
- Two tracked PDF résumés and one generated JSON download. No video, poster, portal, basement, workbench, or stair-sequence source media was identified in the baseline. Approved V6 arrives later as local-only material.
- 20 inline style/script blocks, plus the separate application-view script. The reference inventory includes CSS resources, literal URLs, and browser behavior hooks. Dynamic template URLs are not claimed as fully resolved links.
- Four noindex pages: family-card-chaos-access, product-photo-production, territory-sales-execution, and visual-ai-evaluation. Exact directives are preserved in the metadata/content inventory.
- Existing conflict: product-photo-production is noindex but is in the sitemap and publicly linked. This inventory preserves that fact; later migration must retain noindex and reconcile discovery intentionally.
- The baseline uses the old phone number in 11 pages. The new number is already owner-approved; corrections await live-page migration, as requested.
- Seven decodable image files contain EXIF; no GPS tag was found in the 46 decodable file/embedded image occurrences. This is a metadata check, not a guarantee about visual location information or PDFs. Originals remain untouched.
- Two existing WebP assets fail Pillow decoding: `jack-daniels-coca-cola-holiday.webp` and `spirits-rtd-sprite.webp`. Both have WebP headers but no HTML references. Their hashes and errors are recorded; no repair or deletion was attempted.

## Duplicate report

- SHA-256 over all 61 tracked files: no byte-identical whole-file duplicates.
- SHA-256 over all 48 image-file/embedded occurrences: no exact image duplicates.
- One identical CSS block occurs on six pages (404, Cassette, Contact, Docs, Support, Verify). Five duplicate occurrences are recorded with `404.html:L8` as the reference canonical block. This is an extraction candidate for the future shared shell, not a claim that 404 is the final design source.
- Visible page text comparison: no pairs met a 0.60 token-sequence similarity threshold. This does not rule out repeated individual paragraphs or navigation.
- Perceptual image comparison: nine pairs at difference-hash distance <= 8. Visual review confirmed the three ARC//FORGE pairs depict intentionally different light states; retain all three frames. Six pairs compare the same portfolio subject/composition in embedded and external encodings; hashes differ. Retain both forms until future quality/resolution comparison and URL-safe extraction.
- No assets, pages, or code were consolidated. Canonical records are proposals only.

## Proposed archive actions

`ARCHIVE_MANIFEST.csv` records four candidates with baseline hashes: the two undecodable/unreferenced WebPs, the Living Lights placeholder text file, and unlinked root styles.css. Every row is PROPOSED ONLY. No files moved or deleted. Other unreferenced photos remain potential public evidence and are retained; lack of an HTML reference alone is not grounds for deletion. Any future archive directory must stay outside deploy output, and existing resource URLs need a preservation plan.

## Attribution and evidence

See `ATTRIBUTION_AND_CLAIMS.md`. Prototype, research, private implementation, professional-work, and spec-demonstration distinctions are preserved. No release, device-test, customer-success, sports-photography, or manuscript-ownership claim was added. Public minisign verification instructions are inventoried; no signed release sample is present to validate them against.

## Files added and retained

```text
(existing site pages, assets, CNAME, sitemap, scripts) — unchanged
migration/
  BASELINE.json, ROLLBACK.md, PROGRESS.md, DECISIONS.md
  CONTENT_MATRIX.csv, ROUTE_MAP.csv, ASSET_INVENTORY.csv
  ARCHIVE_MANIFEST.csv, ATTRIBUTION_AND_CLAIMS.md, ATTRIBUTION_INVENTORY.csv
  FORM_INVENTORY.csv, FORM_BEHAVIOR.md, DOWNLOAD_INVENTORY.csv
  LINK_INVENTORY.csv, LINK_FINDINGS.csv, REFERENCE_INVENTORY.csv
  METADATA_INVENTORY.csv, SCRIPT_INVENTORY.csv, VISIBILITY_INVENTORY.csv
  IMAGE_DETAILS.csv, EMBEDDED_ASSETS.csv
  DUPLICATES.csv, EXACT_IMAGE_DUPLICATES.csv, NEAR_IMAGE_DUPLICATES.csv
  CODE_BLOCK_INVENTORY.csv, DUPLICATE_CODE_BLOCKS.csv
  INVENTORY_SUMMARY.json, INVENTORY_FINDINGS.md, VERIFICATION.md
tools/
  inventory.py, image_inventory.py, reference_inventory.py
_codex_handoff/ — ignored local-only input; not supplied yet
.migration-local/ — ignored local-only image review sheets
```

The scripts rebuild inventories from the recorded Git commit. Python 3.12 and Pillow 12.0.0 were used. Archive proposals are preserved across inventory reruns. These scripts are inventory utilities, not the Slice 3 site generator.

## Next boundary

Wait for `_codex_handoff/approved-pilot/Olsen-Automation-Future-Pilot-v6-Single-File.html` and Brian's continuation. Do not commit the handoff package. No shell preview or Cloudflare configuration was created under the narrowed scope. GitHub Pages, CNAME, main, DNS, and account settings remain unchanged. Desktop/mobile and interaction QA belong to the resumed implementation slices; no rendered-page acceptance is claimed here.
