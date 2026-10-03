import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

// Release decoder file handles before archiving files on Windows.
sharp.cache(false);

// Deliberately selected assets: do not repeatedly recompress existing WebPs.
// Originals stay outside the published directory for future edits.
const archive = 'Achievements/originals/public-media';
const jobs = [
  ['images/professional-portrait-cutout.png', 'images/professional-portrait-cutout.webp', null, 92],
  ['images/evidence/projects/easyshield/easyshield-thumbnail.png', 'images/evidence/projects/easyshield/easyshield-thumbnail.webp', 1600, 92],
  ['images/evidence/milestones/fablab/pcb-manufacturing/natural-daylight-pcb-portrait.png', 'images/evidence/milestones/fablab/pcb-manufacturing/natural-daylight-pcb-portrait.webp', null, 90],
  ['logos/pcb-desing.png', 'logos/pcb-desing.webp', 192, 95],
  ['logos/Website-Logo.png', 'logos/Website-Logo.webp', 256, 100],
  ['images/brands/ielts-logo.png', 'images/brands/ielts-logo.webp', 640, 100],
];
const digest = data => createHash('sha256').update(data).digest('hex');
async function preserve(relative) {
  const original = path.join('public', relative);
  const destination = path.join(archive, relative);
  const bytes = await fs.readFile(original);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  try {
    const existing = await fs.readFile(destination);
    if (digest(existing) !== digest(bytes)) throw new Error(`Archive differs: ${destination}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.writeFile(destination, bytes, { flag: 'wx' });
  }
  if (digest(await fs.readFile(destination)) !== digest(bytes)) throw new Error('Archive verification failed');
  await fs.unlink(original);
}
let results = [];
try { results = JSON.parse(await fs.readFile('artifacts/media-audit/optimizations.json', 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const [input, output, width, quality] of jobs) {
  const file = path.join('public', input);
  try { await fs.access(file); } catch { continue; }
  const before = await sharp(file).metadata();
  let image = sharp(file).rotate();
  if (width) image = image.resize({ width, withoutEnlargement: true });
  await image.webp({ quality, alphaQuality: 100, effort: 6, lossless: quality === 100 }).toFile(path.join('public', output));
  const after = await sharp(path.join('public', output)).metadata();
  if (before.hasAlpha && !after.hasAlpha) throw new Error(`Lost transparency: ${input}`);
  const oldBytes = (await fs.stat(file)).size;
  const newBytes = (await fs.stat(path.join('public', output))).size;
  if (newBytes >= oldBytes) throw new Error(`No size improvement: ${input}`);
  results.push({ input, output, oldBytes, newBytes });
  if (input.includes('natural-daylight')) {
    await sharp(file).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(path.join('public', output.replace('.webp', '-thumb.webp')));
  }
  await preserve(input);
}
const animation = 'images/projects/movinight-demo.gif';
try {
  await fs.access(path.join('public', animation));
  const output = 'images/projects/movinight-demo.mp4';
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join('public', animation), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join('public', output)]);
  await sharp(path.join('public', animation)).webp({ quality: 85, effort: 6 }).toFile('public/images/projects/movinight-demo-poster.webp');
  const oldBytes = (await fs.stat(path.join('public', animation))).size;
  const newBytes = (await fs.stat(path.join('public', output))).size;
  if (newBytes >= oldBytes) throw new Error('Animation conversion did not save bytes');
  const original = await sharp(path.join('public', animation), { animated: true }).metadata();
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path.join('public', output)], { encoding: 'utf8' }));
  const video = probe.streams.find(stream => stream.codec_type === 'video');
  if (video.width !== original.width || video.height !== original.pageHeight || Number(video.nb_frames) !== original.pages || Math.abs(Number(probe.format.duration) - original.delay.reduce((a, b) => a + b, 0) / 1000) > 0.05) throw new Error('Animation dimensions, frames, or timing changed');
  results.push({ input: animation, output, oldBytes, newBytes, frames: original.pages, duration: Number(probe.format.duration) });
  await preserve(animation);
} catch (error) { if (error.code !== 'ENOENT') throw error; }
// Full-size cover sources are unused backups, not browser assets.
const sources = 'images/projects/source';
try {
  for (const name of await fs.readdir(path.join('public', sources))) await preserve(`${sources}/${name}`);
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await fs.mkdir('artifacts/media-audit', { recursive: true });
await fs.writeFile('artifacts/media-audit/optimizations.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
