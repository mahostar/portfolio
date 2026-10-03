# Welcome screen navigation plan

Date: 3 October 2026. Status: implemented following user approval. The investigation and proposal below are retained as the design record; see the implementation notes at the end.

## Intended behavior

The welcome animation should belong to the start of a browser document, rather than to each arrival at the homepage. Returning from any project, the catalog, or the 404 page should immediately reveal the requested home section with usable navigation and content.

The implemented policy is **refresh only**: a genuine reload whose initial pathname is `/` plays the welcome screen. First visits and returns from subpages skip it. Approval to implement the plan was given after the investigation.

| User action | Proposed welcome behavior |
| --- | --- |
| Reload `/`, including browser Refresh and keyboard reload | Play once for the new document |
| Reload a home section such as `/#skills` or `/#contact` | Play once, then keep the requested section/scroll position |
| Open `/` from an address, bookmark, external link, or new tab | Skip under refresh-only policy; play if first-visit behavior is chosen |
| Open a home section URL directly | Same initial-visit policy; preserve the section destination |
| Open or reload `/projects`, a project, or a missing route | Skip |
| Click Home, logo, footer logo, or Back home from another route | Skip |
| Click Work, About, Impact, Contact, or any footer home-section link from another route | Skip and reach that section |
| Browser Back/Forward within the app | Skip; retain router/history restoration |
| Browser Back/Forward across separate documents, including cache restoration | Skip |
| Scroll, click an anchor, or repeat the current anchor on home | Skip |
| Change catalog filters or visit Next project | Skip |
| Open/close a gallery or certificate dialog; use skill tabs, ticker, or motion controls | Skip |
| Switch tabs, resize, rotate a phone, or return from an external tab | Skip |
| Refresh repeatedly, even after previously skipping the intro | Play on each eligible new document |

The home-section reload policy above treats all URLs with pathname `/` as the homepage. It can be narrowed to the top of home if desired; the current code already treats all these hashes as home.

## Confirmed cause and browser evidence

`src/components/welcome-screen.tsx:17–115` runs an effect dependent on `pathname`. Its entry condition is only `pathname === '/'`. Every project-to-home transition therefore starts the greeting again, sets `html[data-welcome='playing']`, makes the header/main/footer/navigation inert, and focuses Skip intro.

`src/app/layout.tsx:51` also arms the overlay before hydration whenever the document starts at `/`. This script and the component currently have no shared rule describing which document may play.

The observed returns are client navigation, not document reloads. The existing Next.js links already retain the document. Replacing all links or adding a global click interceptor is unnecessary for the confirmed problem.

The investigation used headless installed Chrome through the project's Playwright dependency, against `http://localhost:3002/`. Temporary instrumentation existed only inside the audit browser contexts; no logging script was added to the site.

Captured signals:

- A random document ID assigned before page scripts, plus main-frame document requests.
- `DOMContentLoaded`, `load`, `pageshow`, `pagehide`, `popstate`, `hashchange`, and visibility events.
- `history.pushState` and `replaceState`, forwarding the original calls and arguments.
- Link click destinations, performance timestamps, and the initial Navigation Timing type.
- Mutation observation of `data-welcome`, `data-phase`, and `inert`.
- Snapshot checks of overlay state, current URL, focus, scroll position, and main-content interactivity.
- Uncaught browser errors during the route crawl: none observed.

Representative trace from one document after refreshing home:

| Action | Document ID | Initial navigation type | Result |
| --- | --- | --- | --- |
| Refresh home | `vuzik050nen` | `reload` | Greeting plays, main inert |
| Home → catalog | `vuzik050nen` | Still `reload` | No greeting |
| Catalog Back home → `/#work` | `vuzik050nen` | Still `reload` | Greeting incorrectly plays |
| Home → EasyShield | `vuzik050nen` | Still `reload` | No greeting |
| Project logo → `/#home` | `vuzik050nen` | Still `reload` | Greeting incorrectly plays |
| Back to EasyShield | `vuzik050nen` | Still `reload` | No greeting |
| Forward to home | `vuzik050nen` | Still `reload` | Greeting incorrectly plays |

For the catalog return, the click was logged at 1973 ms, `pushState` at 2153 ms, and the greeting/input lock at 2223 ms in this development run. These are observations, not production performance guarantees.

**Critical implementation detail:** reading `performance.getEntriesByType('navigation')[0].type` on every route change is insufficient. The original `reload` classification remains attached to the same document after internal navigation. Eligibility must be captured at document startup and permanently retired for that document after completion or departure.

All 12 project logo returns reproduced the problem with an unchanged document ID and focus moved to Skip intro. Desktop Home/Work/About/Impact/Contact, footer Journey/Interests/Skills/Certificates, catalog Back home, 404 Back home, and the mobile Home button also reproduced it. Same-home anchors, catalog category changes, a project table-of-contents link, and a Plantini gallery open/Escape-close did not start the greeting.

Fresh documents were separately opened for all nine home-section hashes; every one currently plays the greeting. The old `scripts/welcome-preview.mjs` expects a direct `/#skills` load to hide the intro, so that expectation is inconsistent with the observed current behavior and must be made explicit in the revised tests.

## Website and interaction inventory

The crawl visited the home page, project catalog, all twelve case studies (each returned HTTP 200), and a representative missing route (HTTP 404).

Case studies: AlgoBrain, AquaFlow, Cleenolve, Cyclops, DepthFusion-ViT, EasyShield, Faza3D, NiotoShield, Plantini, Remote PC Power Control, SmartHart, and TPMS Generator.

| Surface | Navigation and interaction paths | Treatment in the implementation |
| --- | --- | --- |
| Shared header and mobile bar | Logo; Home, Work, About, Impact, Contact; Let's build | Keep existing Next.js/HomeLink behavior; returning to home must never re-arm welcome |
| Shared footer | Home/brand; Work, About, Journey, Impact, Skills, Interests, Certificates, Contact; social/email links | Same home-return rule; preserve each hash destination |
| Homepage | Featured project cards, catalog buttons, skill-related project links, home anchors | Navigation away retires eligibility; same-route interaction does not start it |
| Homepage controls | Skill selection, motion/ticker controls, evidence/certificate dialogs, contact form | No welcome trigger; test focus and input after return |
| Catalog | Back home, 12 cards, All plus eight category filters | Back home skips welcome; filters remain on catalog and retain existing scroll behavior |
| Case studies | Catalog links, Next project cycle, five content anchors, MDX cross-project links | All internal navigation leaves welcome inactive |
| Case-study media | Image/video gallery, thumbnails, next/previous, expand/collapse, native video controls | Retain modal/video lifecycle; do not make these navigation triggers |
| Missing routes | Home and catalog recovery links | Home recovery skips welcome even when the original document began on 404 |
| External destinations | GitHub, LinkedIn, education links, demos, email | Preserve target and native behavior; returning to the app does not restart welcome |
| Conditional downloads | CV link appears only when the file exists | Do not treat downloads as page navigation; no CV link was present in the observed homepage |
| Non-page routes | Contact API, sitemap, robots, icons and social preview images | Outside the UI welcome lifecycle |

The contact form was inspected in source, not submitted. External services were not opened. The audit does not claim every button was exercised: the interaction inventory establishes the planned regression coverage. Firefox/WebKit, actual browser cache restoration, slow hydration, and interrupted intros remain explicit implementation-validation tasks.

## Proposed sequence

```mermaid
sequenceDiagram
    actor Visitor
    participant Browser
    participant Boot as Document startup policy
    participant Router as Next.js router
    participant Welcome as Welcome controller

    Visitor->>Browser: Refresh homepage
    Browser->>Boot: New document, initial path /, type reload
    Boot->>Boot: Capture eligibility once
    Boot->>Browser: Arm pending overlay before first paint
    Browser->>Welcome: Hydrate shared layout
    Welcome->>Boot: Check armed eligibility
    Welcome->>Browser: Greeting; lock background; focus Skip
    Visitor->>Welcome: Wait, Skip, or Escape
    Welcome->>Boot: Retire eligibility for this document
    Welcome->>Browser: Hide overlay; restore input/focus
    Visitor->>Router: Open project
    Router->>Browser: Replace route content in same document
    Visitor->>Router: Home, section link, or Back/Forward
    Router->>Browser: Restore home and requested location
    Welcome->>Boot: Eligibility already retired
    Welcome->>Browser: Keep overlay hidden and content usable
    Visitor->>Browser: Refresh homepage again
    Browser->>Boot: New document; new eligible lifecycle
```

A document that begins on `/projects`, a case study, or 404 starts ineligible and stays ineligible when navigating home. Under refresh-only policy a fresh `navigate` document at `/` also starts ineligible. A `back_forward` document is ineligible, and cache restoration cannot renew an already retired lifecycle.

## Method and technologies

Use the existing Next.js 16.3.7 App Router, shared root layout, React effect cleanup, and welcome animation. Use Navigation Timing only to classify the initial document. Use a small document-scoped state record to connect the pre-hydration script and hydrated component. No persistent storage is needed: session/local storage would add cross-visit semantics unrelated to the required reload behavior.

The proposed state record captures initial pathname, initial navigation type, eligibility, lifecycle status, and an effect generation/owner. The record lives for the document's lifetime. Do not derive initial pathname from the current URL after a route transition.

Lifecycle:

1. **Inactive:** startup is not eligible; all future route visits remain inactive.
2. **Armed:** eligible initial home document; the pre-hydration pending attribute may show the backdrop.
3. **Playing:** exactly one active controller owns timers, frames, animations, input lock, and focus.
4. **Retired:** completion, Skip, Escape, timeout, genuine departure, or page suspension ends the opportunity; internal navigation cannot restart it.

React development effect replay requires care. Do not set a one-shot `hasPlayed` flag at the top of setup: cleanup could remove the overlay and the next setup would then be suppressed. Cleanup must cancel the current generation and restore its effects, while a replacement setup may resume the same eligible startup. Only a real finish, departure, or page lifecycle interruption retires the opportunity. Generation ownership prevents stale callbacks from hiding another active setup or restoring input incorrectly.

Handle `pagehide` so an interrupted intro cannot restore from browser cache with the background still locked. On `pageshow` with `persisted=true`, ensure the controller stays retired and the overlay/input locks are cleared. These listeners are defensive lifecycle behavior, not a replacement for router awareness. Do not add `beforeunload` logging, which is unnecessary here and can interfere with caching.

When navigation classification or the boot record is unavailable, leave content accessible. With JavaScript disabled, the existing hidden-by-default overlay should remain hidden. Keep the pre-hydration timeout and component safety timeout effective; clean up the document state too, so late hydration cannot revive an expired pending intro.

Sources: installed `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`; [Navigation Timing types](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type); [React effect replay](https://react.dev/reference/react/StrictMode).

## File-specific implementation steps

1. Add `src/lib/welcome-policy.ts` for the small eligibility rule, typed lifecycle contract, and startup-script source generated from the same policy. Keep browser access inside the startup/runtime functions so importing the policy in server code remains safe. Add no dependency.
2. Update `src/app/layout.tsx` to use that startup script instead of arming on pathname alone. Capture boot facts before hydration; set `data-welcome='pending'` only for eligible startup; retire expired pending state on the failsafe.
3. Update `src/components/welcome-screen.tsx` to require the captured startup eligibility and lifecycle status. Retain route observation to cancel/retire on departure, but never use arrival at `/` as permission to start. Preserve greeting timing, handwriting, aperture reveal, Skip/Escape, reduced-motion behavior, and cleanup. Make normal completion and cancellation idempotent.
4. Add page suspension/restoration cleanup to that controller. Restore prior `inert` values and avoid forcing focus to a disconnected element or overriding router destination focus during a route transition. Normal finish can retain the existing main-focus behavior with `preventScroll`.
5. Keep `src/components/home-link.tsx`, navigation, footer, project routes, and motion components unchanged unless a regression trace shows a separate navigation defect. Their current routing is not the confirmed cause. Review the MDX native cross-project anchors during tests because some perform a document navigation; a non-reload home document must still skip welcome.
6. Extend `scripts/welcome-preview.mjs` for the settled initial-visit/hash policy; retain existing visual checks at desktop/mobile/QHD. Add `tests/welcome-navigation.spec.ts` for document lifecycle and interaction journeys. Configure the audit run to use the active server at port 3002 rather than silently exercising the existing test configuration's port 3000.
7. Run appropriate lint/typecheck and welcome/navigation tests, then validate the behavior against a production server as well as development. No unrelated test-suite repair belongs to this change.

CSS should not need a redesign. Inspect `src/components/welcome-screen.module.css` and the `html[data-welcome]` rules in `src/app/globals.css` during verification to ensure no pending-attribute flash or residual scroll lock.

## Validation and event logging

Use Playwright `addInitScript` for test-only instrumentation and per-document IDs; attach request/error listeners; collect mutation events for welcome/input/focus changes. Record initial navigation type alongside document ID and route events, never as an independent proof of reload. Use Playwright traces/screenshots for failing journeys. Log only navigation and UI state, not contact field values.

For a navigation expected to skip welcome, assert **zero new greeting/pending/input-lock events**, not merely that the overlay has disappeared after a delay. This catches flashes and brief focus theft. On eligible reload, assert one visible sequence and eventual restoration; tolerate development setup/cleanup instrumentation without treating it as a second user-visible greeting.

Required journeys:

- Home reload → complete/Skip/Escape → catalog → each project → home; repeat the round trip.
- Open each project directly → Home/logo; repeat with an initial project reload.
- All header/mobile/footer home destinations; catalog Back home; both 404 recovery paths.
- Home reload → project → browser Back/Forward repeatedly. Initial navigation type must remain irrelevant once retired.
- Catalog filters including invalid category, filter history, Next project, native MDX cross-project links, and table-of-contents anchors.
- Home hash changes and repeated same-hash clicks; verify target placement below the header and active navigation state.
- Genuine refresh of every home-section hash; verify greeting policy and final scroll location.
- Modified clicks and new tabs: preserve native behavior; each tab applies its own startup policy.
- Same-tab external navigation and browser cache restoration; log `pageshow.persisted` to prove whether cache restoration actually occurred. If it does not occur, report the case as unverified rather than counting it as a cache test.
- Leave during greeting/reveal using browser history; return; verify no restart, stuck inert state, stale animation, or focus theft.
- Reduced motion from startup and toggled during greeting; rapid Skip/Escape; tab suspension and restoration.
- Slow hydration, delayed/failed script loading, pending timeout, absent Navigation Timing, and JavaScript disabled.
- Desktop, mobile touch, QHD, keyboard navigation; Chrome plus available Firefox/WebKit coverage.
- Gallery/certificate open/close and focus restoration; skill/ticker controls; contact fields immediately usable after home return. Do not send a real contact message during these tests.

Acceptance gates:

1. Every eligible homepage refresh still displays the existing animation.
2. Every in-app return to home has no welcome backdrop, greeting, focus theft, or inert/scroll lock, even briefly.
3. Documents starting on a subpage never become welcome-eligible through navigation.
4. History/cache restoration never renews an intro opportunity.
5. All destination hashes, scroll restoration, link modifiers, dialogs, and input remain usable.
6. Timers/listeners/frames are cleaned up; no uncaught error or hydration warning is introduced.
7. Development and production behave consistently for visitors; first-visit behavior matches the chosen policy.

## Review boundary

The initial investigation changed only this plan. The user subsequently approved implementation, using the refresh-only baseline.

## Implementation notes

Implemented in `src/lib/welcome-policy.ts`, `src/app/layout.tsx`, and `src/components/welcome-screen.tsx`. Startup eligibility is captured before hydration and retained only for the initial homepage reload. Completion, Skip, Escape, route departure, page suspension, or pending timeout retires it. No storage or new dependency was added, and no navigation links or animation styling were changed.

The controller releases its event listeners when it finishes, restoring Escape handling for certificate/gallery dialogs. Cleanup is idempotent and allows React development setup/cleanup replay without renewing a completed intro. A direct `popstate` listener handles rapid Back/Forward before the router commits the intermediate route; this edge case was caught and corrected by the interruption regression.

Added `tests/welcome-navigation.spec.ts`, updated `scripts/welcome-preview.mjs` to reload before visual animation checks, and made `playwright.config.ts` accept `PREVIEW_URL` for checking the existing development server and a production preview without starting another server.

Validation on installed Chrome:

- Production build, typecheck, focused ESLint, and `git diff --check` passed.
- All 15 final development welcome/contact navigation tests passed, covering all twelve project returns, all home-section refreshes and return destinations, 404 recovery, mobile navigation, history interruption, dialog/contact usability, and loading fallbacks. Results are under `artifacts/welcome-verified-results/`.
- Visual welcome checks passed at 1440×900, 390×844, and 2560×1440, including handwriting progression, aperture origin, restored input, refresh replay, Skip/Escape, reduced motion, fresh hash URLs, JavaScript disabled, and direct project loads. Screenshots are under `artifacts/screenshots/`.
- Eight final production regressions passed: home/project/history round trips, mobile/repeated anchors, Escape release and usable contact inputs, rapid history interruption, suspension/restoration, absent Navigation Timing, JavaScript disabled, and expired pending state after delayed hydration. Results are under `artifacts/production-welcome-verified-results/`.
- An actual Chrome browser-cache restoration was observed after leaving during a homepage reload intro: the document ID was retained, `pageshow.persisted` was true, welcome state was retired, the overlay was hidden, and main content was not inert. This was checked with Chrome's default cache-disabling automation flag removed.
- Firefox and WebKit runtimes are not installed, so cross-engine validation remains unverified.

One trace-recording run stalled during browser-context teardown after its assertions had completed. The final regression commands used `--trace=off`; test-only mutation/history event logs and failure screenshots remain available. No navigation/contact field logging was added to the application.

Repeatable checks in PowerShell:

```powershell
$env:PREVIEW_URL='http://localhost:3002'
pnpm exec playwright test tests/welcome-navigation.spec.ts tests/navigation-contact.spec.ts --reporter=list --trace=off
node scripts/welcome-preview.mjs
pnpm typecheck
pnpm build
```
