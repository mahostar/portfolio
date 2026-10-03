# How we work on this portfolio

Owner: Mohamed Wassim Mbarek. Workspace: `E:\portfolio`.
Established workflow recorded on 2026-10-03. Verify current files, Git state, tool access, and Cloudflare settings before acting; versions and external identifiers can change.

## Standing working agreement

- Treat a requested feature or fix as work to complete: implement it, validate it, commit it, push it, deploy it, and check the live result. Do not stop at a plan or source edits.
- Follow any narrower instruction from Mohamed, such as local-only work, no publishing, or "only change the code; I will test it." Those instructions override this default.
- Documentation-only changes should be committed and pushed; they do not need a Worker rebuild unless requested or they change runtime/build configuration.
- Do not repeatedly ask Mohamed to explain the workflow or reapprove routine steps already covered by his request and this agreement. Actual tool permissions and approval restrictions still apply.
- If a tool blocks an action, report the exact action, error, completed work, and the smallest user action needed. Never claim publication succeeded when it did not, and never bypass an approval rejection.
- Keep updates concise. Explain what changed, why, what was verified, and any remaining limitation.
- Preserve the accepted design and existing behavior. A small requested adjustment is not permission for an unrelated redesign.
- Use real owner-provided facts and evidence. Do not invent credentials, dates, experience, or project outcomes.
- Do not delegate to subagents unless Mohamed or applicable repository instructions explicitly request it.

## Read before changing code

1. Read `AGENTS.md`, this file, and the relevant parts of `README.md`.
2. Inspect `git status --short`, `git branch --show-current`, and `git remote -v`.
3. Inspect the current `package.json`, lockfile, configuration, and affected code.
4. Read the relevant installed Next.js guide under `node_modules/next/dist/docs/` before writing Next.js code. This project uses a newer Next.js version with breaking changes; do not assume familiar APIs still apply.
5. Use available Cloudflare/Wrangler skills for deployment work. Discover connector tools and their endpoint schemas before making new API calls.

Personal agent memory can help locate prior decisions, but this repository and current external state are authoritative. This file should remain usable by agents without access to Mohamed's private memory folder.

## Project and deployment identity

| Item | Established value |
| --- | --- |
| GitHub repository | `https://github.com/mahostar/portfolio.git` |
| Remote | `origin` |
| Production branch | `main` |
| Hosting | Cloudflare Workers with the OpenNext adapter |
| Worker | `mohamedwassimmbarek` |
| Production URL | `https://mohamedwassimmbarek.darkcompiler.workers.dev/` |
| Cloudflare account name | `coding` |
| Account ID | `3f2a67cb0cdb73af8a056a7c10fc4baa` |
| Worker script tag / Builds external ID | `20e9070b89514dbabb6969495fda750a` |
| Build trigger UUID | `405e3b6d-7f82-41c1-86ac-af7878281ec8` |

These identifiers are not credentials. Confirm the trigger still belongs to this Worker and `mahostar/portfolio` before modifying it. Never create a replacement account, Worker, project, or domain merely because authentication or a build failed.

Netlify configuration remains in the repository, but Cloudflare is the established production target. Do not change hosting platforms or convert the app to a static export to make deployment easier; the project includes server routes.

## Dependencies and generated content

- Use pnpm, with the version pinned by `packageManager`. Keep `pnpm-lock.yaml` in sync with dependency changes. CI installs with `pnpm install --frozen-lockfile`.
- `pnpm-workspace.yaml` explicitly permits installation scripts for `esbuild` and `workerd`. Preserve these approvals. Do not enable every dependency's scripts as a workaround.
- `pnpm dev` runs `predev`, and `pnpm build` runs `prebuild`. Both regenerate deployment assets through `scripts/bundle-content.mjs`.
- Project sources live in `src/content/projects/*.mdx`. The generator writes `src/content/bundled-projects.json`, including the CV availability flag, so `src/lib/content.ts` can serve content without reading a local directory at Worker request time.
- The generator also compiles `src/lib/welcome-policy.ts` into `public/welcome-startup.js`. Edit the TypeScript policy, then regenerate; do not hand-edit the generated JavaScript or JSON.
- Commit generated source assets when their sources change. Do not commit `.next`, `.open-next`, `.wrangler`, browser artifacts, private source documents, or secrets.
- `wrangler.jsonc` points to `.open-next/worker.js` and `.open-next/assets`, with the `ASSETS` binding and `nodejs_compat`.
- `open-next.config.ts` uses the read-only static-assets incremental cache with cache interception. Preserve it so prerendered project pages remain available.

## Local validation

Run checks appropriate to the change. For application changes, the usual baseline is:

```powershell
pnpm run typecheck
pnpm run lint
pnpm run test:content
pnpm run build
git diff --check
```

Add relevant browser checks for interactions, layout, navigation, and startup changes. Confirm the browser is showing this portfolio before trusting a result: another application has occupied port 3000 in this workspace's history.

The development preview has used port 3002, but inspect the actual listener and Next.js output; do not treat the port as guaranteed. Keep an existing healthy preview running when possible.

For welcome/navigation changes, use the established suite with the correct URL:

```powershell
$env:PREVIEW_URL = 'http://localhost:3002'
pnpm exec playwright test tests/welcome-navigation.spec.ts --trace off
```

For production-style local testing, build first, start `pnpm exec next start --port 3100` in a separate terminal/session, and set `PREVIEW_URL` to that server. Stop only servers created for your checks; preserve the user's development preview.

Playwright defaults to installed Chrome. Edge can be selected with `PLAYWRIGHT_CHANNEL=msedge`. Disabling trace recording avoids the excessive overhead encountered in this session. Keep useful screenshots/reports under ignored `artifacts/`.

For visual changes, inspect desktop and phone layouts, image loading, overflow, and console errors. Browser emulation is useful evidence but is not a physical Samsung S23/Samsung Internet test. State that distinction honestly.

## Git publication

Mohamed's requested sequence is:

```powershell
git add .
git commit -m "fix ..."
git branch -M main
git push -u origin main
```

Apply it with these safeguards:

- Inspect all changes first. Use `git add .` only when every pending change belongs to the task. Otherwise stage the specific files; preserve unrelated work. An unrelated untracked `TODO` file was present during this session.
- Use a descriptive commit message. For features, describe the feature; for fixes, describe the corrected behavior.
- If already on `main`, no branch rename is needed. Do not use `git branch -M main` blindly from a different branch; inspect the situation first.
- Use a normal push, not a force push. Do not reset, overwrite, or discard unrelated changes to get a clean tree.
- Verify the remote branch contains the intended commit. Report the commit hash.
- If publication is denied by automatic approval review, stop that action and explain the rejection. Gather relevant authorization/state evidence or request the required approval; do not try another channel to bypass it.

## Cloudflare deployment

Prefer the existing Git-connected Workers Builds workflow. It runs on Linux and uses the authenticated Cloudflare connection, avoiding Windows-specific OpenNext bundling problems.

Established build settings:

```text
Repository: mahostar/portfolio
Branch: main
Root directory: /
Build command: pnpm run build:cloudflare
Deploy command: pnpm exec opennextjs-cloudflare deploy
```

Do not rely on Wrangler's automatic migration on every deploy. The adapter, Wrangler, configuration, and dependency script approvals are already committed.

1. Push the validated changes to GitHub.
2. Inspect the Worker build list. A GitHub push did not automatically start builds during this session; do not assume one is running.
3. If no appropriate build exists, trigger a build for the exact pushed commit using the existing trigger.
4. Save the returned build UUID. Poll that same build and inspect its logs until success or failure. A timeout does not justify starting duplicate builds.
5. On failure, use the actual error/logs, fix the cause, validate, push a new commit, and rebuild.
6. Verify the deployed site after the deploy command succeeds; a successful build alone does not prove the website works.

The following API paths were used successfully in this session. Discover their current schemas through the Cloudflare search tool before relying on them:

```text
GET  /accounts/{account_id}/workers/scripts
GET  /accounts/{account_id}/builds/workers/{external_script_id}/triggers
GET  /accounts/{account_id}/builds/workers/{external_script_id}/builds
POST /accounts/{account_id}/builds/triggers/{trigger_uuid}/builds
GET  /accounts/{account_id}/builds/builds/{build_uuid}
GET  /accounts/{account_id}/builds/builds/{build_uuid}/logs
```

The trigger request accepts `commit_hash` (preferred for exact publication) or `branch`. Verify that the successful build metadata points to the intended commit.

Connector tool names can differ between sessions, including `mcp__cloudflare__execute` and `mcp__codex_apps__cloudflare_execute`; discover what is actually available. Use endpoint discovery first, then authenticated `cloudflare.request()` calls. Do not embed tokens in scripts, command arguments, documentation, or logs.

An alternative for an already authenticated CLI on Linux/WSL is `pnpm deploy`, which builds and deploys through OpenNext. Connector authentication and local Wrangler authentication are separate; inspect `wrangler whoami` rather than assuming both are signed in.

## Live acceptance checks

- The exact production domain must display the portfolio, not the original "Hello world" Worker or an error page.
- Check `/`, `/projects`, and the affected case studies. For content/deployment changes, check all project slugs when appropriate.
- Check important changed assets and metadata endpoints, such as `/welcome-startup.js`, `/sitemap.xml`, `/robots.txt`, and Open Graph images.
- Use a fresh browser context for first visits; test refresh separately. Verify navigation works and no relevant console/runtime errors occur.
- For layout changes, check desktop and phone widths and inspect the rendered result.
- Report what passed and any limitation. Do not claim email delivery, physical-device compatibility, or other behavior that was not tested.

The contact API requires `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM`. Keep them as deployment secrets and verify the sending domain. Without credentials the production form can return 503; deployment success does not establish working email delivery. Do not send test messages without authorization.

## Known problems and established fixes

| Symptom | What we learned / what to do |
| --- | --- |
| `ERR_PNPM_IGNORED_BUILDS` for esbuild/workerd | Preserve their explicit `allowBuilds` entries and the lockfile. Non-interactive automatic migration failed without them. |
| OpenNext bundling fails on Windows with access/copy errors | Use Cloudflare's Linux build as the deployment validation. Do not strip features or randomly change dependencies to silence a Windows-only failure. |
| Worker returns 500 reading `/bundle/src/content/projects` | Runtime local filesystem reads were the cause. Use the generated project bundle. Inspect Worker observability logs for actual server errors. |
| Prerendered project detail pages return 404 | The default adapter configuration lacked the required cache. Keep the static-assets incremental cache in `open-next.config.ts`. |
| Welcome screen appears on refresh but not a pasted URL/new tab | Navigation type `navigate` must be eligible alongside `reload`; do not restrict eligibility to refresh. History restores remain ineligible. |
| React warns about script tags during client rendering | Inline scripts and this installed Next.js version's `beforeInteractive` wrapper caused the warning. The current root layout uses a React-managed external `async` script with `src`. Preserve that arrangement. |
| Welcome fails when the startup asset arrives after hydration | `WelcomeScreen` waits for the policy's readiness event, or detects an already initialized policy. Preserve this handshake and the expiry/lifecycle guards. |
| `process.js` / `link.js` module factory unavailable in development | A stale dev process/output followed dependency changes. Verify the portfolio process, stop only that process, clear only the resolved `.next/dev` directory, restart, and hard-refresh the affected browser tab. Do not delete source, dependencies, or unrelated server data. |
| Connector says `USER_NOT_LOGGED_IN` | Ask Mohamed to reconnect Cloudflare. Do not create a substitute deployment on a temporary account. |
| Tool says approval is required but policy is `never` | Report the exact permission conflict and request correction of the tool/session access settings. Explicit user intent does not make an unavailable tool executable. |

Welcome behavior to preserve: fresh homepage visits and refreshes play the intro; internal route/anchor changes and history restores do not replay it; Skip and completion restore input; no JavaScript or expired hydration must leave content usable.

When this workflow changes, update this file with the verified new behavior so Mohamed does not need to repeat the instructions.
