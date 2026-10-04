---
name: research-diagram-imagegen
description: Create source-grounded research figures for this portfolio using accurate Matplotlib bases and imagegen style edits, then integrate optimized images, LaTeX math, and the shared project gallery. Use for scientific diagrams, technical papers, or matching the accepted WindWeave figure style.
---

# Research diagrams with imagegen

Reproduce the accepted WindWeave scientific-panel style while preserving the
meaning of the source code. This is a repository-local skill, maintained with
`AGENTS.md`, rather than a dependency on a previous chat or private agent memory.

The owner called the base figures “mathlab” diagrams. The actual implementation
uses **Matplotlib**, NumPy, and Matplotlib mathtext to produce MATLAB/Simulink-style
scientific diagrams. MATLAB, Simulink, and a TeX installation were not used.

## Read for the current task

- For a new figure or a full regeneration, read [workflow.md](references/workflow.md)
  and [prompting.md](references/prompting.md).
- For WindWeave, also read [windweave-specification.md](references/windweave-specification.md).
  It distinguishes source facts, exact examples, analytical estimates, and the
  author's experiment report. Verify these against current source when changing them.
- When adding an image, equation, or paper to the website, read
  [portfolio-integration.md](references/portfolio-integration.md).
- For preserved media, interface reconstructions, and evidence provenance, read
  [source-and-evidence.md](references/source-and-evidence.md).
- For Plantini/AquaFlow CAD and private sensing, or EasyShield/SmartHart source
  analysis, read [multi-project-figures.md](references/multi-project-figures.md).
  It records the seventeen-figure plan, source invariants, CAD/video reference
  preparation, controller ownership and corrections learned from this extension.
- For TPMS geometry, AlgoBrain bio-signal processing, or the EasyShield cover,
  read [tpms-algobrain-figures.md](references/tpms-algobrain-figures.md). It records
  source invariants and the corrections required for mathematical and protocol accuracy.

## Essential decisions

1. Inspect the source and write a figure specification before styling. Use code
   to draw exact timelines, tensor grids, table values, arrows, and equations.
2. Export a legible PNG base and preserve its SVG/PDF companions. For this
   accepted style, use imagegen to **edit that base**, with the approved cover
   supplied as a separate **style-only** reference.
3. Inspect every local input with `view_image` before passing it to imagegen.
   Explicitly assign each reference a role and list the numbers, shapes, equations,
   arrow directions, and intervals the output must preserve.
4. Use rich nested scientific panels on a white canvas: quiet blue, grey, ochre,
   rose, and green; thin outlines; small flat icons; tables and sequence matrices;
   precise connectors; clean math; edge-safe labels. This is the accepted treatment.
5. The **cover** may use the requested NVIDIA/CUDA technology branding. **Article
   diagrams must have no NVIDIA/CUDA logos or words, giant WINDWEAVE title,
   certificate treatment, decorative green cover frame, or thumbnail header.**
   Transfer its panel style, not its branding or layout.
   **Updated owner feedback:** dense scientific panels belong inside articles.
   Thumbnails should communicate one concept with large visuals, a short title,
   few labels and generous whitespace. See [thumbnail-refinement.md](references/thumbnail-refinement.md).
6. Compare generated figures with the specification. Make narrow imagegen
   corrections for wrong labels, shapes, arrows, or meanings while preserving
   the successful composition. Then inspect the entire result again.
7. Optimize selected outputs with Sharp, preserve aspect ratio, record actual
   dimensions, and integrate them through `ProjectFigure` and `MediaGallery`.
   Equations and inline variables in the article use native KaTeX, not raster text
   or preformatted code blocks.
8. Keep previously accepted artwork, original source projects, and unrelated
   website design intact. For this work, Diagram Maker is explicitly excluded.
   Do not add its plugin footer or replace imagegen with it.

Follow `instruction.md` and the current user's scope. The work documented here
was explicitly **local-only: no commit, GitHub push, or Cloudflare deployment**.
This skill grants no publishing authorization; keep that restriction until the
owner expressly changes it. Do not invoke deployment tools merely because a
Cloudflare plugin was mentioned in the original conversation.

## Reusable resources

| Resource | Purpose |
| --- | --- |
| [render_windweave_bases.py](scripts/render_windweave_bases.py) | Reproduce all seven exact Matplotlib base figures into a caller-selected directory; no source-project or public-asset writes |
| [optimize_figure.mjs](scripts/optimize_figure.mjs) | Convert one selected raster to WebP and report actual dimensions, byte size, and hashes; no article edits |
| [diagram-prompts.json](references/diagram-prompts.json) | Exact shared style instruction and seven first-pass figure prompts used in this work |
| [diagram-corrections.json](references/diagram-corrections.json) | Exact targeted correction prompts with portable reference-role descriptions |
| [cover-prompt.txt](references/cover-prompt.txt) | Original cover prompt followed by the correction specification; cover-only branding |
| [accepted-assets.json](references/accepted-assets.json) | Repository-relative approved asset paths, dimensions, hashes, and content/style roles |
| [multi-project-prompts.json](references/multi-project-prompts.json) | Actual first-pass and correction prompts for the four-project extension, with portable source-reference roles |
| [render_project_bases.py](scripts/render_project_bases.py) | Reusable seventeen-figure Matplotlib layout generator for the inspected project specifications |
| [render_cad_reference_sheets.py](scripts/render_cad_reference_sheets.py) | Read-only STL outline references from a caller-selected source root; no fabrication dimensions |
| [multi-project-assets.json](references/multi-project-assets.json) | Final extension image metadata and hashes |
| [render_tpms_algobrain_bases.py](scripts/render_tpms_algobrain_bases.py) | Four source-grounded geometry/bio-signal diagram bases and two cover content bases |
| [tpms-algobrain-prompts.json](references/tpms-algobrain-prompts.json) | Exact first-pass prompts and subsequent source-accuracy corrections |
| [tpms-algobrain-assets.json](references/tpms-algobrain-assets.json) | Final optimized asset dimensions, sizes and hashes |

Run scripts from the repository root. Resolve bundled Python with
`load_workspace_dependencies` when available; Node resolves this repository's
existing `sharp` dependency. The full commands are in `workflow.md`.

The prompt files are concrete WindWeave examples. For another project, retain the
style and reference roles but replace its domain content, constants, and evidence.
Do not transplant wind lengths, GPU claims, reward equations, or reported scores.
Regeneration is stochastic: the references and correction process reproduce the
design language, not an identical bitmap. Documentation updates alone do not
require another paid image generation or a website rebuild.
