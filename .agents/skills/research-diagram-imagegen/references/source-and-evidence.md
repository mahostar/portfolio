# Source preservation, covers, and interface evidence

## Project scope and accepted media

The two added projects are WindWeave (`/projects/windweave`) and FabricLens
(`/projects/fabric-inspection`). Original projects remain at
`E:\projects\wind_ERA5` and `E:\projects\fabric_defect_trainer`. The portfolio
work read source, used saved artifacts, and created isolated presentation
scripts; it did not modify original project code or execute a new training run.

`accepted-assets.json` records the durable approved image paths and hashes as a
2026-10-04 snapshot. Hashes establish which files were approved and preserved,
not a requirement that every future authorized revision match the old file.
Inspect current source and user instructions before replacing a version.

| Cover asset | Role |
| --- | --- |
| `public/images/projects/windweave.webp` | Original blue concept image, retained as an existing asset |
| `public/images/projects/windweave-streaming.webp` | Blue concept with the real-time subtitle; retained in Abstract and shared gallery |
| `public/images/projects/windweave-cuda.webp` | New accepted technical cover and diagram style reference |

The main cover can show the requested NVIDIA/CUDA technologies. It must remain
a personal project showcase; it is not an issued NVIDIA certificate or an
endorsement. The user liked its rich flat technical presentation, not its
initial incorrect data. The cover correction removed invented file/year tables,
spatial CNN shapes, hour assumptions, a spurious title mark, “no file I/O at
training time,” and asynchronous transfer wording. A prediction trace is an
illustrative schematic without measured ticks or metrics.

The cover's NVIDIA horizontal mark was supplied from an official asset to
imagegen rather than described from memory. The source page used was
`https://www.nvidia.com/en-gb/about-nvidia/legal-info/logo-brand-usage/`.
For another branding task, verify current official assets and inspect them;
do not assume an old asset URL or automatically redownload the logo for every
diagram. Article figures explicitly exclude these marks and the cover header.

## Lightweight interface screenshots

The original viewers import ML libraries, load models, and in one case contain
an automatic dependency installer. Importing that source just to get a screenshot
could trigger unnecessary setup. Instead, inspect its layout and controls as
text, then make a small HTML/CSS reconstruction with plausible display-only rows.
Use existing optimized annotated media where available. Label reconstruction and
synthetic values in the interface and caption.

The original task companion was `temp/project-showcase/just-to-screenshot.py`:
a standard-library `ThreadingHTTPServer`/`SimpleHTTPRequestHandler`, bound to
`127.0.0.1`, default port 3013, with optional browser opening and `--no-browser`.
It served `temp/project-showcase/interfaces.html` through a portfolio-root handler.
That path was a temporary working arrangement, not a dependency of this skill.
For future previews, serve only the dedicated task directory and create the
HTML there; do not rely on the old ignored file or broadly expose project folders.

The mock weather tables illustrated fields, units, window navigation, predicted
versus actual columns, and controls. Their values were not model outputs and
did not establish accuracy. The FabricLens preview used an existing annotated
result and recreated the viewer chrome without YOLO execution.

Capture the reconstruction through the browser/Playwright at an explicit viewport,
inspect the result, encode a WebP, and place it under the project's evidence
directory. Stop only preview servers created for the task. Preserve the main
portfolio preview. An interface screenshot cannot silently replace numerical
evaluation evidence.

## FabricLens source facts

The paper describes single-class textile defect localization with YOLO11s,
frozen-backbone adaptation followed by full-model fine-tuning. The inspected
configuration freezes layers 0–9 initially, uses 640-pixel resolution, batch 16,
and four loading workers. Batch inference uses confidence 0.25 and IoU 0.45.
Do not transfer WindWeave's sequence/GPU/RL claims into this project.

Its existing inference outputs, training curves, and confusion matrix are saved
real project artifacts. The screenshot viewer is a reconstruction. The source
desktop viewer uses Tkinter, CPU inference in a background thread, and a cache
by image path. It is evidence of a design, not measured sustained responsiveness
or factory deployment accuracy. Its paper uses native LaTeX for normalized box
coordinates and IoU, with the same seven-section heading contract.

## Durable and temporary records

This skill preserves the reusable generator, first-pass prompts, correction
prompts, cover prompt, approved asset inventory, and integration guidance.
Generated PNG/PDF bases, candidate imagegen outputs, screenshots, and manifests
can stay under ignored `temp/`/`artifacts/` during work. Selected public assets and
their literal MDX references must survive outside transient Codex storage.

The original source hashes were checked again after the work and matched. When
changing a future showcase, record relevant source hashes anew rather than
asserting that this historical check covers later edits. Keep private identifiers,
model weights, full datasets, original transcripts, and secrets out of public
assets and skill files.

The publication boundary remains explicit: no commit, GitHub push, or Cloudflare
deployment until the owner says so. This applies to this skill and `AGENTS.md`
as well as the website changes. Earlier standing deployment instructions do
not override that narrower user request.
