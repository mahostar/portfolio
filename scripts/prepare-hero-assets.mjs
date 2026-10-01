import sharp from "sharp";
import { readFile, stat } from "node:fs/promises";

// Regenerate from the committed originals, never from compressed outputs.
const background = await readFile("bg.png");
const dimensions = await sharp(background).metadata();
if (dimensions.width !== 1983 || dimensions.height !== 793) {
  throw new Error(
    "Update the anchor tables and image-space routes for the new source dimensions.",
  );
}
await sharp(background)
  .webp({ quality: 70, effort: 6 })
  .toFile("public/images/hero-bg.webp");
// Retain the actual J1 UART header, U3, trace fan-out, and regulator area.
await sharp(background)
  .extract({ left: 960, top: 0, width: 1023, height: 793 })
  .webp({ quality: 72, effort: 6 })
  .toFile("public/images/hero-bg-mobile.webp");
await sharp(await readFile("photo.png"))
  .resize({ width: 920 })
  .webp({ quality: 78, alphaQuality: 90, effort: 6 })
  .toFile("public/images/portrait.webp");
for (const name of ["hero-bg", "hero-bg-mobile", "portrait"])
  console.log(name, (await stat(`public/images/${name}.webp`)).size);
