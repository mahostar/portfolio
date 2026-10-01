import fs from 'node:fs/promises';
import sharp from 'sharp';

await fs.mkdir('public/images/projects', { recursive: true });
const portrait = await sharp('photo.png').metadata();
if (!portrait.hasAlpha) throw new Error('The source portrait must have transparency; do not change the face. Supply a transparent cutout before continuing.');
let portraitBuffer;
for (const height of [Math.min(1400, portrait.height), 1200, 1100, 1000, 900]) {
  portraitBuffer = await sharp('photo.png').resize({ height, withoutEnlargement: true }).webp({ quality: 85, alphaQuality: 100, effort: 6 }).toBuffer();
  if (portraitBuffer.length <= 200 * 1024) break;
}
if (portraitBuffer.length > 200 * 1024) throw new Error('Portrait exceeds 200 KB');
await fs.writeFile('public/images/portrait.webp', portraitBuffer);
await sharp('bg.png').webp({ quality: 82, effort: 6 }).toFile('public/images/hero-bg.webp');
const hasMobile = await fs.access('bg-mobile.png').then(() => true).catch(() => false);
await (hasMobile ? sharp('bg-mobile.png') : sharp('bg.png').extract({ left: 1150, top: 0, width: 650, height: 793 })).webp({ quality: 82 }).toFile('public/images/hero-bg-mobile.webp');
await fs.access('cv.pdf').then(() => fs.copyFile('cv.pdf', 'public/cv.pdf')).catch(() => {});
console.log(`Portrait: ${portrait.width}×${portrait.height}, alpha preserved, ${(portraitBuffer.length / 1024).toFixed(1)} KB. Hero backgrounds ready. Project media is preserved.`);
