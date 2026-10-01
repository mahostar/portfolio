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

## Review notes

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

- Existing mobile artwork crops out J1. Anchor selection must use components
  actually present in each crop or re-export the crop and regenerate its mask.
- Identity and experience continue to come from existing owner-provided data.
  No new tools, dates, employers, or project claims are inferred.
- Native iOS/Safari, Firefox, and real Android-device validation remain part of
  P7; desktop Chrome emulation alone cannot establish those acceptance gates.
