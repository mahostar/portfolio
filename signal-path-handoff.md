> **Owner override — 1 October 2026 (takes precedence over the blueprint below)**
>
> Keep Claude's Signal Path design specifications. Redesign everything below the first section substantially; the old lower design does not need preserving. Build complete, robust components and verify the actual desktop/mobile result.
>
> **The entire first section is locked: nobody changes `#home`, its background/framing/motion, name, portrait, yellow tags, stats, ticker, layout or responsive behavior.** Shared styles, fonts, providers, data and navigation overlays must not change it indirectly. P2 and both hero appendices below are retained as reference only, not execution tasks.
>
> Apply P1 tokens, typography, CSS ownership and motion improvements to the lower sections through scoped styles/components. Keep hero dependencies and imports; do not remove Motion or its provider while the hero uses them. A lower-page motion control pauses lower-page effects; it must not repurpose the hero ticker.
>
> Follow the P3–P6 visual blueprint below: cobalt navigation, sliding indicators, the five-domain skill board, signal-based card interactions, editorial story/interest sections, rail and polished footer. Preserve the header/bottom-bar appearance and clearance while the hero is visible. Unconfirmed capabilities, credentials and project pipelines must not be invented. Keep contact usable without unavailable external services.
>
> The owner has already pushed the stable recovery version. Continue the authorized lower redesign without stopping for routine phase approvals, and save the redesign separately from that recovery point. Work component by component; replace working features completely before deleting old code. Use quick visual checks during work and meaningful final functional/build checks. The old P2/P3/P4 stop-for-review instructions are superseded by this execution authorization.
>
> Compare the hero before/after and repair every attributable regression. Never reset the owner's tree or reapply rejected phase commits. Historical measurements below are not current results.

# PLAN: Mouhamed Wassim Mbarek portfolio — Signal Path continuation

> **Owner refinements — 2 October 2026:** Keep the original desktop blue-glass
> navbar and rounded active pill, removing the added rectangular/sliding
> selection. Keep the phone bottom bar white with a soft gray selection. Restore
> the connected node tree with short tags and shared, orderly routes. Compact
> every lower section and phone heading. Apply the owner's marked removals,
> simple titles, yellow project CTA, fact icons, centered timeline, compact
> interest cards and image-led milestones with short bottom captions. The hero
> remains locked. These instructions supersede conflicting visual details below.

## Read first: current state and owner corrections

Work in E:\portfolio. This is a continuation, not permission to repeat the rejected redesign. Read AGENTS.md and the relevant installed Next.js guides before writing code. The current project uses Next.js 16.3.7, React 19.3.0 and pnpm.

### Completed work removed from the remaining task list

P0 remains completed:
- Baseline production screenshots at all 11 viewport sizes, Lighthouse mobile/desktop, and a CPU-4x Chrome trace were recorded in artifacts/signal-path/baseline/.
- src/app/test-dev/page.tsx calls notFound() in production. Keep that guard until P4 removes the route.
- Unused ImpactShowcase, ui/badge.tsx and ui/tooltip.tsx were removed. Impact data remains because ExperienceArchive uses it.
- scripts/lint-content.mjs validates schemas and editorial rules across src/content. package.json invokes it through prebuild. scripts/check-content.mjs is the compatibility wrapper. Do not repeat or remove this work.
- Prettier configuration and source formatting were added. Prettier is installed.

The historical baseline passed typecheck, lint and build. Lighthouse baseline: mobile Performance 87, Accessibility 100, Best Practices 100, SEO 100, LCP 3.74 s, CLS 0; desktop scores 100, LCP 0.75 s, CLS 0. These are historical baseline results, not verification of the current restored working tree.

### What remains in the current source

- P1 was implemented and then reverted at the owner's request. Its tokens, CSS modules, variable-width typography changes, WAAPI replacement and global motion switch are absent. P1 therefore remains pending; do not mark it complete because its old commit exists.
- Most of P2 was also reverted. The original hero markup, portrait placement, yellow tags, stats, fonts, three stylesheets, HeroMotion, MotionProvider and Motion dependency are restored.
- Keep the new background graphics: src/components/hero-circuit.tsx now renders copper-mask lighting and SVG pulses; src/app/pcb-motion.css supplies their styles; src/app/layout.tsx imports that stylesheet; src/content/hero-paths.ts holds five image-space routes; public/images/hero-traces-mask.webp and hero-traces-mask-mobile.webp exist.
- The random trace canvas was replaced. The route lines are approximations and still need visual checking against the real copper.
- scripts/make-trace-mask.mjs, scripts/trace-picker.html, HeroStage.tsx, hero-meta.generated.json, the anchor tables, pointer-field hook and dedicated P2 browser tests were removed during restoration. Restore only needed tooling; do not recreate the rejected hero redesign.
- Original images are restored: desktop 1983×793; phone 650×793, corresponding to the source crop at x=1150. The phone SVG translates route x-coordinates by 1150. Do not use the discarded x=960 / 1023px crop assumptions.
- Current background override: desktop >=768px uses proportional cover centered in the original-height hero; phone uses fill, with a matching stretched mask and SVG. Desktop can crop; phone can distort. Background presentation remains unresolved and is the owner's main concern. Do not claim it is accepted or fully restored visually.
- Current hero shows 8+ projects, 5+ years and 14+ technologies, while the toolkit has 16 tools. The stat correction from P2 was reverted and remains pending.
- Old diamond blueprint planes and bloom markup/styles are back with the restored hero. Further removal needs the owner's visual review.
- src/components/hero-motion.tsx no longer contains the forced head-alignment sizing effect. The last viewport-dependent height override was removed. Preserve that removal.

### Owner's latest instructions override the original plan

1. Preserve the original hero's height, content layout, name styling and portrait placement. Do not increase its height to fit the background's aspect ratio.
2. Keep the yellow IoT, AI, Robotics and PCB tags around/beside the portrait. Do not replace them with dark boxes positioned on PCB components. Original order: IoT, AI, Robotics, PCB.
3. Keep the copper-light motion graphics. Improve their implementation without redesigning the hero.
4. Background priority: preserve the image's proportions and detail; show as much as possible; fill the hero edge to edge. Do not use forced zoom, stretch on wide screens, blue side strips, or a new crop solely to put a chip behind the head.
5. The large square chip may sit behind the head when it naturally fits. This is optional; it must not drive scaling or alter layout.
6. A fixed-height container with a different aspect ratio cannot simultaneously show the entire image, fill every edge and preserve proportions. Explain the concrete tradeoff and show a proposed framing before changing geometry. Do not silently switch between cover, contain, fill and aspect-ratio-driven height.
7. The current background framing is not an approved baseline. Compare against the original baseline captures and obtain a concrete framing review before further background changes.
8. The owner requested that the redesign be reverted except for background motion. Do not automatically reapply rejected P1/P2 visual changes. Typography or other visible changes require a focused preview/review.
9. Do not invent a robotics case study. The owner answered “ok” to a missing-project question; that did not identify a proof link. Use TODO(owner) if a robotics proof is needed.

### Repository and preview context

Historical commits: e315625 = P0/source baseline; c469a78 = rejected P1 implementation; d6e14d2 = rejected P2 implementation. Later restores and background fixes are working-tree edits. Preserve them; inspect before committing. Do not reset, checkout or reapply an entire phase commit. The original request started with substantial owner changes; do not reset to the older 0c0bd04 commit.

Leave unrelated Achivments/, portfolio-expansion-plan.md and src.zip alone. Do not stage them.

Development preview: http://localhost:3000/. Port 3001 was a production build and can still display stale compiled output. Start a dev server if absent; terminal use was subsequently authorized. Do not mistake a stale production page for current source.

The post-restoration tree has not had a full build/browser/performance audit. Earlier P1/P2 reports describe versions that were reverted. Revalidate after approved changes. Do not claim 9/10 or all budgets met from old reports.

## 0. Operating rules for the agent

- P0 is complete. Continue with the remaining phases P1 to P7, subject to the owner corrections above. **One commit per phase.** Preserve current uncommitted restoration work; never stage unrelated owner files. After each phase run `tsc --noEmit`, lint, `next build`, then Playwright screenshots (matrix in P7).
- **Do not invent facts, tools, numbers or copy.** If a fact is missing, mark it `TODO(owner)` and ask. The existing editorial rules stay (`bannedWords` in `src/lib/content-schema.ts`: no "expert", "best", "passionate", etc.).
- Keep the content schema (Zod) strict. Keep the existing accessibility work: reduced-motion fallbacks, forced-colors, focus rings, skip link, `dialog` focus trap. Do not regress these.
- Animate only `transform`, `opacity`, `clip-path`, and SVG `stroke-dashoffset`. Never animate `width`, `height`, `top`, `left`, `filter` on large layers, or `box-shadow`.
- Placeholders (SVG covers, "coming soon" cards) are known and temporary. Do not polish them as final art, but build every component so real media drops in through data only.

## 1. Diagnosis to recheck against the current restored source

**D1. The retained motion needs integration, not another redesign.** The restored hero again includes the original portrait, yellow tags, diamond blueprint planes and bloom, while its random canvas has been replaced by copper-mask lighting and SVG pulses. Evaluate competing layers through a focused preview; preserve the owner-approved composition.

**D2. The random-trace canvas has already been replaced.** Copper masks and image-space SVG pulses exist in hero-circuit.tsx and pcb-motion.css. Verify their fidelity and alignment; do not recreate them from scratch.

**D3. Background framing is unresolved.** Keep the yellow tags beside the portrait. Their connectors are portrait labels, not claims that they identify PCB components. Ensure the background, mask and pulse SVG share one projection without forcing the chip behind the head.

**D4. Pointer behavior is still the original unsmoothed code.** The background override is now static, but HeroMotion still drives portrait/name pointer effects directly. The shared smoothed hook was removed during rollback and remains pending.

**D5. Image priority needs rechecking after rollback.** The hero uses getImageProps/picture for responsive backgrounds, high-priority eager loading and portrait preload. Restore one visible high-priority background and auto-priority portrait. Keep portrait opacity at 1; do not reintroduce an invisible LCP element.

**D6. The skill tree is the wrong shape.**
- It spends about 600px to show a list of 16 items.
- "Hardware and PCB" has 1 node while others have 4, which leaves a hole.
- Every tool shows a "↗" arrow that opens nothing.
- The root button says "Show the whole toolkit" but clears the selection, so nothing lights up.
- The wires draw on mount, before the section is visible.
- It still lives in `src/app/test-dev/`; P0 already blocks that route in production.
- Mobile becomes a long vertical scroll.
- The data is thin: no agents, no LLM, no prompt-engineering tooling, and "PCB design" is one vague node.

**D7. The scrolled header turns dull slate.** `rgb(11 25 68 / .76)` over white computes to about `#455071`. That kills the brand cobalt exactly when the user starts reading. The WebGL shader in `navigation-glass.tsx` contributes at most about 16% alpha. A CSS gradient looks the same, so it is a GL context plus a draw per scroll for nothing.

**D8. Navigation is mislabeled and mobile is crowded.** "Impact" stays lit over Stack, Beyond Engineering and Certificates. The mobile hero hides the "View projects" button (`.hero-project-link { display:none }`). Mobile also stacks a 64px top bar and a 64px bottom bar.

**D9. Heading tracking is too tight.** Archivo 800/900 at -0.06 to -0.075em collapses the word spaces. "Featured Projects" and "What I work with" read as one word.

**D10. Multiple animation systems and overlapping styles remain.** CSS, hand-written WAAPI, Motion and header WebGL are back in the restored source. The random canvas is gone. globals.css, motion-design.css and refinement.css remain, with an additional pcb-motion.css import. Consolidate ownership while preserving the restored appearance.

**D11. Sharing and trust gaps remain.** Check project SVG OG images, the home OG image, contact env configuration and bot protection. Dead-code cleanup and editorial build validation are already complete; do not repeat those items.

**D12. Number inconsistency.** The hero says "14+ technologies" (derived from project tags). The stack says "16 tools". "8+ projects" undersells the real portfolio.

## 2. Vision and philosophy: "Signal Path"

**The feeling:** the first second should feel like powering up a board. The screen is dark and quiet, then light flows through real copper, the name resolves, and the labels snap on like LEDs when the signal reaches them. After that the site is calm, precise and confident, like an instrument panel. Nothing bounces. Nothing wobbles. Nothing moves without a cause.

**One metaphor, applied everywhere: electricity moving along a trace.**
- Hero: light runs through the real traces; preserve the yellow portrait-side labels.
- Nav: the active-section indicator slides like a signal moving to the next node.
- Skills: a wire connects the selected domain to its panel.
- Cards: hovering lights the pipeline nodes in sequence.
- Page: a thin "bus" rail fills as you scroll.
- Timeline: already circuit-like. Keep and unify.

**Motion laws (non-negotiable):**
1. **Causality.** Every animation is triggered by arrival, hover, selection or scroll. No decorative loops except the one ambient hero breath.
2. **One hero moment per viewport.** If two things compete, delete one.
3. **Restraint.** Idle motion has a maximum amplitude of 4% opacity or 6px. Interaction motion may be bold.
4. **Signals move linearly; objects move with deceleration.** Signal pulses use `linear`. UI elements use the expo-out curve.
5. **Respect the user.** One global motion switch (pause + `prefers-reduced-motion`) controls everything.

**What the visitor should think:** "this person builds hardware and software, and cares about detail." Not "nice template."

## 3. Proposed design tokens (P1 pending; preserve the current visual baseline)

**Color (hex for reference; use OKLCH gradients with `in oklch` and a hex fallback so blues do not go muddy):**

| Token | Value | Use |
|---|---|---|
| `--ink-950` | `#050D26` | deepest backgrounds, footer |
| `--navy-900` | `#0B1944` | text on light, dark sections |
| `--navy-800` | `#102557` | dark gradients |
| `--cobalt-700` | `#0139B4` | hero base (existing) |
| `--electric-500` | `#1F3BFF` | links, active states, progress |
| `--sky-300` | `#9BD2FF` | trace light |
| `--ice-100` | `#D4E8FF` | hairlines on dark, outline text |
| `--signal-400` | `#FFD400` | accent, CTA, active dots |
| `--signal-200` | `#FFE568` | pulse heads, hover |
| `--paper-50` | `#F7F9FE` | light section background |
| `--line` | `#D6DEEF` | borders on light |

Yellow is used for energy, primary actions, the name period, and the original yellow portrait-side tags. Keep those tags; the owner explicitly prefers them.

Category accents for project schematics: AI+Edge `#7FD8FF`, IoT+Hardware `#7CF2C2`, AI+IoT `#FFD400`, Electronics+BCI `#B9A8FF`.

**Type proposal:** These changes were tried and reverted. Keep current Archivo 800/900 and Inter initially. Preview and review any reintroduction of width-axis, tracking or mono changes before applying them site-wide.
- Display: **Archivo**, variable, with the `wdth` axis loaded through `next/font` (`axes: ["wdth"]`). Hero name `wdth 108–112`, section titles `wdth 100`. Weight 800. Tracking **-0.035em** for titles (hero name -0.045em), plus `word-spacing: .06em`.
- Body: **Inter**, `font-variant-numeric: tabular-nums` on stats and dates.
- Mono: replace every `ui-monospace` with **JetBrains Mono** (400/500) via `next/font`. Right now the mono font changes per OS and breaks the "engineering" tone.
- Fluid scale with `clamp()`: `--step--1 … --step-6`. Hero name is already container-fit. Keep that logic.

**Motion tokens:**
```css
:root{
  --ease-out: cubic-bezier(.16,1,.3,1);
  --ease-in-out: cubic-bezier(.65,0,.35,1);
  --ease-signal: linear;
  --t-micro: 160ms; --t-ui: 380ms; --t-enter: 700ms; --t-hero: 1200ms;
  --stagger: 70ms;
}
```

## 4. Phases

### P1. Foundation — pending after rollback
1. Add `tokens.css` (§3). Replace hard-coded hex in the three CSS files with tokens as you touch them.
2. Merge `motion-design.css` and `refinement.css` into the owning feature modules: `hero.module.css`, `nav.module.css`, `cards.module.css`, `sections.module.css`. One selector, one definition. Remove the dead `name-enter`, `portrait-enter`, `sticker-enter` and old `bloom` rules in `globals.css`. `globals.css` keeps only reset, tokens usage, layout primitives and utilities.
3. Preserve the restored fonts and hero sizing during consolidation. Check word gaps at 1440 and 390. Preview any typography correction separately; do not automatically reapply the reverted JetBrains Mono/Archivo-width changes.
4. **Reduce animation systems to two:** CSS keyframes/transitions and one small WAAPI helper (`src/lib/reveal.ts`, from `portfolio-motion.tsx`). Remove `motion`, `LazyMotion`, `MotionProvider`, `m.div` in `HeroMotion`, and `Reveal` (replace its usage with the data-attribute reveal that `PortfolioMotion` already provides). Remove the dependency from `package.json` after P4 replaces `m.path`.
5. Add the **global motion switch**: `html[data-motion="paused"]` pauses every CSS animation (`animation-play-state: paused !important`) and stops the rAF loops. It is initialized from `prefers-reduced-motion` and `localStorage` (try/catch, may be empty). The ticker's pause button now toggles this global switch. The ambient hero animation runs longer than 5 seconds, so this satisfies WCAG 2.2.2.

### P2. Finish the retained hero motion without rebuilding its layout

**Existing work:** copper-mask lighting, SVG pulses, five image-space routes and both masks are present. Preserve them and the original yellow portrait tags. The earlier HeroStage/callout/layout implementation was rejected and removed.

**2.1 Background framing and coordinate consistency**
- Begin with a review of background framing at phone, desktop and ultrawide sizes. Keep the original hero height and portrait layout.
- Preserve image proportions. Do not force the chip behind the head, add extra zoom, stretch wide-screen artwork or add solid blue side strips.
- Show the tradeoff when full image visibility conflicts with edge-to-edge coverage at the existing section height. Do not resolve it by silently changing hero height.
- Desktop source: 1983×793. Mobile source: 650×793, x=1150 crop offset. Verify the source before changing projection.
- Keep the background, trace mask and SVG using identical sizing, alignment and offsets. Choose projection only after the framing review.
- For proportional cover, use exact math:
```ts
export function coverPoint(u: number, v: number, box: { w: number; h: number }, img: { w: number; h: number }, align = { x: .5, y: .5 }) {
  const s = Math.max(box.w / img.w, box.h / img.h);
  const dw = img.w * s, dh = img.h * s;
  return { x: (box.w - dw) * align.x + u * dw, y: (box.h - dh) * align.y + v * dh };
}
```
- Centered cover matches SVG preserveAspectRatio="xMidYMid slice"; right-center cover matches "xMaxYMid slice"; contain uses "meet". Nonuniform fill uses "none" and distorts the artwork; do not use it as a wide-screen fix.
- Image-space anchors may be used internally for pulse endpoints. They must not reposition the yellow portrait tags onto PCB components.
- Restore a local scripts/trace-picker.html if needed to refine the existing routes. All route lines must follow visible real copper; do not claim precise alignment without checking it.

**2.2 Ambient copper lighting — partially implemented**
- Reuse public/images/hero-traces-mask.webp and hero-traces-mask-mobile.webp first. Their existence is complete; fidelity and performance remain to be checked.
- Restore scripts/make-trace-mask.mjs from Appendix A for reproducible maintenance, not as a reason to recrop or re-encode accepted images.
- Use alpha masks, never mask-mode: luminance. Tune noise, text and chip-body exclusion by eye.
- One masked light and one low-opacity 9-second sweep; animate transform only. Keep the mask static.
- Profile with CPU throttling. If Safari repaints the masked layer every frame, use a visually equivalent half-resolution canvas gradient/mask fallback. Do not replace the accepted copper effect with random traces.
- The photo and mask must share their projection exactly, including the chosen alignment.

**2.3 Narrative pulses — partially implemented**
- Existing route paths use pathLength="100", dasharray 8 200, dashoffset 8→-100, plus a wider low-alpha duplicate. Retain this approach; no SVG animated filter.
- Intro emits staggered pulses from the chip. Refine the existing routes rather than redrawing arbitrary viewport-space paths.
- If adding hover/focus/tap behavior to the yellow tags, keep their current visual treatment and portrait-relative placement. A selected route may replay and a one-line proof may appear without moving or replacing the label.
- Proof must derive from real project MDX tech arrays. IoT has ESP32/Plantini, AI has PyTorch/EasyShield, PCB has PCB design/AlgoBrain BCI. Recheck current MDX before relying on these links. Robotics remains TODO(owner).
- Further removal of the restored blueprint planes/bloom should be shown as a focused preview. Do not make another broad hero redesign. Keep any retained portrait glow static.

**2.4 Shared smoothed pointer field — pending after rollback**
- Implement src/lib/use-pointer-field.ts using Appendix B. One frame-rate-independent lerp loop, default .08 per 16.7 ms.
- Write --lx, --ly, --mx, --my. Sleep when idle, offscreen, hidden, paused or reduced motion is requested.
- Consumers: copper light, existing name spotlight, and at most ±8px portrait tilt. Keep the name spotlight. Cache its rect; no layout read inside rAF.
- Background remains static. Touch receives the ambient sweep and any approved tap-to-signal behavior.

**2.5 Intro — pending after rollback**
- Once per session, storage in try/catch, skipped for reduced motion.
- Full content visible initially. Optional artwork-only veil .55→0 over 600 ms must not hide the background LCP element.
- Name resolve 0–700 ms; portrait translateY(18px)→0 from 150–800 ms, opacity always 1.
- Route pulses stagger from about 500 ms and finish by 1300 ms. Yellow label feedback must preserve their placement.
- Stats count from 1100–1550 ms, 450 ms expo-out, so the total intro actually satisfies the <=1.6-second limit. The original 1800 ms count end contradicted that limit.
- Pausing or hiding the page must finish the counters to truthful final values.

**2.6 Loading and performance — pending after rollback**
- Keep getImageProps + picture with one visible crop. One high-priority background; portrait fetchPriority auto, without preload. Do not fetch the unused crop.
- Budget: each background <=180 KiB, portrait <=120 KiB, masks <=60 KiB each; hero-owned client JS <=12 KiB gzip.
- Current original high-quality images were restored. Optimize from original PNGs only if required, preserve accepted composition/detail, and compare before/after quality. Do not repeatedly compress an already compressed asset.
- Keep a CSS color/gradient fallback.

**2.7 Mobile hero — layout changes require review**
- Preserve the original compact portrait, yellow tags and section height initially. The previously implemented full-viewport grid was rejected; do not restore it automatically.
- The original mobile View projects CTA is hidden again. Show a proposed compact CTA arrangement at 390px before changing the accepted layout.
- Aim to show name, portrait, stats and approved CTA in the first view at 320×568, 360×740, 390×844 and 430×932. Resolve any conflict through a reviewed layout, not unilateral height changes.
- Maintain reduced motion, forced colors and correct mobile mask/pulse projection.

### P3. Header and navigation
1. **Delete `navigation-glass.tsx`** and the WebGL shader. Keep the 2px scroll-progress bar, driven by the single shared scroll handler (§P5.4).
2. Header states, controlled by `data-scroll-state`:
   - top: transparent over the hero (`#0139B4` match is fine).
   - scrolled: `background: color-mix(in oklab, var(--navy-900) 92%, var(--electric-500))` + `backdrop-filter: blur(14px) saturate(140%)` + a 1px `--ice-100` at 12% bottom border. Verify by screenshot over white sections that it is **deep navy-cobalt, never gray**.
3. **Sliding active indicator** on desktop: one absolutely positioned pill; set `transform: translateX(offsetLeft) ; width: offsetWidth` from the active link; `transition: transform var(--t-ui) var(--ease-out)` (update width immediately; do not animate width). Recompute on resize and font load.
4. **Fix the spy:** map sections to nav groups instead of "last item section above 38% of the viewport":
   - Home → `home`; Work → `work`; About → `about`, `journey`, `interests`; Proof (rename from "Impact", icon `BadgeCheck`) → `impact`, `skills`, `certificates`; Contact → `contact`.
   - Reorder `src/app/page.tsx` so Beyond Engineering sits right after Journey (personal story stays with About). Sections become: Hero, Work, About, Journey, Beyond (dark interlude), Stories, Stack, Certificates, Contact.
   - Footer links follow the same names.
5. **Mobile:** hide the top bar on scroll-down and reveal on scroll-up (`transform: translateY(-100%)`, 280ms). Remove the top "Let's build" button on mobile (the bottom bar has Contact). Header height 56px. Keep `env(safe-area-inset-*)` handling. The bottom bar gets the same sliding indicator (horizontal, 3px yellow bar on top).

### P4. Skill board (replace the tree)

Move to `src/components/skill-board.tsx` (client). Delete `src/app/test-dev/` and `skill-tree.module.css` leftovers.

- **Desktop (≥ 900px):** two columns, `340px | 1fr`.
  - Left: five domain rows (64px, icon, number, title, port dot on the right edge). The active row is `--electric-500`/cobalt with a `--signal-400` port.
  - Right: a navy dotted-grid panel containing the active domain's tools as chips (logo + name), the domain's one-line description, and a **"Used in" row** that links to project pages. Compute it from each MDX's `tech` array. Do not hand-write it. If a tool is used in 0 projects, the row is hidden.
  - One routed wire from the active row's port to the panel's left edge. Reuse the existing `route()` rounded-orthogonal function. Re-measure on resize, font load, and active change. The wire draws in over 450ms with `stroke-dashoffset`, and a single signal dot travels it once. Trigger the first draw with an `IntersectionObserver` (not on mount).
- **Mobile (< 900px):** a horizontally scrollable `tablist` (scroll-snap, edge fade masks, the same sliding indicator). The panel sits below with a 2-column chip grid. No wires on mobile, only a 2px accent line under the active tab.
- **A11y:** real `role="tablist"/"tab"/"tabpanel"`, roving tabindex, arrow keys, Home/End. Chips are links only if they go somewhere. **Remove every fake "↗".**
- Replace `m.path` with CSS (`stroke-dashoffset` transition) so the `motion` dependency can be removed.
- **Data:** keep the five groups and 16 tools. Add owner-confirmed capability chips with no brand logo, shown as text chips (`TODO(owner)` to confirm names): "Agent swarms", "Prompt engineering", "Edge inference". Split "PCB design" into the real EDA and CAD tools the owner uses (read `src/content/projects/*.mdx` and the CV, otherwise `TODO(owner)`).
- Make the hero stat "technologies" and the stack count come from one source (`src/content/tech.ts`).

### P5. System-wide polish

**5.1 Project cards (the owner likes these; keep the structure).** Replace `<Image src=".svg">` covers with a data-driven `<ProjectSchematic>` React component rendering `pipeline: ["CAMERA","YOLOv12","REAL / FAKE"]` (add to MDX frontmatter and Zod), a motif icon, and the category accent from §3. On hover (fine pointer) or when the card is centered in the viewport on touch: nodes light in sequence (`i × 140ms`), connectors draw, and the year chip gets a yellow tick. Keep `cover` optional: when a real image exists, show the image and overlay the pipeline chips on hover. Fix the existing parallax-on-image to ≤ 4px or remove it. Keep the pointer-tracked light.

**5.2 Reveal system (one only).** Keep the IntersectionObserver + WAAPI in `portfolio-motion.tsx`. Standard enter: `translateY(16px) → 0`, `opacity .3 → 1`, 550ms `--ease-out`, stagger by `--stagger` within a grid row. Section eyebrow: the 24px blue line grows from 0 and ends with a yellow square. Headings: `clip-path: inset(0 0 100% 0)` → `inset(-4% -2% -12% -2%)` (reuse the hero name technique).

**5.3 Beyond Engineering (no media needed).** Each card leads with a big outlined mono numeral ("08" years, "05" years) that counts up. Windsurfing gets a two-layer SVG wave that loops with `translateX` (compositor only, 14s and 22s). Swimming gets lane lines. Gaming gets a pixel-grid that lights under the cursor. Cinema gets a film-strip perforation border. Keep it quiet: maximum amplitude 6px.

**5.4 Page "signal bus" rail (desktop ≥ 1280px).** A fixed 1px vertical rail in the left margin with one tick per nav group. It fills with `--electric-500` according to scroll progress, and the active tick turns `--signal-400` with a tiny mono label on hover. Click scrolls to the section. Drive it, the nav progress bar, the active-section spy and the journey progress from **one** passive scroll handler with one rAF, writing `--page-progress` and `data-active`. `PortfolioMotion` currently queries the DOM and sets a custom property on every scroll. Cache the nodes.

**5.5 Ticker and stats.**
- Replace phrases that repeat the hero tagline ("From circuits to software"). Add the pause control from P1.5. Fade the edges with `mask-image`.
- Stats: count-up per §2.5. Source: projects count from content (not "8+" hard-coded), years from `careerStartYear`, technologies from `tech.ts`. Show a "+" only when the number is a floor.

**5.6 Footer.** Oversized `WM.` wordmark in `--ice-100` at 6% opacity behind the contact column. "Back to top" sends one pulse up the page rail.

### P6. Sharing, trust, hardening
1. **OG images:** PNG, 1200×630. Home: portrait (export a PNG/JPG copy, since Satori does not support WebP) + cobalt + name + role + a trace-pattern band. Per project: `src/app/projects/[slug]/opengraph-image.tsx` generated from title, category accent and the pipeline nodes. Remove SVG from `openGraph.images` and `twitter.images`.
2. **JSON-LD:** extend `Person` with `knowsAbout`, `alumniOf`, `worksFor`; add `ProfilePage` + `CreativeWork` per project. Use owner-confirmed education and employment facts; do not imply a closed/past employer is current.
3. **Contact:** add Cloudflare Turnstile (client widget loaded on first form focus; server verify in `route.ts`). Keep the honeypot and the time trap. Add a per-IP limit if the host supports it (Netlify/Upstash). Document the three env vars in `.env.example`, and make the form show a graceful `mailto:` fallback if the API returns 503.
4. **Metadata:** per-page canonical, `sitemap.ts` including project pages (already present), no `/test-dev`.

### P7. QA, budgets, acceptance

**Budgets (mobile, Moto G Power-class, 4× CPU, slow 4G):** LCP ≤ 2.2s, CLS 0, INP ≤ 150ms, Lighthouse Performance ≥ 90, Accessibility ≥ 98, Best Practices ≥ 95, SEO 100. Initial JS ≤ 130KB gz. During hero idle animation, median frame time ≤ 8ms scripting + paint, no long tasks. Measure renderer-main-thread work only; do not sum across all browser threads. Lighthouse and emulation do not establish real-device INP.

**Viewport matrix (Playwright screenshots + a manual pass):** 320×568, 360×740, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1920×1080, 2560×1440, 3440×1440 (ultrawide). At every size verify: yellow tags stay beside the portrait, no label overlaps the face, copper motion aligns with the chosen background framing, the original hero height is preserved, image proportions are correct, the reviewed first-view content fits, and there is no horizontal scroll.

**Interaction checks:** keyboard-only tour (hero stickers, nav, skill board arrows, dialog), reduced-motion on (static, readable, no pulses), motion switch paused, forced-colors, Safari + Firefox + Chrome Android, iOS Safari (masks and `svh`).

**Acceptance rubric (each must be ≥ 8.5 to ship):**
| Area | Pass condition |
|---|---|
| Hero motion | One idea reads in 3 seconds: light travels through real copper and wakes the labels. No effect competes. |
| Hero alignment | Artwork projection verified at all matrix sizes; portrait-side tags retained; framing reviewed; no forced chip/head alignment. |
| Nav | Gray header impossible; indicator slides; active section matches content. |
| Skill board | Same experience mobile and desktop; no fake affordances; data-derived "Used in". |
| Cards | Pipeline sequence plays on hover/viewport; works with a future real image. |
| Type | Visible word gaps; consistent mono; fluid scale. |
| Performance | All budgets met. |
| Code | Two animation systems; one CSS owner per component; no dead code; content lint in build. |

## 5. Do NOT

- Do not add a custom cursor, particle systems, 3D scenes, scroll-jacking, or sound.
- Do not add `filter: blur/drop-shadow` animations on large layers, or `mix-blend-mode` on anything that animates a large area except the single `.light` element.
- Do not animate on every scroll event without rAF batching.
- Do not hide the LCP image behind `opacity: 0`.
- Do not hard-code project claims in the hero proof lines.
- Do not keep dead effects indefinitely. Remove restored visual layers only through the focused owner review required above.

## 6. Order of execution (summary)

P0 is complete and removed from the task list. First review unresolved background framing. Then P1 → **P2 (finish retained motion; review without redesigning the hero)** → P3 → P4 → P5 → P6 → P7. After P2, P3 and P4, stop and show screenshots at 390 and 1440 for review before moving on.


## Appendix A — mask maintenance script (restore only if needed)

### File: `scripts/make-trace-mask.mjs`

```js
#!/usr/bin/env node
/**
 * make-trace-mask.mjs
 *
 * Turns the hero PCB background into an ALPHA MASK of its copper traces.
 * Traces become opaque, everything else becomes transparent. In CSS the mask
 * clips a moving light layer, so light appears to run inside the REAL copper.
 *
 *   npm i -D sharp
 *   node scripts/make-trace-mask.mjs                 # desktop + mobile
 *   node scripts/make-trace-mask.mjs --only desktop --preview
 *   node scripts/make-trace-mask.mjs --coverage 0.10 --min-area 60 --preview
 *
 * How it works (all steps run on a greyscale copy):
 *   1. High-pass: score = (pixel - blurred) / (blurred + 20). This finds thin
 *      bright lines on a darker field and ignores the smooth blue gradient.
 *   2. Threshold: the stricter of two limits wins.
 *        noise limit    = median + k * robust noise  (never picks plain noise)
 *        coverage limit = top `--coverage` share      (never over-fills)
 *      Or force it with --threshold.
 *   3. Remove specks: connected blobs smaller than --min-area are deleted.
 *      Traces are long connected shapes, noise is not.
 *   4. Dilate by --dilate px, then soften the edge a little (anti-alias).
 *   5. Optional --fade-left so traces calm down behind the headline.
 *   6. Encode to WebP with alpha and keep it under --budget KB.
 *
 * IMPORTANT: the mask keeps the exact ASPECT RATIO of the source image.
 * In CSS use the same size and position as the background image:
 *   mask: url(...) right center / cover no-repeat;   (same as object-position: right center)
 * Then every mask pixel sits on top of the same pixel of the photo.
 */
import sharp from "sharp";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const REF_WIDTH = 1600; // all pixel options below are defined at this width and scaled
const JOBS = {
  desktop: { input: "public/images/hero-bg.webp", output: "public/images/hero-traces-mask.webp", width: 1983 },
  mobile: { input: "public/images/hero-bg-mobile.webp", output: "public/images/hero-traces-mask-mobile.webp", width: 650 },
};

const { values: o } = parseArgs({
  options: {
    only: { type: "string" },
    in: { type: "string" },
    out: { type: "string" },
    width: { type: "string" },
    sigma: { type: "string", default: "3.2" },
    coverage: { type: "string", default: "0.12" },
    "noise-k": { type: "string", default: "5" },
    threshold: { type: "string" },
    "min-area": { type: "string", default: "40" },
    dilate: { type: "string", default: "1" },
    soften: { type: "string", default: "0.7" },
    "fade-left": { type: "string", default: "0" },
    budget: { type: "string", default: "60" },
    meta: { type: "string", default: "src/content/hero-meta.generated.json" },
    preview: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (o.help) {
  console.log(`Options:
  --only desktop|mobile   run one job            --in/--out   custom files (with --only)
  --width N               output width in px     --sigma N    blur for the high-pass (default 3.2)
  --coverage 0..1         MAX trace share        --threshold N  force a score threshold
  --noise-k N             noise guard (def. 5, higher = stricter)
  --min-area N            drop blobs < N px      --dilate N   thicken lines (default 1)
  --soften N              edge blur (default .7) --fade-left 0..1  fade traces on the left part
  --budget KB             size limit (def. 60)   --preview    write debug PNGs to scripts/.out/`);
  process.exit(0);
}

const num = (v) => Number(v);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a || 1), 0, 1); return t * t * (3 - 2 * t); };

// ---------- pixel steps ----------

// Histogram helpers for the score values (range -1..3 is plenty after clamping).
const LO = -1, HI = 3, BINS = 4096;
const binOf = (v) => clamp(Math.floor(((v - LO) / (HI - LO)) * BINS), 0, BINS - 1);
const valueOf = (b) => LO + ((b + 0.5) / BINS) * (HI - LO);

// Two limits, the stricter wins:
//   noiseLimit = median + k * (1.4826 * MAD)   -> never picks plain image noise
//   coverageLimit = value where the top `coverage` share of pixels begins -> never over-fills
function pickThreshold(score, coverage, k) {
  const hist = new Uint32Array(BINS);
  for (let i = 0; i < score.length; i++) hist[binOf(score[i])]++;
  const atShare = (share, from) => { // value where `share` of pixels lie below (from=0) or above (from=1)
    const want = score.length * share; let acc = 0;
    if (from === 1) { for (let b = BINS - 1; b >= 0; b--) { acc += hist[b]; if (acc >= want) return valueOf(b); } return LO; }
    for (let b = 0; b < BINS; b++) { acc += hist[b]; if (acc >= want) return valueOf(b); } return HI;
  };
  const median = atShare(0.5, 0);
  const dev = new Uint32Array(BINS);
  for (let i = 0; i < score.length; i++) dev[clamp(Math.floor((Math.abs(score[i] - median) / (HI - LO)) * BINS), 0, BINS - 1)]++;
  let acc = 0, mad = 0;
  for (let b = 0; b < BINS; b++) { acc += dev[b]; if (acc >= score.length / 2) { mad = ((b + 0.5) / BINS) * (HI - LO); break; } }
  const noiseLimit = median + k * 1.4826 * mad;
  const coverageLimit = atShare(coverage, 1);
  return { threshold: Math.max(noiseLimit, coverageLimit), noiseLimit, coverageLimit };
}

// 8-connected blob removal. Returns the number of removed blobs.
function removeSmallBlobs(mask, w, h, minArea) {
  if (minArea <= 1) return 0;
  const seen = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  let removed = 0;
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let head = 0, tail = 0;
    queue[tail++] = start; seen[start] = 1;
    while (head < tail) {
      const p = queue[head++];
      const x = p % w, y = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (mask[q] && !seen[q]) { seen[q] = 1; queue[tail++] = q; }
      }
    }
    if (tail < minArea) { for (let i = 0; i < tail; i++) mask[queue[i]] = 0; removed++; }
  }
  return removed;
}

// Separable max filter (square). Small radius only.
function dilate(mask, w, h, r) {
  if (r <= 0) return mask;
  const tmp = new Uint8Array(mask.length);
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0;
    for (let k = -r; k <= r && !v; k++) { const xx = x + k; if (xx >= 0 && xx < w && mask[y * w + xx]) v = 1; }
    tmp[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0;
    for (let k = -r; k <= r && !v; k++) { const yy = y + k; if (yy >= 0 && yy < h && tmp[yy * w + x]) v = 1; }
    out[y * w + x] = v;
  }
  return out;
}

// ---------- job ----------

async function run(name, job) {
  const t0 = Date.now();
  const input = path.resolve(job.input);
  const meta = await sharp(input).metadata();
  const width = Math.min(job.width, meta.width);
  const scale = width / REF_WIDTH;
  const sigma = clamp(num(o.sigma) * scale, 0.3, 50);
  const radius = Math.max(0, Math.round(num(o.dilate) * scale));
  const minArea = Math.max(1, Math.round(num(o["min-area"]) * scale * scale));

  const base = sharp(input).rotate().removeAlpha().resize({ width, withoutEnlargement: true }).toColourspace("b-w");
  const first = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = first.info;
  const blurredRaw = await base.clone().blur(sigma).raw().toBuffer();
  // Safety: some sharp builds still return 3 channels for greyscale. Keep channel 0 only.
  const only = (buf) => { if (channels === 1) return buf; const out = Buffer.alloc(w * h); for (let i = 0; i < out.length; i++) out[i] = buf[i * channels]; return out; };
  const gray = only(first.data), blurred = only(blurredRaw);

  const score = new Float32Array(w * h);
  for (let i = 0; i < score.length; i++) score[i] = (gray[i] - blurred[i]) / (blurred[i] + 20);

  const picked = o.threshold !== undefined ? { threshold: num(o.threshold), noiseLimit: NaN, coverageLimit: NaN } : pickThreshold(score, clamp(num(o.coverage), 0.01, 0.6), num(o["noise-k"]));
  const threshold = picked.threshold;
  let mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = score[i] >= threshold ? 1 : 0;

  const removed = removeSmallBlobs(mask, w, h, minArea);
  mask = dilate(mask, w, h, radius);

  // Soft edge: blur the 0/255 mask a little for anti-aliasing.
  const hard = Buffer.alloc(w * h);
  for (let i = 0; i < hard.length; i++) hard[i] = mask[i] ? 255 : 0;
  const softOut = await sharp(hard, { raw: { width: w, height: h, channels: 1 } })
    .blur(clamp(num(o.soften) * Math.max(scale, 0.5) + 0.3, 0.3, 5)).toColourspace("b-w").raw().toBuffer({ resolveWithObject: true });
  const soft = softOut.info.channels === 1 ? softOut.data : (() => { const c = softOut.info.channels, out = Buffer.alloc(w * h); for (let i = 0; i < out.length; i++) out[i] = softOut.data[i * c]; return out; })();
  if (soft.length !== w * h) throw new Error("Mask buffer size mismatch");

  // Optional fade on the left side (headline area).
  const fade = clamp(num(o["fade-left"]), 0, 1);
  const alpha = Buffer.from(soft);
  if (fade > 0) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) alpha[y * w + x] = Math.round(alpha[y * w + x] * smoothstep(0, fade, x / w));

  const rgba = Buffer.alloc(w * h * 4);
  let on = 0;
  for (let i = 0; i < alpha.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = alpha[i];
    if (alpha[i] > 127) on++;
  }

  // Encode, stepping alpha quality down until the file fits the budget.
  const budget = num(o.budget) * 1024;
  let encoded = null, usedQuality = 0;
  for (const alphaQuality of [100, 90, 75, 60, 45, 30]) {
    encoded = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 50, alphaQuality, effort: 6, smartSubsample: true }).toBuffer();
    usedQuality = alphaQuality;
    if (encoded.length <= budget) break;
  }
  const output = path.resolve(job.output);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, encoded);

  const srcRatio = meta.width / meta.height, outRatio = w / h;
  console.log(`\n[${name}] ${job.input}  ${meta.width}x${meta.height}  ->  ${job.output}  ${w}x${h}`);
  console.log(`  threshold ${threshold.toFixed(3)} (noise ${picked.noiseLimit.toFixed(3)}, coverage ${picked.coverageLimit.toFixed(3)})  trace coverage ${((on / (w * h)) * 100).toFixed(1)}%  specks removed ${removed}  dilate ${radius}px  sigma ${sigma.toFixed(2)}`);
  console.log(`  size ${(encoded.length / 1024).toFixed(1)} KB (alphaQuality ${usedQuality}, budget ${o.budget} KB)  aspect error ${(Math.abs(srcRatio - outRatio) / srcRatio * 100).toFixed(3)}%`);
  if (encoded.length > budget) console.warn("  WARNING over budget. Try: lower --width, raise --min-area, or lower --coverage.");
  if (Math.abs(srcRatio - outRatio) / srcRatio > 0.005) console.warn("  WARNING aspect ratio drifted. The mask will not line up with the photo.");

  if (o.preview) {
    await mkdir("scripts/.out", { recursive: true });
    const tint = Buffer.alloc(w * h * 4);
    for (let i = 0; i < alpha.length; i++) { tint[i * 4] = 255; tint[i * 4 + 1] = 212; tint[i * 4 + 2] = 0; tint[i * 4 + 3] = Math.round(alpha[i] * 0.85); }
    const photo = await sharp(input).removeAlpha().resize({ width: w }).png().toBuffer();
    await sharp(photo).composite([{ input: tint, raw: { width: w, height: h, channels: 4 } }]).png().toFile(`scripts/.out/trace-preview-${name}.png`);
    await sharp(hard, { raw: { width: w, height: h, channels: 1 } }).png().toFile(`scripts/.out/trace-mask-${name}.png`);
    console.log(`  preview  scripts/.out/trace-preview-${name}.png  (yellow = traces)`);
  }
  console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return { w: meta.width, h: meta.height };
}

const names = o.only ? [o.only] : Object.keys(JOBS);
const sizes = {};
for (const name of names) {
  if (!JOBS[name]) { console.error(`Unknown job "${name}". Use desktop or mobile.`); process.exit(1); }
  const job = { ...JOBS[name], ...(o.only && o.in ? { input: o.in } : {}), ...(o.only && o.out ? { output: o.out } : {}), ...(o.width ? { width: num(o.width) } : {}) };
  try { await stat(path.resolve(job.input)); } catch { console.error(`Missing input: ${job.input}`); process.exit(1); }
  sizes[name] = await run(name, job);
}

// The hero needs the SOURCE image size for the cover math and the SVG viewBox.
await mkdir(path.dirname(path.resolve(o.meta)), { recursive: true });
let previous = {};
try { previous = JSON.parse(await readFile(path.resolve(o.meta), "utf8")); } catch { /* first run */ }
await writeFile(path.resolve(o.meta), JSON.stringify({ ...previous, ...sizes }, null, 2) + "\n");
console.log(`\nSource sizes written to ${o.meta}: ${JSON.stringify({ ...previous, ...sizes })}`);
```

## Appendix B — `src/lib/use-pointer-field.ts` (pending integration)

```ts
"use client";

import { useEffect, type RefObject } from "react";

export type PointerFrame = {
  /** Smoothed position in px, relative to the host's top-left corner. */
  x: number;
  y: number;
  /** Smoothed position in -1..1 (0 = center of the host). */
  nx: number;
  ny: number;
  /** Host size in px. */
  width: number;
  height: number;
};

type Options = {
  /** Smoothing per 16.7ms frame. 0.08 = soft and heavy, 0.2 = quick. Default 0.08. */
  ease?: number;
  /** Where the light rests when the mouse is away, as 0..1 of the host. Default { x: .72, y: .5 }. */
  rest?: { x: number; y: number };
  /** Called once per painted frame. Use it for extra effects (for example the name spotlight). */
  onFrame?: (frame: PointerFrame) => void;
};

/**
 * One shared, smoothed pointer field for the whole hero.
 *
 * Writes four CSS variables on the host element:
 *   --lx, --ly   position in px   (for the trace light)
 *   --mx, --my   position in -1..1 (for the small portrait tilt)
 *
 * Rules:
 *   - Mouse and pen only. Touch devices do nothing (they use the idle sweep).
 *   - ONE requestAnimationFrame loop. It sleeps when the light has arrived,
 *     when the hero is off-screen, when the tab is hidden, and when motion is
 *     paused (html[data-motion="paused"]) or reduced.
 *   - Frame-rate independent smoothing, so 60Hz and 144Hz feel the same.
 *   - No layout reads inside the animation frame. The host rect is read on
 *     pointermove only, and cached again on resize.
 */
export function usePointerField(host: RefObject<HTMLElement | null>, options: Options = {}) {
  const { ease = 0.08, rest = { x: 0.72, y: 0.5 }, onFrame } = options;

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let rect = el.getBoundingClientRect();
    const current = { x: rect.width * rest.x, y: rect.height * rest.y };
    const target = { ...current };
    let frame = 0;
    let last = 0;
    let visible = true;

    const allowed = () => fine.matches && !reduced.matches && root.dataset.motion !== "paused" && visible && !document.hidden;

    const write = () => {
      const nx = rect.width ? (current.x / rect.width) * 2 - 1 : 0;
      const ny = rect.height ? (current.y / rect.height) * 2 - 1 : 0;
      el.style.setProperty("--lx", `${current.x.toFixed(1)}px`);
      el.style.setProperty("--ly", `${current.y.toFixed(1)}px`);
      el.style.setProperty("--mx", nx.toFixed(4));
      el.style.setProperty("--my", ny.toFixed(4));
      onFrame?.({ x: current.x, y: current.y, nx, ny, width: rect.width, height: rect.height });
    };

    const tick = (time: number) => {
      frame = 0;
      if (!allowed()) { last = 0; return; }
      const dt = last ? Math.min(time - last, 64) : 16.7;
      last = time;
      const k = 1 - Math.pow(1 - ease, dt / 16.7);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      write();
      if (Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1) { last = 0; return; } // sleep
      frame = requestAnimationFrame(tick);
    };
    const wake = () => { if (!frame && allowed()) frame = requestAnimationFrame(tick); };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      rect = el.getBoundingClientRect(); // one read per event, no writes here
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      wake();
    };
    const leave = () => { target.x = rect.width * rest.x; target.y = rect.height * rest.y; wake(); };

    const resize = new ResizeObserver(() => {
      rect = el.getBoundingClientRect();
      target.x = Math.min(target.x, rect.width);
      target.y = Math.min(target.y, rect.height);
      write();
    });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); });
    const onChange = () => { if (!allowed()) { target.x = rect.width * rest.x; target.y = rect.height * rest.y; current.x = target.x; current.y = target.y; write(); } else wake(); };

    write();
    resize.observe(el);
    intersection.observe(el);
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", onChange);
    fine.addEventListener("change", onChange);
    reduced.addEventListener("change", onChange);
    // The global motion switch changes a data attribute on <html>.
    const attr = new MutationObserver(onChange);
    attr.observe(root, { attributes: true, attributeFilter: ["data-motion"] });

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect(); intersection.disconnect(); attr.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", onChange);
      fine.removeEventListener("change", onChange);
      reduced.removeEventListener("change", onChange);
    };
    // onFrame is read through the closure on purpose. Pass a stable function (useCallback) if it uses state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, ease, rest.x, rest.y]);
}
```

## Notes:
**Run order for the mask**
1. Sharp is already installed. Add `scripts/.out/` to `.gitignore` if restoring the generator.
2. `node scripts/make-trace-mask.mjs --preview`. Open `scripts/.out/trace-preview-desktop.png` and `-mobile.png`. Yellow means "will glow".
3. Tune until it looks right, then commit the two masks and `content/hero-meta.generated.json`. That JSON holds the real source image sizes. Use them for `coverPoint()` and for the pulse SVG `viewBox`.

**What to expect on the real image, and how to tune it**
- Real PCB art has white silkscreen text (C33, R37, J1) and big chip bodies. The script finds thin bright lines, so text may light up. If the text glows, raise `--min-area` (try 80–150) and `--noise-k` (try 6–8). If it still glows, paint those areas out by hand.
- If real traces are missing, lower `--noise-k` (try 3.5) and raise `--coverage` (try 0.16).
- If lines look too thin or too thick, change `--dilate` (0, 1 or 2).
- If the mask covers the left side where the name sits, add `--fade-left 0.3` so the light is calm behind the headline.
- Budget is 60 KB per mask. The script drops the alpha quality by itself, and it warns you if it still does not fit.

**Rules that must hold**
- The CSS mask must use the same size and position as the background image. The code example uses `right center / cover`; adapt it to the reviewed framing, which currently uses centered cover on desktop. The script prints the aspect error. If it says WARNING, the mask will not line up.
- The photo and the mask must come from the same crop. If you ever re-export `hero-bg.webp`, run the script again.
- Wire the hook like this in the hero stage: `const stage = useRef<HTMLDivElement>(null); usePointerField(stage, { onFrame })`. Use `onFrame` to set the name spotlight variables (`--name-light-x`, `--name-light-y`) from a cached rect of `.name-outline`. This replaces the pointer code in `hero-motion.tsx`.
