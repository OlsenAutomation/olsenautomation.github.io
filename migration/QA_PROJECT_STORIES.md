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

Pending upload and exact-file verification at this local checkpoint. The next receipt will identify the uploaded commit/version and results. The update is authorized only for the existing public-safe branch preview.

## Limits

The responsive browser checks are not physical iPhone/iPad or native Safari acceptance for these new clips. They do not establish production email delivery, project adoption, trading results, physical fit or durability. Main, the live GitHub Pages site and domain routing remain outside this update.
