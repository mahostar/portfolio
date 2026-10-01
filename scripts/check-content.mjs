import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { site, siteUrl } from '../src/content/site.ts';
import { technologies } from '../src/content/tech.ts';
import { timeline } from '../src/content/timeline.ts';
import { siteSchema, techSchema, timelineSchema, projectSchema, validateEditorial, sections } from '../src/lib/content-schema.ts';

const errors = [];
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
timeline.forEach((item) => check(timelineSchema, item, `timeline:${item.title}`));
unique(technologies.map((item) => item.id), 'technology ids');
const projects = fs.readdirSync('src/content/projects').filter((file) => file.endsWith('.mdx')).map((file) => {
  const { data, content } = matter(fs.readFileSync(`src/content/projects/${file}`, 'utf8'));
  check(projectSchema, data, file);
  if (file !== `${data.slug}.mdx`) errors.push(`${file}: slug must match filename`);
  image(data.cover);
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
else { if (samples.length) console.warn(`Preview only: ${samples.length} sample records. Production deployment is blocked until they are replaced.`); console.log(`Content valid: ${projects.length} projects, ${technologies.length} technologies, ${timeline.length} timeline entries.`); }
