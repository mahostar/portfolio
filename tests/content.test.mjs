import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { getStats, validateEditorial, projectSchema, timelineSchema } from '../src/lib/content-schema.ts';

test('samples never inflate stats; one real project counts once', () => {
  assert.deepEqual(getStats([{ placeholder: true, tech: ['python'] }], null, 2026), { projects: 0, years: null, technologies: 0 });
  assert.deepEqual(getStats([{ placeholder: false, tech: ['python', 'cplusplus'] }, { placeholder: false, tech: ['python'] }], 2023, 2026), { projects: 2, years: 3, technologies: 2 });
});
test('banned words match whole words and ignore innocent substrings', () => {
  assert.deepEqual(validateEditorial('An EXPERT using cutting-edge tools'), ['expert', 'cutting-edge']);
  assert.deepEqual(validateEditorial('The board has a masterpiece-shaped mounting plate'), []);
});
test('invalid project fields and timeline months are rejected', () => {
  assert.equal(projectSchema.safeParse({ title: 'Sample' }).success, false);
  assert.equal(timelineSchema.safeParse({ date: '2026-13', title: 'Example', issuer: 'Sample', type: 'education', placeholder: true }).success, false);
});

test('featured project ordering supports twenty projects and beyond', () => {
  const project = { title: 'Example', slug: 'example', category: 'Hardware', summary: 'A working prototype.', cover: '/images/projects/example.svg', year: 2026, tech: ['python'], featured: true, role: 'Developer', placeholder: false };
  for (const featuredOrder of [1, 5, 20, 100]) assert.equal(projectSchema.safeParse({ ...project, featuredOrder }).success, true);
  for (const featuredOrder of [0, -1, 1.5]) assert.equal(projectSchema.safeParse({ ...project, featuredOrder }).success, false);
});
test('real content passes locally; production refuses missing deployment configuration', () => {
  const local = spawnSync(process.execPath, ['scripts/check-content.mjs'], { encoding: 'utf8', env: { ...process.env, VERCEL_ENV: 'preview' } });
  assert.equal(local.status, 0, local.stderr);
  const strict = spawnSync(process.execPath, ['scripts/check-content.mjs'], { encoding: 'utf8', env: { ...process.env, VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: '', RESEND_API_KEY: '', CONTACT_TO_EMAIL: '', CONTACT_FROM: '' } });
  assert.equal(strict.status, 1);
  assert.match(strict.stderr, /Production requires an HTTPS/);
  assert.doesNotMatch(strict.stderr, /placeholder records/);
});

test('Netlify production accepts its HTTPS URL without optional email credentials', () => {
  const env = { ...process.env, VERCEL_ENV: '', NETLIFY: 'true', CONTEXT: 'production', URL: 'https://portfolio.netlify.app', NEXT_PUBLIC_SITE_URL: '', RESEND_API_KEY: '', CONTACT_TO_EMAIL: '', CONTACT_FROM: '' };
  const result = spawnSync(process.execPath, ['scripts/check-content.mjs'], { encoding: 'utf8', env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /Contact form unavailable/);
  const missingUrl = spawnSync(process.execPath, ['scripts/check-content.mjs'], { encoding: 'utf8', env: { ...env, URL: '' } });
  assert.equal(missingUrl.status, 1);
  assert.match(missingUrl.stderr, /Production requires an HTTPS/);
});

test('Netlify metadata uses production, preview, and custom domain URLs', () => {
  const env = { ...process.env, NETLIFY: 'true', URL: 'https://portfolio.netlify.app', DEPLOY_PRIME_URL: 'https://deploy-preview-1--portfolio.netlify.app', NEXT_PUBLIC_SITE_URL: '' };
  const readUrl = (overrides) => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', "import { siteUrl } from './src/content/site.ts'; console.log(siteUrl)"], { encoding: 'utf8', env: { ...env, ...overrides } });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  assert.equal(readUrl({ CONTEXT: 'production' }), env.URL);
  assert.equal(readUrl({ CONTEXT: 'deploy-preview' }), env.DEPLOY_PRIME_URL);
  assert.equal(readUrl({ CONTEXT: 'production', NEXT_PUBLIC_SITE_URL: 'https://wassim.example.com' }), 'https://wassim.example.com');
});
