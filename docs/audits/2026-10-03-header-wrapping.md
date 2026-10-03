# Header wrapping audit — 3 October 2026

## Finding

The shared header reproducibly wraps into two rows between **341 and 402 CSS pixels**, inclusive, with the current name and loaded Inter font. The name is hidden at 340px and below, becomes visible at 341px, and only fits alongside the contact button at 403px and above. The header grows from 65px to 119px in the failing range.

This is a layout breakpoint mismatch. There is no delayed name-hiding code: name visibility is entirely controlled by CSS media queries.

## Root cause chain

1. `src/app/globals.css:214` makes `.nav-inner` a wrapping flex container (`flex-wrap: wrap`).
2. `src/app/globals.css:224` prevents the brand from shrinking. `src/components/liquid-glass.module.css` also prevents the contact button's flex-item wrapper (`.linkScene`) from shrinking.
3. `src/app/globals.css:1629` hides `.nav-brand-name` only at `max-width: 340px` on phones. Above that width, the brand and button can exceed the available row width.
4. The row therefore places the contact button on a second line. No visibility rule reacts to this loss of space.

Measured mobile width budget with loaded fonts:

| Part | CSS pixels |
| --- | ---: |
| Logo | 64 |
| Logo-to-name gap | 10 |
| Full name | 156.21875 |
| Brand total | 230.21875 |
| Contact button and its wrapper | 120 |
| Row gap | 12 |
| Left and right page gutters | 40 |
| Minimum viewport to fit | **402.21875** |

At 390px, only 350px is available inside the container, while the two flex items and gap need 362.21875px. Their failure to fit is deterministic.

There is also a gutter change at 340px: each gutter is 16px at or below 340px and 20px above it. The name reappears at the same boundary where the available horizontal space decreases by 8px.

The contact button's effective geometry comes from `.linkScene .goldenSurface` in its CSS module: it is 120px wide and at least 46px high. The mobile `.nav-cta` rule alone does not describe its final geometry because the module selector has greater specificity. The actual flex child is the wrapper rendered by `LiquidGlassLink`, not the `.nav-cta` anchor.

## Timing, fonts, and shared behavior

- The failure remains after `document.fonts.ready`; it is not dependent on font-loading timing.
- A controlled Arial substitution reduces the brand width to 223.609375px. Its fit requirement becomes 395.609375px, so it fits at 400px where Inter still wraps. Font metrics can change the apparent boundary, explaining why a hardcoded viewport threshold is brittle. This experiment is a metric substitution, not a recording of the site's actual font-loading sequence.
- Both `/` and `/projects` reproduce the same 402/403px boundary.
- The ResizeObserver in `navigation.tsx` measures header and bottom-navigation heights for clearance. It does not hide the brand name. The glass components follow the resulting header geometry; they do not decide name visibility.
- Screenshot bitmap width need not equal CSS viewport width because display scaling and device pixel ratio can differ. The supplied screenshots' exact CSS viewport widths were not available.

## Verification and coverage gap

The audit ran Chromium against the existing development preview at `http://localhost:3002/`, with fonts loaded and reduced motion enabled:

- Every integer viewport width from 280px through 1440px: the only wrapped range was 341–402px, with no document horizontal overflow.
- Targeted checks on both routes at 340, 341, 390, 402, 403, 480, 767, 768, 1100, 1101, 1920, and 2560px confirmed the boundary and found no additional wrap at those sampled widths.
- Existing tests inspect document overflow, header-to-hero clearance, and other content geometry. They do not explicitly check that the brand and contact button share one row. Wrapping satisfies overflow and clearance checks, so this bug can escape them.

Evidence:

- `artifacts/header-audit/baseline.json`: full integer-width sweep.
- `artifacts/header-audit/route-font-checks.json`: route and controlled font checks.
- `artifacts/header-audit/before-360.png`: reproduced two-row header.
- `artifacts/header-audit/fits-403.png`: fitting header at the first passing integer width.
- `scripts/audit-header.mjs`: repeatable investigation script.

The initial audit did not establish behavior at fractional CSS viewport widths, every browser engine, or enlarged text sizes. The initial investigation left application layout code unchanged; the subsequent correction is described below.

## Recommended correction

For the current content and font, hiding the mobile name through 402px would close the measured gap. A small safety margin would account for rounding, but a fixed number would still depend on typography and content.

The durable correction is to base full-name visibility on the header's actual available space, reserving room for the logo, button wrapper, gaps, and desktop navigation where present. Make the single-row layout explicit, with a compact fallback before the name stops fitting. Do not merely turn off wrapping: without correcting visibility, that would produce clipping or overflow.

Regression coverage should assert the brand and button remain on the same row, visible controls do not overlap or escape the container, and the full name is visible only when it fits. Include both sides of the current boundary, resize in both directions, font changes, and shared routes.

## Correction applied

The header now keeps its controls on a single flex row. A ResizeObserver compares the full intrinsic name width, logo, other visible controls, and gaps against the available row width, with a 1px rounding margin. It observes the label even while hidden, so font changes and resizing can update the decision without a visibility feedback loop. The initial render uses the compact header until measured. Both fixed name-hiding media queries were removed.

`tests/header-fit.spec.ts` checks resizing in both directions, the original failing interval, shared home/projects layouts, containment and separation of controls, and name visibility after a font-size change without resizing the viewport.
