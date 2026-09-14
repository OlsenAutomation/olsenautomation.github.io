# Project-story and video QA — September 14, 2026

## Local acceptance

- `npm run check` passes the full build, preservation, explicit-route, link, metadata, privacy, isolated form-receiver and buffered journey checks. All 26 atlas records have exactly one shared project-story section and matching evidence text.
- All 35 public preview pages and four isolated unlisted pages were loaded to completion in the Codex browser at 1440×900 and 390×844. All 78 measurements have one H1, readable main content, expected noindex, no horizontal overflow and no broken image in the visible viewport. Full-page screenshots are retained locally; representative story, photo and video layouts were visually inspected. See PROJECT_STORY_RENDER_QA.csv.
- Desktop and mobile Whale clips reach playable data and advance. The phone layout selects the 640px source. Switching clips pauses the previously playing clip. No MP4 source is assigned before explicit intent; network observation showed the first clip request only after Play.
- Keyboard Enter activates Play and moves visible focus into native video controls. Mobile navigation and atlas category filtering work. Reduced motion keeps both new clips stopped until requested. Without JavaScript, stories, captions, posters and direct MP4 links remain available.
- A blocked video request displays Retry and a direct-file alternative. The test found a rejected-play promise that could overwrite the failure message. The generation guard was added, and blocked-request messaging plus successful retry were retested.
- All 12 MP4 variants pass exact prefix/suffix/open-ended byte ranges, invalid ranges, validators, HEAD, blocked POST and preview headers through the existing media Worker tests. Photo/video hashes, image dimensions, metadata stripping and the single silent video stream are validated.
- No unexpected browser errors were observed during the page sweep. The deliberate blocked-media case produced its expected request error. Existing forms were verified through the isolated synthetic receiver checks; this update did not submit any real contact or workshop request.

## Hosted acceptance

Published commit `ef7e28f` through Worker version `c55c0803-7490-434c-a2df-cf71d505c8a3` using the existing branch-preview-only uploader.

- Alias: https://site-redesign-v2-olsen-automation-v2-preview.brian-dbb.workers.dev/
- Immutable version: https://c55c0803-olsen-automation-v2-preview.brian-dbb.workers.dev/
- 424 hosted file hashes match the local build; three aliases match their intended HTML. Twenty exclusion checks pass, POST is blocked with 405, and all 24 prefix/suffix checks across 12 video variants pass. Invalid ranges return 416. No verification failures.
- The hosted Whale page presents the new story and intent-gated players; the motion excerpt reached its 12-second end with ready data and no media error. The hosted assembly player was also exercised.
- The branch was pushed without changing remote main, which remains `0feac3f8376c5110eedfc20f5cdeecd0494f1ed7`. No main merge, production deployment, DNS/custom-domain change, paid feature or actual form submission occurred.

See PROJECT_STORY_PREVIEW_RECEIPT.json. The final receipt commit changes migration documentation only; the published source commit above identifies the actual uploaded build.

## Limits

The responsive browser checks are not physical iPhone/iPad or native Safari acceptance for these new clips. They do not establish production email delivery, project adoption, trading results, physical fit or durability. Main, the live GitHub Pages site and domain routing remain outside this update.
