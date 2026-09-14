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

Hosted publication and verification are recorded below after the approved branch preview is updated.
