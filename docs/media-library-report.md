# Portfolio media library — reviewed 2 October 2026

The library is organized at `E:\portfolio\Achievements`. It is a private preparation library, outside `public/` and excluded from Git. No website content has been replaced or new project pages published in this pass.

Open [the searchable visual catalogue](../Achievements/catalog/gallery.html) to review each image/video, its category, notes, original, and optimized copy. [The CSV catalogue](../Achievements/catalog/asset-catalog.csv) records the original filenames and paths. [The JSON manifest](../Achievements/catalog/manifest.json) includes source hashes, dimensions, durations and derivative paths.

## What was completed

| Work | Result | Remaining work |
| --- | --- | --- |
| Inventory | 125 original files: 100 images, 20 videos, 1 GIF, 3 notes, 1 Windows metadata file | Add the next project batch |
| Classification | Every file assigned to projects, milestones, certificates, personal, review, notes or system | Confirm the few ambiguous assignments below |
| Names and folders | Descriptive lowercase names with stable IDs; corrected manufacturing/course/circuit-board folder names | Confirm preferred spelling of the solar diagnostic project |
| Original preservation | All 125 files moved with identical SHA-256 checksums; original names/paths retained in the manifest | Keep an independent backup of the originals |
| Images | 100 main WebP images plus small WebP thumbnails; no upscaling | Choose final crops and covers when integrating |
| JPEG recovery | 6 problematic JPEGs decoded through FFmpeg; original bytes preserved | Nothing blocked |
| Videos | 20 browser-oriented MP4 copies; sound retained where present; fast-start playback | Choose short featured excerpts and captions if desired |
| Animation | 1 GIF converted to MP4 with a WebP poster | Use video playback instead of the heavy GIF |
| Visual review | Searchable local catalogue with links to originals and web copies | Select the public gallery contents |
| Validation | 125 original checksums verified, 242 WebP outputs decoded, 21 MP4 outputs fully decoded; no errors | Website layout checks after integration |

## Storage and conversion results

Sizes below use decimal MB/GB. Originals are retained, so optimization reduces delivery size, not the size of the preserved source archive.

| Type | Original size | Main web copy size |
| --- | ---: | ---: |
| 100 images | 172.5 MB | 14.0 MB |
| 20 videos | 891.9 MB | 72.3 MB |
| 1 GIF | 5.8 MB | 1.0 MB MP4 |
| Main media total | 1.07 GB | 87.3 MB |
| Complete web package, including thumbnails and posters | — | **90.4 MB** |

The complete web package is approximately **91.6% smaller** than the source library. This is a whole-library figure; the website should load only selected media and lazy-load the rest.

Photos use WebP quality 84 and a maximum 1600-pixel long edge. Screenshots/diagrams use quality 92. Certificate previews allow a 2400-pixel long edge for legibility. Thumbnails have a maximum 480-pixel long edge. No originals are cropped, stripped, re-encoded or overwritten.

Video copies use H.264/AAC, yuv420p, up to 1280×720 landscape or 720×1280 portrait bounds, 30 fps and MP4 fast-start. Two already-efficient videos (IDs 038 and 096) retain their original streams with fast-start remuxing because re-encoding made them larger. Source durations were checked against the derivatives. Optimized video is intentionally lossy; the full-resolution originals remain available.

## Existing project-page coverage

This table describes assets received and classified, not changes already made to project-page imagery.

| Existing project | Matching assets in this batch | Coverage | Still needed |
| --- | --- | --- | --- |
| EasyShield | 5 images, 1 video, 1 GIF | Good: live interface, predictions, training/development and demonstration | Prefer clean direct screenshots over photographs of screens; confirm hardware ownership |
| Plantini | 18 images, 3 videos, plus 3 event photos filed under milestones | Strong: app, architecture, fabrication, prototypes and concepts | Confirm event/prize captions; label concept renders distinctly |
| AlgoBrain BCI | 2 prototype/exhibition images and 2 certificate scans | Useful physical evidence | App/signal-processing screenshots; resolve 2022 owner-note versus 2023 page chronology |
| NiotoShield | 1 explicitly labeled architecture diagram | Partial | Product/app photos; confirm whether hardware IDs 055–056 belong here |
| SmartHart | None found | Missing | Dashboard, anomaly/chart output, demonstration |
| Cyclops | None found | Missing | Pipeline/interface, report sample or agent workflow |
| DepthFusion-ViT | None found | Missing | Input/output depth examples, interface, visual results |
| Remote PC Power Control | None found | Missing | Flutter app, ESP32/relay installation, short working demo |

The four projects with **no matching images** are SmartHart, Cyclops, DepthFusion-ViT and Remote PC Power Control. Medical Robot was not assigned to SmartHart just because both have a medical theme.

## Candidates for new project pages

| Project candidate | Available media | Proposed use | Still needed before writing the page |
| --- | --- | --- | --- |
| AquaFlow | 6 images + 1 video | Project: water-system architecture, test bench, electronics and mobile controls | Your role, short description, dates/results and repository/link if available |
| Cleenolve / Cleanove | 2 images | Project: thermal hotspot software and solar robot concept | Preferred spelling, project scope, role, results; clarify the rendered robot image |
| Medical Robot | 5 images + 2 videos | Project: design sketch, fabrication, physical prototype and event demo | Project name, functions, ownership/role and technical stack |
| TPMS Generator | 3 screenshots + owner notes | Project: generated mathematical structures and export workflow | Interface/code screenshots, results and GitHub link if public |
| Faza3D | 7 images + owner notes | Project: storefront, custom ordering and printing workflow | Your role, live URL, stack and dates |

Private projects can still have a case study using approved screenshots and high-level descriptions. A GitHub link is optional; do not invent a repository or expose proprietary design details.

## Achievements and milestones placement

| Group | Media | Recommended placement / story |
| --- | --- | --- |
| FabLab robotics and digital fabrication | 1 image + 4 videos | Achievements: hands-on workshop and robot-arm teaching |
| FabLab PCB manufacturing | 8 images + 6 videos | Achievements: circuitry, patterning, etching, drilling and assembled boards |
| FabLab AI talk | 1 video | Achievements: speaking about AI and technology; do not claim TED/TEDx affiliation |
| Graduation | 12 images + 1 video | Achievements: degree milestone and ceremony; use 1–3 strong photos rather than every near-duplicate |
| Plantini events | 3 images | Achievements: pitch, recognition and certificate/prize moments, linked to the Plantini project |
| Agrinova hydroponic training | 9 images | Achievements: hydroponics training and hands-on sessions; these are training photos, not Plantini prototypes |
| Solar training | 4 images + 1 video | Achievements: field practice and training; formal scans belong under certificates |
| Certificates | 9 scans, including 1 exact duplicate | Official Certificates: Agrinova, AlgoBrain, soft skills, solar installation/commercial training and IELTS |
| Personal context | 2 images | Optional personal gallery; not proof of project results or awards |

Start with a compact selection of 6–8 milestone stories. Let each story hold its supporting gallery/video so the homepage does not grow into a long wall of every image.

## Items that need your facts or selection

- **IDs 055 and 056:** hardware photos came from the EasyShield folder, but that folder also contained a NiotoShield diagram. Keep in `review/university-hardware` until ownership is confirmed.
- **ID 052:** its title explicitly says “Niotoshield Architecture.” It is now classified under NiotoShield.
- **IDs 012 and 122:** byte-identical Agrinova certificate scans. Both originals are preserved; choose one for the public certificate card.
- **IDs 074–076:** Plantini event/prize photos need exact event names, dates and recognition details. No award amount/category has been inferred from a thumbnail.
- **IDs 024–025:** AlgoBrain certificates need a full-resolution transcription of their event/issuer/date before public captions.
- **ID 023:** the AlgoBrain owner note mentions June 2022; the current project page says 2023. This may reflect different stages; confirm the chronology.
- **IDs 091–092:** Plantini concept visuals are separated from photos of the actual prototype. **ID 035** is a solar robot render. **ID 090** is a board product image/render.
- **ID 037:** the ceremony group portrait may be edited; confirm its provenance before treating it as documentary evidence. Other direct graduation photos are available.
- **ID 124:** IELTS contains personal identifiers and verification details. Keep this full scan private and prepare a redacted public preview before integration.
- **ID 057:** Windows crash photo retained as development context, not recommended as a cover.
- **Robotics workshop photos/videos:** pick public-facing frames thoughtfully, especially group footage involving children. This pass keeps all media local.

## Folder structure and future imports

```text
Achievements/
  originals/
    projects/{project}/{app,hardware,architecture,prototypes,...}/
    milestones/{story}/
    certificates/{credential}/
    personal/
    review/
    notes/
    system/
  web/                 # optimized copies mirroring the categories
  catalog/
    gallery.html       # searchable visual review
    asset-catalog.csv  # filenames, classifications and notes
    source-manifest.json
    manifest.json      # web paths, sizes and checksums
    summary.json
    verification.json
  incoming/            # place future batches here before classification
  README.md
```

Names follow `descriptive-subject--stable-id.ext`, for example `mobile-control-dashboard--032.webp`. Every original camera/phone filename is recoverable from the manifest and CSV.

The old `Achivments` path contains a redirect note because Windows held that directory open during the rename. Its original media has moved into `Achievements/originals`.

The reusable script is `scripts/prepare-portfolio-media.mjs`. It validates paths, preserves source hashes and reuses existing derivatives on subsequent runs:

```powershell
node scripts/prepare-portfolio-media.mjs          # dry run
node scripts/prepare-portfolio-media.mjs --apply  # prepare reviewed manifest
```

It processes the reviewed manifest, not arbitrary new files automatically. For the next batch, place files in `incoming/{project-name}/`, provide any descriptions/links, and extend the classification manifest before rerunning. Keep new IDs stable and do not renumber this batch.
