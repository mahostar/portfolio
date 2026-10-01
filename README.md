# IoT & AI portfolio

A Next.js portfolio based on the supplied blueprint reference. The design and engineering contract is in `plan.md`.

## Run
Use Node 24+ and pnpm. Run `pnpm install`, then `pnpm dev`. Open http://localhost:3000.
Run `pnpm make-images` after replacing the source assets.

## Your content
Edit identity, copy, and links in `src/content/site.ts`.
Edit technology records in `src/content/tech.ts` and milestones in `src/content/timeline.ts`.
Add a project as `src/content/projects/your-slug.mdx`, using an existing file as the schema and section template.
Use real project photographs in `public/images/projects/`. Set `featured: true` to show a project on the home page, with a unique positive `featuredOrder`. Both project lists stack vertically and support any number of projects; `/projects` shows every case study. Add 5, 20, or more projects by adding MDX files, without changing the layout.
Owner facts come from `CVs/cv formation.pdf`, `CVs/cv.pdf`, the IELTS extract, and the supplied repository records. Eight case studies use those facts; unverified commercial metrics are omitted.
Stats use real projects only. An unset career year displays an em dash. Empty personal links are hidden.
Place a real CV at `public/cv.pdf` to enable its download button.

## Images
Replace root `bg.png` and transparent `photo.png`, then run `pnpm make-images`.
An optional `bg-mobile.png` supplies a mobile crop. The script preserves portrait proportions and alpha.
Project covers are labeled SVG system concepts, not photographs of completed hardware. Replace them with authentic project media when available.
Bambu Lab's mark comes from the bundled Simple Icons library. The SOLIDWORKS red cube is stored locally in `public/logos/solidworks-cube.png` ([asset source](https://www.pngegg.com/en/png-nmikn)). Skill badges display each label once, even when no logo is available.

## Email and deployment
Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM`.
Verify your sending domain with Resend. Development without credentials logs messages; production returns 503.

### Netlify

In Netlify, add a new project by importing `mahostar/portfolio` from GitHub and select the `main` branch. Leave the base directory empty. The committed `netlify.toml` sets the build command to `pnpm build`, the publish directory to `.next`, Node 24, and pnpm hoisting. The `packageManager` field pins pnpm. Netlify automatically installs its Next.js adapter, which supports the contact API and image optimization; keep the normal Next.js build rather than exporting static HTML.

The production site URL comes from Netlify's `URL`; preview builds use `DEPLOY_PRIME_URL`. You can override either with `NEXT_PUBLIC_SITE_URL` (your real HTTPS domain, available to Builds). Do not set it to the example domain.

To enable the contact form, add `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (your inbox), and `CONTACT_FROM` (an address on your verified Resend domain) in Netlify's environment variables with Functions scope, then redeploy. The portfolio builds without email credentials, but the form returns an error and offers your direct email until configured. Keep credentials out of Git.

Production builds on Netlify reject placeholders and a missing HTTPS site URL. Vercel production builds additionally require contact credentials. Sample previews are noindex. Private CV source documents and generated test artifacts are excluded from Git; the existing optimized public images are included and do not need regeneration to deploy.

Netlify references: [Next.js support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/), [pnpm configuration](https://docs.netlify.com/snippets/frameworks/nextjs-pnpm-support/).

## Verify
Run `pnpm typecheck`, `pnpm lint`, `pnpm check:content`, `pnpm test:content`, `pnpm test`, and `pnpm build`.
Browser tests use installed Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to use Edge.
Screenshots and browser reports are saved under `artifacts/`.
