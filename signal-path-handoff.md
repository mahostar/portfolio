# Signal Path — redesign below the hero

## Owner intent and scope

The owner likes the first section and wants a substantial redesign of everything below it: stronger layouts, polished visuals, useful interactions, robust code and real testing. Preserving the old lower-section design is NOT a goal. Replace that design where it improves the result.

This revision supersedes the original P1–P7 instructions, their appendices and old continuation prompts. Editing this document does not itself execute the redesign. The owner has now separately authorized execution after the current site is committed and pushed to GitHub.

## Five core rules

1. **The first section is locked. Nobody edits it.** Keep the entire `#home` hero exactly as it stands: background image and framing, copper motion, name, portrait, yellow IoT/AI/Robotics/PCB tags, spacing, height, stats, ticker, buttons and responsive behavior. This includes indirect changes through shared styles, fonts, providers, content calculations, image scripts or navigation overlays. Only a later explicit owner request naming a hero change unlocks that change. Performance, cleanup and consistency are not exceptions.
2. **Redesign below the hero freely, but contain each change.** Rewrite a target component's markup, styling and behavior together. Use scoped CSS and clear component ownership so new design cannot leak into the hero or unrelated routes. A substantial redesign is welcome; uncontrolled side effects are not.
3. **A replacement must be complete before the old implementation is removed.** Keep factual content, working destinations and useful capabilities available through the new design. Inventory them first; check their replacement afterward. Do not obtain a cleaner screenshot by deleting features, hiding broken content, or leaving dead controls.
4. **Use real content and working controls.** Do not invent experience, projects, dates, credentials, tools or metrics. Missing evidence stays an honest placeholder or an internal `TODO(owner)`. Links go somewhere; buttons perform an action. Preserve accessibility, keyboard access and server validation.
5. **Verify the actual result and repair regressions before continuing.** Inspect desktop and mobile renders, exercise affected interactions, and compare the locked hero with the saved baseline. A successful build alone is insufficient. Revert only the new failing change if necessary; never reset the owner's working tree.

These are the governing rules. The design direction and roadmap below explain the work; they are not a collection of mandatory effects or excuses for touching the hero.

## What went wrong in the earlier plan

The earlier foundation phase combined global CSS consolidation, typography changes, animation-library replacement and hero dependencies. Later phases also demanded hero framing changes, a new intro and statistics behavior. Those large changes could affect many components before visual review.

The same document said to preserve the composition while ordering replacement of its underlying styling and motion. Instructions such as “if two things compete, delete one” made deleting accepted design sound like progress. Review checkpoints came after broad rewrites.

This revision removes the hero phase, global typography migration, mandatory animation-library removal, blanket CSS consolidation, prescribed page rail and hero mask/pointer appendices. The lower sections may be redesigned substantially, with complete implementations and checks at each meaningful stage.

## Restore point and repository context

Work in `E:/portfolio`. Read `AGENTS.md` and the relevant guides under `node_modules/next/dist/docs/` before implementation. Installed versions currently include Next.js 16.3.7, React 19.3.0 and pnpm.

Before redesigning, verify the current source, capture its first section, and commit and push the website restoration as the owner's recovery point. Record the commit SHA. Preserve current restoration edits; exclude unrelated `Achivments/`, `src.zip`, `portfolio-expansion-plan.md` and generated previews. Never reset to an older commit or reapply rejected phase commits.

Historical P0 work already added content validation and captured a baseline. Do not repeat its cleanup or treat historical measurements as current results. Rejected P1/P2 work is cancelled, not a pending phase to replay. `signal-path-progress.md` can contain historical reports; this revised scope governs new work.

Use a verified preview of the current source. Port 3000 was the development preview; port 3001 previously served stale production output. Confirm the process and version actually being inspected. Keep a live preview available for the owner after implementation.

## Hero boundary

Directly protected:
- `src/components/hero.tsx`, `hero-motion.tsx`, `hero-circuit.tsx`, `personal-ticker.tsx`.
- `src/app/pcb-motion.css`, `src/content/hero-paths.ts`.
- Backgrounds, portrait and trace masks in `public/images/`.

Indirectly protected:
- Hero selectors and inherited values in `globals.css`, `motion-design.css` and `refinement.css`.
- Root font loading, stylesheet order, providers and wrappers in `src/app/layout.tsx`.
- Shared content or schema outputs that drive the hero.
- Header and bottom navigation appearance, size and clearance while the first section is visible.

Leave `<Hero />` in its current position in `src/app/page.tsx`. New lower-section wrappers must begin after it. Shared files may receive narrowly scoped edits for the lower redesign, but their existing hero behavior must remain unchanged. Scope new fonts and design tokens to the lower content; never overwrite global defaults to style one section.

Keep the current first section even if an old note calls its framing unresolved. Do not recrop, recompress, reposition the chip, tune its animation or correct its stats under this plan. If a shared change affects it, repair the shared change.

## Design direction

Make the lower site feel like a carefully designed engineering portfolio: confident typography, strong project presentation, clear storytelling, deliberate spacing and restrained motion. Carry the hero's cobalt, navy and yellow identity into the lower sections without making every component a circuit board.

Create contrast and rhythm between sections. Use real project media wherever available, a clear editorial hierarchy, readable body copy and purposeful detail. Avoid repetitive generic card grids, huge empty sections, cramped mobile panels, decorative controls and animations that distract from reading.

The quality target is a visibly stronger lower website, not a list of effects. Choose details because they make the content clearer or the interaction better. No requirement to add a rail, shaders, counting numbers, looping waves or a new animation framework.

## Implementation roadmap

### A. Establish the recovery point and lower-page direction

- Verify and push the existing restoration before making redesign changes.
- Save hero screenshots and basic geometry at phone, desktop and ultrawide sizes. Capture after fonts/images load and use consistent animation state for comparisons.
- Inventory project links, skill interactions, experience content, certificates/dialogs, contact behavior and anchors.
- Establish a coherent lower-page design with desktop and mobile composition. Begin with a complete projects section in the real site, using isolated components; show the actual result early.
- Continue authorized implementation with sensible design decisions. Ask only for genuinely missing facts or a new change to the locked hero, not permission for every component.

### B. Rebuild project presentation and the personal story

| Area | Files to inspect and edit | Intended result |
|---|---|---|
| Selected projects | `src/app/page.tsx`, `src/components/project-card.tsx`, project content | Strong visual hierarchy, readable summaries, deliberate media treatment and clear case-study destinations. Redesign the cards and section together. |
| About and journey | `src/app/page.tsx`, `src/components/story-sections.tsx` | A coherent story connecting background, engineering focus and progression; responsive editorial layouts instead of disconnected blocks. |
| Experience and interests | `src/components/experience-archive.tsx`, `story-sections.tsx` | Distinct, polished presentations with genuine evidence and concise readable detail. Existing lower layouts can be replaced entirely. |

Make project media data-driven. Existing placeholders remain replaceable by real images without rewriting the component. Schematics are an option where they communicate an actual project; do not invent pipeline claims or replace good media merely for visual consistency.

The lower section order may change to improve the story. Keep existing anchor targets working or update all their callers. Shared project-card changes must also be verified on `/projects` and project detail routes.

### C. Rebuild skills, evidence, contact and lower navigation

| Area | Files to inspect and edit | Intended result |
|---|---|---|
| Toolkit | `src/components/skills-tree-section.tsx`, `src/app/test-dev/skill-tree.tsx`, its CSS, `src/content/tech.ts` | A compact, engaging toolkit with clear categories, useful selection states and a good mobile experience. A new board, tabs or a redesigned tree are all allowed. |
| Certificates | `src/components/certificate-gallery.tsx`, certificate content | A polished evidence gallery that handles real media and missing evidence honestly; preserve usable previews and keyboard-accessible dialogs. |
| Contact and footer | `src/components/contact-form.tsx`, `footer.tsx`, `src/app/api/contact/route.ts` | A strong ending and clear contact path, with working validation, pending/success/error states and an email fallback. |
| Navigation after the hero | `src/components/navigation.tsx`, `navigation-glass.tsx`, relevant scoped styles | Correct active-section mapping and clear navigation through the redesigned content. Preserve first-section overlays and clearance exactly. |

Toolkit tools come from confirmed content. Derive “Used in” links from actual project records where useful; hide unsupported claims. Remove fake arrows. If choosing tabs, implement tab roles, arrow keys and focus behavior.

The current main page imports the skill tree from `src/app/test-dev/`. Move needed components to their final home and update imports before removing any test route. Do not delete a folder while production still depends on its components.

Server-side contact protections must remain working. Add external bot protection only if deployment configuration supports it; missing service credentials must not make contact unusable. Do not send a real message just to test the form.

### D. Integration, performance and final polish

- Give rewritten lower components scoped styles and clear data/state ownership. Remove their obsolete code only after the replacement works. Keep hero dependencies and legacy hero rules even if the lower sections no longer use them.
- Use Server Components for static content and small client components for actual interactions. Reuse installed tools where sensible; no framework migration solely for tidiness.
- Keep lower content readable if motion is reduced or initialization fails. Clean up observers/listeners; pause unnecessary work offscreen. Optimize measured costs rather than deleting visual quality.
- Update metadata/sharing only where current defects are confirmed. Use factual structured data and correct project URLs; sharing assets must not replace the live hero assets.
- Update `signal-path-progress.md` with the final design, changed files, restoration SHA and current validation evidence. Distinguish completed checks from unavailable environments.

## Testing and acceptance

For each meaningful integration, run appropriate checks and inspect the affected UI. Before delivery, require:
- `pnpm typecheck`, `pnpm lint`, `pnpm build` and content validation; fix new failures and identify any baseline failures honestly.
- Actual desktop/mobile browser review of all redesigned sections and affected project routes; no runtime errors, broken image sources, clipped text or horizontal page overflow.
- Functional checks for navigation/anchors, project destinations, skills selection, certificate dialog opening/closing/focus, and contact validation/error/fallback behavior.
- Keyboard navigation, visible focus, reduced motion and usable touch controls. Use meaningful browser tests for important interaction contracts and hero isolation.
- Saved before/after hero comparison at matching viewports: same layout, name, portrait, tags, background projection, height, stats and motion behavior. Mask only time-varying animation pixels when needed; never mask layout or framing regressions.
- Final responsive review at 320×568, 390×844, 768×1024, 1440×900 and 3440×1440, plus intermediate sizes where a breakpoint or bug needs inspection. Inspect production CSS as well as development output.

Measure performance on a comparable production build before and after. Aim for mobile Lighthouse Performance at least 90, accessibility at least 98 and CLS near zero; identify and repair attributable regressions. These are engineering targets, not permission to alter the hero, blur accepted artwork, remove features or claim real-device INP from emulation. Report actual measurements and practical limitations.

A stage is complete when the new lower design is coherent, its features work, its code is maintainable, desktop/mobile views are polished, and the hero is unchanged. A new effect with broken surrounding behavior is a failed implementation.

## Execution handoff

Commit and push the verified current restoration first. Then implement A → B → C → D, redesigning the lower website with the scope above. Do not stop after a plan, a mockup or source edits: finish the integrated result and browser verification. Show meaningful progress and the running site. Keep the first section untouched. Report the recovery commit, final changes and checks truthfully.
