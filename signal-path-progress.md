# Signal Path implementation

The requested review checkpoints are P2, P3, and P4. This pass completes P0–P2
and pauses at the first checkpoint. Later phases remain pending review.

## P0 — baseline and cleanup

- Starting workspace passed TypeScript, ESLint, and the production build.
- Baseline production screenshots cover all 11 requested viewport sizes.
- Lighthouse: mobile 87 performance / 100 accessibility / 100 best practices /
  100 SEO; LCP 3.74s; CLS 0. Desktop scores 100 throughout; LCP 0.75s; CLS 0.
- Four-times CPU throttled Chrome trace recorded alongside Lighthouse reports
  in `artifacts/signal-path/baseline/` (generated artifacts are ignored).
- Removed unused ImpactShowcase, badge, and tooltip components. Impact data
  remains available to the experience archive.
- `/test-dev` returns notFound in production until the P4 migration.
- Editorial validation already existed; it now checks all content source files
  through `scripts/lint-content.mjs`, invoked directly by prebuild.
- Formatted app and component sources with pinned Prettier.
- Preserved the existing portfolio revision as part of the P0 checkpoint;
  unrelated achievement media, ZIP archive, and expansion plan are excluded.

## P1 — foundation

- Shared color, fluid type, and motion tokens are in `src/app/tokens.css`.
- The three overriding stylesheets are consolidated into scoped hero, nav,
  card, and section modules. Shared resets and utilities stay in globals.
- Archivo loads its variable width axis; headings use readable tracking and
  word spacing. JetBrains Mono replaces platform-dependent monospace fonts.
- Removed MotionProvider and Reveal; native CSS and the shared WAAPI reveal
  helper handle UI animation. The legacy tree uses SVG/CSS while awaiting P4.
- The ticker control pauses site motion, persisted when storage is available.
  Reduced motion takes precedence. The old hero canvas observes that switch
  until its P2 removal; the header shader remains scheduled for P3.
- Typecheck, lint, production build, and the 11-size screenshot pass succeed.
  Reports are in `artifacts/signal-path/P1/`.

## P2 — anchored hero

- Replaced the random trace canvas, diamond planes, and bloom layers with a
  single responsive artwork stage, static copper masks, and SVG route pulses.
- Desktop and phone backgrounds share verified image coordinates with the
  callouts. The phone crop was regenerated to include J1. Initial CSS anchor
  placement also works with JavaScript disabled; ResizeObserver maintains the
  same cover projection after resizing.
- Added one smoothed pointer field for the name spotlight and portrait tilt.
  It sleeps offscreen, when hidden or paused, and when input is idle. Touch and
  reduced-motion users receive the static composition.
- The session intro finishes within 1.55 seconds. The portrait stays visible,
  and hover, keyboard focus, or tap replays a callout's pulse and reveals proof.
- Stats come from project and technology data: 8 projects, 5+ years since 2021,
  and exactly 16 technologies. IoT, AI, and PCB proof links derive from project
  MDX technology lists. Robotics remains `TODO(owner)` because no corresponding
  case study exists; the owner's acknowledgement did not identify one.
- Reproducible image and mask scripts use the original PNG sources. Backgrounds
  are 150.8 KiB desktop / 135.5 KiB mobile, portrait 65.7 KiB, and masks under
  60 KiB each. Masks preserve the exact source aspect ratios.
- Added a local coordinate picker and strict anchor schema validation. Pulse
  endpoints project to their callout dots within one CSS pixel. The routes are
  hand-routed approximations; exact copper fidelity remains a visual review item.

### Validation and evidence

- TypeScript, ESLint, production build, and 7 content tests pass.
- All 8 dedicated production-browser tests pass: phone first-screen content,
  responsive crop loading, anchor projection, proof interactions, session intro,
  global motion persistence, storage failure, keyboard access, forced colors,
  reduced motion, axe accessibility, and production `/test-dev` isolation.
- All 11 requested viewport sizes have screenshots with no horizontal overflow
  or page errors. Reviewed phone, tablet, desktop, and ultrawide compositions.
  The full legacy browser suite was not run; some assertions refer to the old UI.
- Production evidence lives in ignored `artifacts/signal-path/P2/`: viewport and
  full-page PNGs, `hero-motion.webm`, `no-javascript-390.png`, interaction capture,
  Lighthouse reports, CPU trace, module budget, and acceptance metrics.
- In the final three seconds of the CPU-4x trace, renderer main-thread work has
  a median of 0.049 ms per 16.7 ms bin, no tasks over 50 ms, and no Paint events.
  This trace estimate does not establish real-device INP or refresh-rate behavior.

| Production Lighthouse                | Baseline mobile |       P2 mobile | Baseline desktop |      P2 desktop |
| ------------------------------------ | --------------: | --------------: | ---------------: | --------------: |
| Performance                          |              87 |              87 |              100 |              99 |
| Accessibility / best practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |  100 / 100 / 100 | 100 / 100 / 100 |
| LCP                                  |          3.74 s |          4.11 s |           0.75 s |          0.87 s |
| CLS                                  |               0 |               0 |                0 |               0 |

Hero-owned emitted JavaScript is approximately 3.5 KiB gzip, excluding shared
React and Next.js code. Whole-page script transfer is 177.7 KiB including HTTP
overhead. The final mobile performance >=90, LCP <=2.2 s, and initial-JS <=130 KiB
gates are not met. No 9/10 or release-ready claim is made at this checkpoint.

Reproduce against a production server on port 3001:

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm test:content
pnpm exec next start -p 3001
# In another terminal:
pnpm exec playwright test --config tests/signal-path.config.ts
node scripts/signal-audit.mjs P2
```

## Review checkpoint and remaining phases

P0 is committed as `e315625`; P1 as `c469a78`. P2 is the current review checkpoint.
Review `viewport-390.png` and `viewport-1440.png` before continuing to P3. P3–P7
remain pending, including the header shader replacement, skill-tree migration,
later section refinements, dependency pruning, and final performance work.

Identity and experience continue to come from existing owner-provided data.
Native iOS/Safari, Firefox, real Android-device testing, and real INP measurement
remain outstanding; desktop Chrome emulation cannot establish those gates.
