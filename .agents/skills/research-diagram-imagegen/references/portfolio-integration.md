# Portfolio integration and verification

## Files and contracts

| Concern | Repository source |
| --- | --- |
| Paper content | `src/content/projects/windweave.mdx`, `fabric-inspection.mdx` |
| Content schema and heading contracts | `src/lib/content-schema.ts` |
| Content lint | `scripts/lint-content.mjs` |
| Content bundle | `scripts/bundle-content.mjs` → `src/content/bundled-projects.json` |
| Page, MDX plugins, common gallery | `src/app/projects/[slug]/page.tsx` |
| Inline figure | `src/components/project-figure.tsx` and its CSS module |
| Reusable viewer | `src/components/media-gallery.tsx` and its CSS module |
| Paper typography | `src/app/projects/[slug]/case-study.module.css` |
| Evidence records | `src/content/evidence.json`, `src/lib/evidence.ts` |
| Browser checks | `tests/project-papers.spec.ts`, `playwright.config.ts` |

Inspect the current code before changing its contracts. Read the relevant
installed Next.js guide under `node_modules/next/dist/docs/` before writing
Next.js code, as root `AGENTS.md` requires. This project used Next 16.3.7 during
the implementation; do not infer APIs from an older release.

## Research-paper structure

`format: paper` opts into the scoped presentation. `paperTitle` supplies the full
technical heading, while `title` remains the concise project/card name. The
schema defaults other projects to `case-study`, preserving their presentation.
The summary must be no more than 100 characters. Keep existing ordering and
accepted global design unless the task explicitly includes them.

The seven exact `##` headings are:

1. Abstract
2. System specification
3. Method
4. Implementation
5. Evidence
6. Discussion
7. References

The page selects `paperSections` for both contents and heading checks; CSS adds
section numbers. Subsections use `###` with consistent numbering in the text.
Do not fall back to the previous “Problem / What I built / How it works” blog
style for these papers. Write technical prose around mechanisms, equations,
assumptions, evidence, and implementation boundaries.

Paper prose uses Georgia/Times, 17px desktop and 16px mobile, line-height 1.7.
Headings, figures, and table labels use readable UI typography. Scope changes
under the paper CSS class rather than changing accepted navigation, hero layers,
global scale, other cards, or all case studies.

## Native LaTeX math

The installed pipeline is `remark-math` + `remark-gfm` + `rehype-katex`, with
`katex/dist/katex.min.css` imported by the project page. Paper documents use
`strict: "error"`, `throwOnError: true`, `trust: false`. The packages at completion
were KaTeX 0.16.47, remark-math 6.0.0, rehype-katex 7.0.1, remark-gfm 4.0.1.
Recheck the lockfile if they change.

Inline variables use `$u_{10}$`, `$v_{10}$`, `$p_s$`, `$T_{2m}$` rather than code
chips or missing bare variables. Retain literal source names only where code
identifiers themselves matter. Display equations use `$$` and explicit `\tag{n}`:

```md
For a normalized input feature, let $\mu$ and $\sigma$ denote its stored mean and scale.

$$
\widetilde{x}=\frac{x-\mu}{\sigma}.
\tag{6}
$$
```

Use aligned environments for related equations and keep line lengths readable
on phones. The scoped CSS has a clean white display, inline/stacked math and
right equation tags, with overflow contained inside the formula. Do not render
formulas as `<pre>`, code blocks, screenshots, or generated article text.
Matplotlib/imagegen math inside a diagram is separate from this native article
renderer.

A demonstrated failure was top-level KaTeX 0.19 CSS with rehype-katex's 0.16
rendered markup: tags and layout looked wrong. Matching the top-level KaTeX
renderer/CSS version to the rehype dependency fixed it. Diagnose version/style
mismatch before stacking CSS overrides. Build success alone does not prove math
looks correct; inspect a rendered equation and inline features in the browser.

## Shared image gallery

Use a self-closing literal `ProjectFigure` with quoted string attributes and
integer dimensions in braces:

```mdx
<ProjectFigure src="/images/evidence/projects/windweave/architecture-styled.webp" width={1774} height={887} alt="CPU–GPU streaming architecture" caption="Figure 1. Storage, CPU sample construction, loader prefetch, and GPU computation. The prefetch queue is supplied by PyTorch DataLoader." />
```

Width/height above are this asset's actual metadata, not universal figure sizes.
Use the new file's metadata after any revision. Avoid forced stretching/cropping
of scientific diagrams.

The page currently discovers these figures using a regex over the MDX body. It
expects literal `src`, `alt`, and `width={integer}` / `height={integer}` values;
expression objects or computed URLs will not populate the gallery correctly
without changing that extraction code. The page injects `items`, so MDX should
not supply it. Caption text remains in the article; viewer captions currently
come from the figure's `alt` value.

`ProjectFigure` wraps its image and “View in gallery” text in the shared gallery
trigger. `initialSrc` selects the clicked figure. The gallery combines cover,
inline figures, and evidence records, deduplicated by `src`. Opening a cover or
figure shows a modal dialog in the same page, with next/previous buttons,
arrow-key navigation, Escape close, and focus restoration. Do not reintroduce
`target="_blank"`, full-size links opening another tab, or a separate viewer for
each figure. `ProjectMedia` is the existing evidence-grid component and can
maintain its own relevant evidence selection.

The accepted WindWeave inventory is one new cover, one preserved blue streaming
concept, seven styled diagrams, and two interface previews: eleven gallery
items, ten inline figures. The concept is in Abstract; numbered Figures 1–7
are scientific diagrams and Figures 8–9 are explicitly reconstructed interfaces.
The original artwork is not deleted when the thumbnail changes. Its prior
“on-demand weather training” treatment was superseded by the real-time streaming
subtitle, with old files preserved. Verify current counts before changing tests.

Keep provenance captions close to the media: conceptual artwork, source-derived
architecture, exact toy example, analytical estimate, reconstructed interface,
or actual saved result. Do not claim an imagegen output itself is experimental
evidence.

## Delivery and cache behavior

Public diagram assets are in `public/images/evidence/projects/windweave/`.
Use fresh sibling names for revised accepted images and keep required originals.
Both Next image URLs and source URLs may appear in the viewer; normalize the
`/_next/image?url=...` parameter when asserting that the clicked image is selected.

Regenerate the content bundle after editing MDX:

```powershell
node scripts/bundle-content.mjs
```

Never hand-edit bundled-projects JSON. During this work, old SVG URL responses
were cached in the in-app browser despite reload. New descriptive filenames
resolved the discrepancy. Check image decode and the actual displayed image,
not only the new MDX source. Preserve the healthy dev server; reset its output
only when the actual runtime error justifies it and follow `instruction.md`.

## Validation used for runtime changes

```powershell
pnpm run typecheck
pnpm run lint
pnpm run test:content
pnpm run build
git diff --check
$env:PREVIEW_URL = 'http://localhost:3002'
pnpm exec playwright test tests/project-papers.spec.ts --trace off
```

The browser suite runs at 390px and 1440px, with reduced motion and the installed
Chrome channel. It now checks eight papers, the exact heading/contents contract,
no KaTeX errors or pre blocks, expected equation counts, no page/math overflow,
image decoding, correct cover, retained concept, all seven styled sources,
click-to-selected-image behavior, next/arrow navigation, Escape/focus restoration,
no new tabs, and no browser errors. It saves screenshots under ignored `artifacts/`.
The expected display-equation counts are WindWeave 13, FabricLens 2, EasyShield 3,
Plantini 5, AquaFlow 3, SmartHart 4, TPMS Studio 7 and AlgoBrain 6. Inline figures
are respectively 10, 1, 4, 7, 5, 2, 2 and 3. EasyShield now uses an image cover;
its original artwork is in Abstract and its original demonstration video remains
in the evidence gallery. AlgoBrain also preserves its old artwork in Abstract.

Inspect the screenshots for readability and scientific content. Tests cannot
prove imagegen drew an equation or arrow correctly. Phone/desktop viewport checks
are browser evidence, not physical-device certification. An in-app browser's
app zoom/emulation can yield a different CSS viewport than its visible panel;
use explicit Playwright dimensions for comparable checks.

All of those checks passed for the website changes documented here, with one
existing lint warning in the unrelated welcome policy. Future runs must report
their own evidence rather than inherit that pass claim. A documentation-only
skill edit needs its own script/link/metadata checks, not another website build
or paid imagegen run unless runtime assets also change.
