# Signal Path implementation — 2 October 2026

The lower-page redesign is implemented. The complete first section remains locked.
Claude's full blueprint is retained in `signal-path-handoff.md`, with the owner's
protection and execution instructions taking precedence.

## Recovery and scope

- The owner's pushed recovery is `origin/main` at `4cf0e1`. Its source tree matches
  the local starting commit `05c15fb` ("staable").
- Hero source, assets, background framing, portrait, tags, ticker, root styles,
  root fonts and layout were not edited. Shared navigation keeps its approved
  appearance while the hero is visible.
- New CSS modules scope the design below the hero. Motion and its hero provider
  remain. Achievement media, the source ZIP and expansion plan are untouched.

## Implemented

- Navy, cobalt and yellow visual system, numbered editorial sections, responsive
  typography and spacing, and a desktop section rail.
- Selected-work cards with data-driven circuit schematics, factual pipelines,
  real technology logos and hover/focus/touch signal effects. Real cover images
  still render when supplied instead of placeholder SVGs.
- Editorial biography, circuit-to-product chain, revised journey and interests,
  and four compact archive cards. Previous workshop descriptions remain in
  expandable details rather than duplicate cards.
- Five-domain toolkit with keyboard tabs, mobile scrolling, real project links,
  measured desktop wiring and section-entry animation. The integrated toolkit
  replaces the development-only skill-tree route.
- Lower-page sliding navigation indicator, complete section grouping, mobile
  scroll behavior and persistent motion control that never pauses the hero.
- Project-page indicators are measured after font loading and resize; case-study
  section numbers have readable contrast. Narrow contact and story links wrap
  without horizontal overflow at 200 percent text enlargement.
- Dark contact section and footer. Form validation and retained input on failure
  remain; a real email link appears if sending fails. Test submissions are mocked.
- Certificate viewer with Escape, focus containment and focus restoration.
  Pending evidence slots remain truthful.
- PNG social images for the homepage and every project, using existing facts and
  a separate portrait derivative. Original portrait assets are unchanged.
- Lower motion caches repeated geometry, skips offscreen journey work, cleans
  up observers and respects reduced motion. The header shader stops drawing when
  the opaque lower-page navigation is active.

## Verification

- Production build, TypeScript, ESLint and all 7 content tests pass.
- All 68 browser tests pass in the final complete-suite run, including the
  original regressions and new isolation checks: 11 primary viewports from
  320×568 through 3440×1440, additional widths down to 280 pixels, dense width/
  height sweeps, 200 percent text enlargement, phone emulation, navigation/shader
  fallback, keyboard toolkit behavior, project filtering/routes, modal focus,
  contact success/failure/spam handling and hero isolation.
- Axe reports zero violations in the redesigned content and footer at desktop
  and phone widths. This is automated coverage, not a manual accessibility audit.
- Hero geometry and text exactly match the stable fixture at 390, 1440 and 3440
  pixels. The 390 screenshot is an exact pixel match; desktop differences are
  under 4 levels per color channel with unchanged dimensions and geometry.
- Eight project pages respond successfully; production `/test-dev` returns 404;
  homepage and project social-image endpoints return PNG images.
- Desktop and phone production screenshots were inspected for every lower section.
- Evidence: `artifacts/signal-path/final/` (ignored generated files), including
  section screenshots, hero comparisons and Lighthouse JSON reports.

## Current mobile performance

The saved stable source was separately exported, built and served on port 3003;
the redesign was built and served on port 3002. Sequential mobile Lighthouse
audits used the same local setup. These single-run results are not a statistically
significant performance comparison.

| Metric | Saved stable | Redesign |
| --- | ---: | ---: |
| Performance | 77 | 78 |
| Accessibility | 100 | 100 |
| Best practices | 96 | 96 |
| SEO | 100 | 100 |
| LCP | 4.790 s | 4.584 s |
| Total blocking time | 62.5 ms | 39.5 ms |
| Layout shift | 0 | 0 |

The plan's mobile performance target is not met. Lighthouse identifies the locked
hero artwork as the LCP element; its rendering and assets remain intact.
Both reports completed with valid audit results and no Lighthouse runtime error,
then the CLI returned a Windows temporary-directory cleanup permission error.

## Remaining practical limits

- Real Safari/iOS, Firefox and physical Android hardware have not been tested.
- The owner's organized images/videos and pending certificate evidence are still
  needed. No credentials, dates or results have been invented.
- Production email requires existing deployment credentials; the email link
  remains usable. No unconfigured CAPTCHA or distributed rate-limit service was added.
- The future full media-gallery/content expansion is not implemented; existing
  cover, image and video support remains available.
- Local production preview: `http://localhost:3002`. The stable comparison server
  is stopped; the existing development server remains on port 3000.
