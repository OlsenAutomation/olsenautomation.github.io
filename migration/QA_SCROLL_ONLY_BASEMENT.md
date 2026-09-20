# Scroll-only basement verification — September 20, 2026

Flow: homepage Enter link → room immediately → native forward/reverse scroll → workshop text → return through the room and up the stairs → invitation and signup/home links.

## Finding and change

The old 375×667 build enabled real-time video playback on entry and disabled sticky positioning on phone screens shorter than 800px. That produced an independent walking clock and removed usable scroll travel. The new room uses absolute page position, never calls play/toggle, and stays pinned within the small viewport. Decoder requests coalesce to the latest target while completed frames stay visible. Initial still/video frames now match. Both vortex dialogs, their public import/markup, all room/stair control bars, the entry gate and exit-choice copy are absent. Original assets remain recoverable. The provided screenshot's quote/explanation is removed; its project link remains.

## Checks

| Check | Result |
| --- | --- |
| Page identity and meaningful content | Pass: 36 candidate pages × 1440×900 / 390×844 = 72 renders; one H1 each |
| Layout, framework overlays and visible images | Pass: no horizontal overflow, blank page, error overlay or visible broken image |
| Console | No unexpected warning/error in the page sweep; deliberate blocked-media checks produced expected failures |
| Direct entry | Homepage link navigates directly to workshop.html; no transition dialog or media source before scroll intent |
| Scroll and idle | Rapid forward/reverse gestures under 4× CPU emulation kept stage top at 68px on 375×667; all room videos paused, one visible decoded scene; settled room/stair times remain unchanged without input |
| Continuous exit | Scrolling through text enters the room-to-stairs video directly; final CTA only becomes active at the door; no exit prompt or controls |
| Keyboard and actions | PageDown moves the scene while videos stay paused; final signup focuses first-name input; standard home link has no transition handler |
| Additional sizes | Room at 375×667 and 320×568 fits and stays pinned; 844×390 landscape text fits; 320×568 CTA bounds 128–538px within 568px viewport |
| Reduced motion / no JavaScript | No video sources assigned; class information, direct email and final CTA remain accessible |
| Media failure | Blocked room download retains poster and class access; blocked stairs show the door/CTA instead of blocking the user |
| Build and preservation | release:build passes routes, links, private boundaries, metadata, offline forms/notifications and 14 MP4 range checks |
| Slow decoder regression | One in-flight seek; intermediate destinations are dropped; decoded frames show before catching the moving target; reverse target settles exactly without autoplay |

Raw 72-render measurements/screenshots and fast-gesture samples are in ignored local review storage. The local candidate was served on 127.0.0.1:43189 and tested using Codex Browser/CUA. No external Playwright fallback was used. Tests did not send forms, email or engagement alerts.

## Media provenance

`/media/entry-scroll-start-640.2d65a2fc0baf.webp` is the first decoded frame of the existing approved 640px entry derivative. Size 640×354, 35,716 bytes; SHA-256 `2d65a2fc0bafe9246573e4c18a6cc0294aab46eb9e03db651a92464fa504cde6`. It is metadata-free generated scenery, not a photograph of Brian's home. The media generator now reproduces this first-frame poster. Existing source/derived videos and former posters remain unchanged.

## Limits

Physical iPhone/iPad Safari flicking, momentum and toolbar behavior remain owner acceptance items. Emulator/browser evidence does not establish physical-device smoothness. Notification provider recovery/delivery remains deferred by owner; no test retry or paid service was introduced. Main, GitHub Pages, DNS and production traffic remain unchanged.
