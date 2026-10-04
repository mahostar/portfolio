# Reproducible figure workflow

This records the implementation accepted on 2026-10-04. Use the current repository
and tool schemas as authority when they change. The reusable outputs are in the
repository; ignored `temp/`, browser artifacts, and Codex's generated-image folder
are working storage, not required permanent dependencies.

## 1. Establish scope and preserve source

Read root `AGENTS.md` and `instruction.md`, inspect Git status, and identify the
accepted assets before editing. Preserve a healthy localhost preview on port
3002. The owner wanted the server available before website work, and explicitly
withheld GitHub and Cloudflare publication. Inspect the listener before starting
another process. If no healthy portfolio server exists, start `pnpm exec next dev
--port 3002` in a retained session and verify the affected route.

Read source projects without changing them. Small isolated scripts and copied
source may live in ignored `temp/project-showcase/`. Do not run training, load
multi-gigabyte weights, download the original ML environment, or install its
libraries merely to inspect an interface or draw a diagram.

Create a provenance list: source filenames/functions, exact constants, toy values,
analytical calculations, saved real results, and author-provided statements. For
external source files, SHA-256 before and after is useful evidence of preservation.
Do not copy private documents or full datasets into `public/`.

## 2. Specify scientific content

For each figure, record:

- Its one main question and the panels that answer it.
- The stage order, arrow directions, ownership boundaries, and retained state.
- Mathematical notation, exact labels, shapes/dtypes, units, zero-based indices,
  and half-open intervals.
- Which plots are measured, analytical, toy examples, or purely schematic.
- What the figure must not imply, based on the actual source.

Example: `[18,63)` is 45 history rows; `[63,90)` is 27 target rows, both from file
B. A file is not inherently an “encoder file” or a “target file.” Graphical polish
must preserve that distinction.

An attractive cover is not a source of scientific truth. The first cover draft
invented year/file-count statistics, spatial CNN shapes, and asynchronous transfer
claims. They were removed in a correction pass. Its final panel style was then
used to restyle the accurate article bases.

## 3. Draw a deterministic Matplotlib base

Use Matplotlib's `Agg` backend and NumPy. Use `Figure.add_axes` for deliberate
multi-panel placement; `Rectangle` for tables, cells, strips, and boxes;
`FancyArrowPatch` for directed connectors; ordinary plot calls for exact data.
Keep scientific geometry simple enough to inspect before requesting richer art.

The reference generator establishes:

```python
matplotlib.use("Agg")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "DejaVu Sans"],
    "font.size": 10,
    "mathtext.fontset": "stix",
    "svg.fonttype": "path",
    "pdf.fonttype": 42,
    "axes.linewidth": 0.7,
    "savefig.facecolor": "white",
})
```

The 10-inch-wide canvases vary in height to suit each figure. Mathtext renders
labels such as `$X_{enc}$`, `$45\times4$`, and `$\sigma=\sqrt{M_2/n}$` without a
system TeX installation. The base palette is ink `#192c43`, blue `#477fb5`, rose
`#ec657c`, ochre `#cbb747`, grey `#9aa9ba`, green `#499267`, pale blue `#e8f0f8`,
and hairline grey `#cfd7df`. The richer generated figures need not match each hex
literally; they should preserve the palette's quiet scientific character.

Prevent clipping deliberately. The original arrow helper needed `clip_on=False`
for feedback and time arrows below an axes box. Panel titles use a consistent
figure-level horizontal offset (`0.027 / panel_width`) to separate letters from
titles. Inspect titles, legends, equations, and lower annotation bands at full size.

Export each base to SVG, PDF, and PNG at 160 DPI. Use the PNG as the imagegen
content reference. Keep the vector versions for exact geometry, publication use,
and recovery when generated mathematical detail is unreliable. Do not overwrite
an accepted styled figure while preparing new bases.

From the repository root, after discovering the available Python executable:

```powershell
$diagramPython = 'C:\Users\Mohamed\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
& $diagramPython .agents/skills/research-diagram-imagegen/scripts/render_windweave_bases.py --output-dir temp/research-diagrams/bases
# Or render a subset for a scoped change:
& $diagramPython .agents/skills/research-diagram-imagegen/scripts/render_windweave_bases.py --output-dir temp/research-diagrams/index-review --figures index
```

That Python path was available during this work; resolve it again on another host.
Required libraries are Matplotlib and NumPy. There is no dependency on PyTorch,
CUDA, YOLO, MATLAB, Simulink, or a project venv. The script requires an explicit
output directory and refuses existing selected outputs unless `--overwrite` is
supplied. Its JSON manifest records actual output dimensions and content hashes.
For another domain, adapt the base generator in the task's temporary workspace;
these seven presets encode the inspected WindWeave implementation.

## 4. Prepare imagegen references and prompts

Inspect the content PNG and the approved style asset with `view_image`. Resolve
style references from `accepted-assets.json`. The durable style source is
`public/images/projects/windweave-cuda.webp`, not a transient generated-image path.
It contains branding, which is explicitly excluded from article figures in the
prompt. An accepted unbranded styled figure can be an additional reference when
a narrow change must match that figure exactly.

Read `prompting.md`, then combine `diagram-prompts.json.shared` with the relevant
figure's `prompt`. The file preserves the exact first-pass wording. Incorporate
the known correction invariants into a new first pass when applicable, rather
than deliberately reproducing a mistake. The correction prompts remain useful
for checking results or repairing a new draft.

Use one built-in imagegen call per asset. This work used the built-in tool, not
the CLI/API fallback, and required no API key. See `prompting.md` for the precise
reference ordering and tool-call example. Tool schemas may evolve; inspect the
available one rather than inventing unsupported arguments.

## 5. Review and correct the generated bitmap

Use the source specification beside the actual rendered result. Review every
equation, dimension, tick, unit, count, interval, direction, and legend. Check
omitted information as carefully as fabricated additions. An image can look
excellent while falsely depicting data leakage or a different algorithm.

The demonstrated corrections were:

| Draft error | Required correction |
| --- | --- |
| CPU slice illustration added a spatial axis | Use a 2D time-by-feature matrix |
| File A/B labeled encoder/target | Both files contain full sequences; remove those role labels |
| Future cells in `T_dec` looked empty | Fill all known timestamp cells; only `X_dec` future features are zero placeholders |
| `M=WPBS` called per-worker payload | It is the total queued raw tensor payload across `W` workers |
| Invented training pseudocode | Replace with request, transfer, forward/loss/backward, optimizer steps |
| Cache labeled `key: index` | The active DataFrame is identified by file path |
| Both history and output used a generic `d` | History is `(B,45,4)`; prediction/target are `(B,27,2)` |

Supply the current generated draft as image 1 and the accurate original base as
image 2 for a correction. Add the approved cover as image 3 only if style needs
reinforcement. State that the composition, palette, other labels, and arrows must
remain. `diagram-corrections.json` stores the successful targeted wording.

After each correction, review the whole figure for drift. Do not silently patch
the bitmap with Python drawing tools; image editing here uses imagegen. Sharp
conversion/resizing is deterministic delivery processing, not a substitute for
the requested image edit. If a numerical plot or equation repeatedly drifts,
keep its deterministic SVG/PNG representation and explain the limit; do not
publish a knowingly false graph to preserve an aesthetic.

Stop iterating once the style and scientific invariants pass. This documentation
task does not authorize new imagegen calls or regeneration of accepted assets.

## 6. Select, optimize, and preserve

Built-in imagegen saves under Codex's generated-image directory. Use the returned
file path or actual output metadata. No destination argument was used. Copy the
selected output into the task workspace before using it as a project asset;
retain a prompt/reference manifest in ignored task storage. Do not expose a
base64 payload in commentary, logs, or the final reply.

For diagram delivery, the successful settings were maximum width 1920,
`withoutEnlargement: true`, WebP quality 92, effort 6, and original aspect ratio.
Actual outputs were approximately 156–245 KB, not a prescribed byte cap. Check
small labels after encoding. Avoid repeatedly recompressing already optimized
WebPs; use the selected original generated bitmap for revisions when available.

```powershell
node .agents/skills/research-diagram-imagegen/scripts/optimize_figure.mjs --input temp/research-diagrams/architecture-selected.png --output temp/research-diagrams/architecture-review.webp --report temp/research-diagrams/architecture-review.json
```

The helper prints dimensions and hashes, preserves proportions, and requires
`--overwrite` for an existing destination. After review, move/copy to an explicit
public sibling filename and update the consuming MDX. It deliberately does not
edit articles or decide which existing asset to replace.

The cover used a separate 1600×900 contain composition, green background, and
WebP quality 88. Do not apply that framing to article figures. The old blue
streaming concept remains in the abstract/shared gallery. New public filenames
(`-paper.svg`, then `-styled.webp`) avoided stale cached images encountered during
this work; use a fresh versioned sibling name for a subsequent accepted revision.

## 7. Integrate and validate

Follow `portfolio-integration.md`: exact dimensions in MDX, descriptive alt/caption,
common gallery, native KaTeX, regenerated content bundle, and browser evidence.
Source inspections and a successful build do not establish image readability,
gallery behavior, or measured training performance. Verify each separately.

Keep generated working files in ignored `temp/` or `artifacts/`. The durable
resources in this skill use repository-relative paths and do not require those
ignored directories to survive. Finish with local result paths and validation
evidence, respecting the current publication restriction.

## Maintaining this skill

Validate metadata after changing the entrypoint with the installed skill-creator
validator. On this Windows host, use Python's UTF-8 mode because the validator's
default text reader otherwise uses CP1252 and fails on typographic punctuation:

```powershell
& $diagramPython -X utf8 'C:\Users\Mohamed\.codex\skills\.system\skill-creator\scripts\quick_validate.py' .agents/skills/research-diagram-imagegen
node --check .agents/skills/research-diagram-imagegen/scripts/optimize_figure.mjs
```

Resolve those runtime/skill paths again on another host. Validate resource links,
JSON parsing, and actual script outputs in a new ignored task directory. The
metadata validator alone does not verify scientific content or image quality.
When an accepted asset changes, update the inventory from its actual metadata
and hash rather than editing a size or checksum by hand. Preserve historical
prompt provenance and distinguish it from the current corrected specification.
