# Project photo update — 2026-09-13

The owner requested using the reviewed project photos on the new site and cleaning messy images. This update adds three homepage features, seven illustrated atlas cards and five project galleries. It does not change project statuses or replace original evidence.

## Validation

- `npm run media:projects`: 13 selected masters, 52 derivatives, 4,134,800 bytes combined, maximum 292,461 bytes. Metadata validation verifies no EXIF, ICC or comments and checks dimensions and SHA-256 for every derivative.
- `npm run check`: build, 35 public / four isolated unlisted pages, source preservation, internal links, forms and receiver isolation, downloads/metadata/visibility, video byte ranges and buffered journey regression checks pass.
- Chromium browser: 35 public pages at 1440×900 and 390×844, with no horizontal overflow, blank pages, missing headings, missing noindex or broken in-view images. Four unlisted pages also rendered at both sizes on the isolated localhost port.
- All ten images in the five new galleries loaded, retained alt text and used containment without cropping build details. Desktop/mobile screenshots were captured locally. Visual review covered the homepage features, build photographs and the Scribr/Wing & Light captures.
- Homepage photo link → Mechanical Whale → All projects succeeded. Hardware filter showed six correct projects. Mobile navigation opened and closed. Keyboard focus was visible. Reduced motion retained the photo cards and links. No warning/error console entries appeared during these interactions.
- Physical iPhone/iPad and native Safari acceptance were not performed in this image update. No motion implementation changed.

## Source and public-output boundaries

`src/_data/project-photo-sources.json` pins selected source hashes. `src/_data/project-photos.json` supplies shared captions, evidence types and project association. `public/media/project-manifest.json` contains only derivative records; the builder merges those into its public runtime manifest. Original source masters, private handoff material and migration documents are excluded from served output.

Three images were edited with the built-in image-generation tool, using the prompts in `PROJECT_PHOTO_EDIT_PROMPTS.md`. Generative cleanup can reinterpret fine detail; these outputs are labeled presentation edits, paired with original development photographs, and do not add physical-test evidence. Unlisted and held discovery candidates remain excluded. The 13 unused first-pass encoding outputs are recoverable in an ignored local archive with a manifest.

Seven selected master copies initially retained camera/capture metadata through FFmpeg frame side data. The final copies have that metadata removed, with decoded RGBA pixel hashes verified unchanged. Earlier copies remain in an ignored local archive; original photographs are untouched. Validation now checks the selected repository masters as well as all published derivatives for EXIF/ICC/comments.

Public render measurements are in `PROJECT_PHOTO_RENDER_QA.csv`; full screenshots, interaction observations and local-only unlisted measurements are in the ignored `.migration-local/project-photo-qa/` folder.

## Hosted publication verified

Source: `8874ee7e9741c638c01469042ab44a9fec0a14cf` on `site-redesign-v2`, following media commit `5a65f0096612b7f46bbfeb2b266aed075284f7c9`. Both are pushed to the canonical GitHub repository.

Cloudflare preview version: `ce003752-0a75-499a-988a-f79a3c18ade6`.

- [Branch preview](https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/#on-the-bench)
- [Exact version](https://ce003752-olsen-automation-v2-preview.brian-dbb.workers.dev/)

`tools/check-hosted.mjs` verified all 394 served files against build SHA-256, three aliases, 17 existing excluded routes, blocked POST (405), and exact prefix/suffix/invalid ranges for all eight MP4s. Five additional photo-source/discovery paths returned 404, including selected masters and the build-only source manifest. No failures.

The homepage, atlas and five new gallery pages were checked again at 1440×900 and 390×844 on the hosted alias (14 records). All had the expected new photo counts, no horizontal overflow, no broken in-view images and retained noindex. Results are in `PROJECT_PHOTO_HOSTED_QA.csv`; screenshots and detailed HTTP evidence remain local.

The upload used `wrangler versions upload` through the branch-guarded wrapper. No production deployment, route/domain/DNS change or main merge occurred. Remote main was rechecked at the unchanged baseline `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`.
