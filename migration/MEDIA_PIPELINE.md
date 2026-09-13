# Production media checkpoint

All eight media originals were read through the local-only handoff symlink. Their SHA-256 hashes and original dimensions/durations are recorded in `public/media/manifest.json`; all eight hashes were rechecked after optimization. The giant single-file pilot is not committed, copied into output, or used as the production runtime.

## Measured outputs

Bytes below are decimal file bytes, not network transfer or compressed HTTP measurements. A browser requests one selected variant, not the whole derivative set.

| Clip | Original bytes | Mobile 640px bytes | Reduction | Desktop width / bytes | Reduction |
|---|---:|---:|---:|---:|---:|
| Portal | 11,227,381 | 1,155,296 | 89.7% | 1280 / 4,121,319 | 63.3% |
| Basement entry | 2,284,567 | 775,624 | 66.0% | 752 / 1,016,741 | 55.5% |
| Workbench approach | 6,334,850 | 939,055 | 85.2% | 930 / 1,563,314 | 75.3% |
| Stairs fallback | 5,213,864 | 802,269 | 84.6% | 1280 / 2,244,373 | 57.0% |

| Image/sequence | Results |
|---|---|
| Hero | Original 1,865,330 bytes; WebP 640px 29,212; 1280px 83,888; 1672px 119,836; JPEG fallback 139,526 |
| Whale assembled | WebP 480px 46,686; 960px 127,034; JPEG fallback retained |
| Whale blue kit | WebP 480px 65,856; 960px 261,990; JPEG fallback retained |
| Whale white kit | WebP 480px 37,510; 960px 189,582; JPEG fallback retained |
| Stair frames, mobile | 121 frames at 480px / 12 fps; complete sequence 1,635,690 bytes |
| Stair frames, desktop | 121 frames at 960px / 12 fps; complete sequence 3,637,046 bytes |
| Posters | Two WebP sizes for each of the four clips; final stair still selected near the door |

The complete reusable set contains **272 files / 20,245,087 bytes**, including repository provenance manifest, both sizes, all frames, stills, JPEG fallbacks and optional MP4 fallbacks. Largest file: **4,121,319 bytes**. The eight source files total 29,073,363 bytes. This aggregate is not a page payload comparison: the derivative set includes alternatives, and deployed manifest formatting differs. `migration/MEDIA_RESULTS.json` records the measured run.

## Pipeline and loading policy

- Separate HTML, CSS and ES modules; no embedded base64 media or iframe-contained single-file page.
- H.264, 24 fps, yuv420p, CRF 25, half-second keyframe spacing, faststart. All eight MP4 variants were verified to contain only one video stream and to put `moov` before `mdat`. Decorative audio, attached cover streams, subtitles and source metadata are removed from derivatives; originals remain recoverable.
- WebP quality 82 with responsive widths; JPEG quality 86 fallbacks for source photographs. EXIF orientation is applied, then pixels are copied into a fresh image. All generated images were checked for absent EXIF/ICC payloads. This does not assert anything beyond reviewed imagery about a depicted location.
- Poster-first video elements use `preload="none"`, no initial `src`, muted inline playback. Portal and individual scenes load only on an explicit control. Timeout/error paths retain a still and usable navigation.
- Stair motion uses content-addressed WebP files and a bounded nearby-frame cache, a latest-request guard and one animation-frame update per scroll tick. It does not decode/preload all 121 frames. Keyboard/manual position input takes priority over scroll.
- Reduced-motion and data-saving preferences select still views. The browser check observed zero MP4/sequence requests on initial load and under reduced motion. All motion can also be turned off manually.
- The V6 primary final-door action jumps directly to the interest field and focuses it, with no reverse playback. The secondary door action uses a portal return with skip and cancel. The local form component only creates a draft and text download.

## Remaining optimization work

The current sources are adequate for this checkpoint. Full-scene scroll timing, physical iPhone/iPad Safari decode/seek behavior, real network measurements, and loading budgets for the actual migrated pages must be verified when those pages exist. The largest desktop clip is 4.12 MB; retain intent gating and select the mobile variant before attempting more aggressive compression. The full frame set is a reusable output, not an instruction to preload it. AV1/WebM or paid transcoding is unnecessary now.

No old media has been replaced, moved or deleted. The baseline duplicate/archive recommendations remain proposals. A future encoder change should record new hashes and review orphaned derivatives before archive cleanup.
