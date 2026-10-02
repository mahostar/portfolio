import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { site, siteUrl } from '../src/content/site.ts';
import { technologies } from '../src/content/tech.ts';
import { journey, impact, interests, certificates, certificateSlots, archive } from '../src/content/expansion.ts';
import { siteSchema, techSchema, journeySchema, impactSchema, interestSchema, certificateSchema, certificateSlotSchema, archiveEntrySchema, projectSchema, validateEditorial, sections } from '../src/lib/content-schema.ts';

const errors = [];
// Validate every content source, including newly added data files, not just
// records reached by today's page loaders.
for (const entry of fs.readdirSync('src/content', { recursive: true })) {
  if (!/\.(ts|mdx|json)$/.test(entry)) continue;
  const source = fs.readFileSync(path.join('src/content', entry), 'utf8');
  const banned = validateEditorial(source);
  if (banned.length) errors.push(`${entry}: prohibited words: ${banned.join(', ')}`);
}
const samples = [];
const netlifyProduction = process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production';
const strict = process.env.VERCEL_ENV === 'production' || netlifyProduction;
const check = (schema, value, name) => {
  const result = schema.safeParse(value);
  if (!result.success) errors.push(`${name}: ${result.error.message}`);
  if (value.placeholder) samples.push(name);
  const banned = validateEditorial(JSON.stringify(value));
  if (banned.length) errors.push(`${name}: prohibited words: ${banned.join(', ')}`);
};
const image = (src) => { if (typeof src !== 'string' || !src.startsWith('/images/') || !fs.existsSync(path.join(process.cwd(), 'public', src))) errors.push(`Missing local image: ${src}`); };
const unique = (values, name) => { if (new Set(values).size !== values.length) errors.push(`Duplicate ${name}`); };
check(siteSchema, site, 'site');
[site.heroBg, site.heroBgMobile, site.portrait].forEach(image);
technologies.forEach((item) => check(techSchema, item, `technology:${item.id}`));
for (const [name, records, schema] of [['journey', journey, journeySchema], ['impact', impact, impactSchema], ['interests', interests, interestSchema], ['certificates', certificates, certificateSchema], ['certificate slots', certificateSlots, certificateSlotSchema], ['archive', archive, archiveEntrySchema]]) {
  records.forEach((item) => { check(schema, item, `${name}:${item.id}`); if (item.image) image(item.image); });
  unique(records.map((item) => item.id), `${name} ids`);
}
const evidence = JSON.parse(fs.readFileSync('src/content/evidence.json', 'utf8'));
unique(evidence.map(item => item.id), 'evidence ids');
for (const item of evidence) {
  [item.preview, item.thumbnail].forEach(image);
  if (!/^\/(images|videos)\/evidence\//.test(item.src) || !fs.existsSync(path.join('public', item.src))) errors.push(`Missing evidence: ${item.id}`);
}
for (const entry of archive) for (const id of entry.mediaIds || []) if (!evidence.some(item => item.id === id)) errors.push(`Missing gallery evidence: ${entry.id}/${id}`);
for (const item of journey) if (item.href?.startsWith('/projects/') && !fs.existsSync(`src/content/projects/${item.href.split('/').at(-1)}.mdx`)) errors.push(`Missing journey project: ${item.href}`);
unique(technologies.map((item) => item.id), 'technology ids');
const projects = fs.readdirSync('src/content/projects').filter((file) => file.endsWith('.mdx')).map((file) => {
  const { data, content } = matter(fs.readFileSync(`src/content/projects/${file}`, 'utf8'));
  check(projectSchema, data, file);
  if (file !== `${data.slug}.mdx`) errors.push(`${file}: slug must match filename`);
  image(data.cover);
  if (data.coverVideo && !fs.existsSync(path.join('public', data.coverVideo))) errors.push(`Missing cover video: ${data.coverVideo}`);
  for (const id of data.tech || []) if (!technologies.some((item) => item.id === id)) errors.push(`${file}: unknown technology ${id}`);
  const headings = [...content.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
  if (JSON.stringify(headings) !== JSON.stringify(sections)) errors.push(`${file}: incorrect body section order`);
  if (validateEditorial(content).length) errors.push(`${file}: prohibited word in body`);
  return data;
});
unique(projects.map((item) => item.slug), 'project slugs');
const featured = projects.filter((item) => item.featured);
unique(featured.map((item) => item.featuredOrder), 'featured orders');
if (strict) {
  if (samples.length) errors.push(`Production has ${samples.length} placeholder records. Replace all samples first.`);
  if (!/^https:\/\//.test(siteUrl)) errors.push('Production requires an HTTPS NEXT_PUBLIC_SITE_URL or Netlify URL');
  if (!site.email) errors.push('Production requires the owner email');
  for (const name of ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM']) {
    if (!process.env[name]) {
      if (netlifyProduction) console.warn(`Contact form unavailable until ${name} is configured in Netlify. Direct email remains available.`);
      else errors.push(`Production requires ${name}`);
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else { if (samples.length) console.warn(`Preview only: ${samples.length} sample records. Production deployment is blocked until they are replaced.`); console.log(`Content valid: ${projects.length} projects, ${technologies.length} technologies, ${journey.length} journey entries, ${certificates.length} credentials.`); }
