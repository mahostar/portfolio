#!/usr/bin/env node
/**
 * make-trace-mask.mjs
 *
 * Turns the hero PCB background into an ALPHA MASK of its copper traces.
 * Traces become opaque, everything else becomes transparent. In CSS the mask
 * clips a moving light layer, so light appears to run inside the REAL copper.
 *
 *   npm i -D sharp
 *   node scripts/make-trace-mask.mjs                 # desktop + mobile
 *   node scripts/make-trace-mask.mjs --only desktop --preview
 *   node scripts/make-trace-mask.mjs --coverage 0.10 --min-area 60 --preview
 *
 * How it works (all steps run on a greyscale copy):
 *   1. High-pass: score = (pixel - blurred) / (blurred + 20). This finds thin
 *      bright lines on a darker field and ignores the smooth blue gradient.
 *   2. Threshold: the stricter of two limits wins.
 *        noise limit    = median + k * robust noise  (never picks plain noise)
 *        coverage limit = top `--coverage` share      (never over-fills)
 *      Or force it with --threshold.
 *   3. Remove specks: connected blobs smaller than --min-area are deleted.
 *      Traces are long connected shapes, noise is not.
 *   4. Dilate by --dilate px, then soften the edge a little (anti-alias).
 *   5. Optional --fade-left so traces calm down behind the headline.
 *   6. Encode to WebP with alpha and keep it under --budget KB.
 *
 * IMPORTANT: the mask keeps the exact ASPECT RATIO of the source image.
 * In CSS use the same size and position as the background image:
 *   mask: url(...) right center / cover no-repeat;   (same as object-position: right center)
 * Then every mask pixel sits on top of the same pixel of the photo.
 */
import sharp from "sharp";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const REF_WIDTH = 1600; // all pixel options below are defined at this width and scaled
const JOBS = {
  desktop: {
    input: "public/images/hero-bg.webp",
    output: "public/images/hero-traces-mask.webp",
    width: 1983,
  },
  mobile: {
    input: "public/images/hero-bg-mobile.webp",
    output: "public/images/hero-traces-mask-mobile.webp",
    width: 1023,
  },
};

const { values: o } = parseArgs({
  options: {
    only: { type: "string" },
    in: { type: "string" },
    out: { type: "string" },
    width: { type: "string" },
    sigma: { type: "string", default: "3.2" },
    coverage: { type: "string", default: "0.12" },
    "noise-k": { type: "string", default: "6" },
    threshold: { type: "string" },
    "min-area": { type: "string", default: "100" },
    dilate: { type: "string", default: "1" },
    soften: { type: "string", default: "0.7" },
    "fade-left": { type: "string", default: "0.3" },
    budget: { type: "string", default: "60" },
    meta: { type: "string", default: "src/content/hero-meta.generated.json" },
    preview: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (o.help) {
  console.log(`Options:
  --only desktop|mobile   run one job            --in/--out   custom files (with --only)
  --width N               output width in px     --sigma N    blur for the high-pass (default 3.2)
  --coverage 0..1         MAX trace share        --threshold N  force a score threshold
  --noise-k N             noise guard (def. 5, higher = stricter)
  --min-area N            drop blobs < N px      --dilate N   thicken lines (default 1)
  --soften N              edge blur (default .7) --fade-left 0..1  fade traces on the left part
  --budget KB             size limit (def. 60)   --preview    write debug PNGs to scripts/.out/`);
  process.exit(0);
}

const num = (v) => Number(v);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---------- pixel steps ----------

// Histogram helpers for the score values (range -1..3 is plenty after clamping).
const LO = -1,
  HI = 3,
  BINS = 4096;
const binOf = (v) => clamp(Math.floor(((v - LO) / (HI - LO)) * BINS), 0, BINS - 1);
const valueOf = (b) => LO + ((b + 0.5) / BINS) * (HI - LO);

// Two limits, the stricter wins:
//   noiseLimit = median + k * (1.4826 * MAD)   -> never picks plain image noise
//   coverageLimit = value where the top `coverage` share of pixels begins -> never over-fills
function pickThreshold(score, coverage, k) {
  const hist = new Uint32Array(BINS);
  for (let i = 0; i < score.length; i++) hist[binOf(score[i])]++;
  const atShare = (share, from) => {
    // value where `share` of pixels lie below (from=0) or above (from=1)
    const want = score.length * share;
    let acc = 0;
    if (from === 1) {
      for (let b = BINS - 1; b >= 0; b--) {
        acc += hist[b];
        if (acc >= want) return valueOf(b);
      }
      return LO;
    }
    for (let b = 0; b < BINS; b++) {
      acc += hist[b];
      if (acc >= want) return valueOf(b);
    }
    return HI;
  };
  const median = atShare(0.5, 0);
  const dev = new Uint32Array(BINS);
  for (let i = 0; i < score.length; i++)
    dev[
      clamp(Math.floor((Math.abs(score[i] - median) / (HI - LO)) * BINS), 0, BINS - 1)
    ]++;
  let acc = 0,
    mad = 0;
  for (let b = 0; b < BINS; b++) {
    acc += dev[b];
    if (acc >= score.length / 2) {
      mad = ((b + 0.5) / BINS) * (HI - LO);
      break;
    }
  }
  const noiseLimit = median + k * 1.4826 * mad;
  const coverageLimit = atShare(coverage, 1);
  return { threshold: Math.max(noiseLimit, coverageLimit), noiseLimit, coverageLimit };
}

// 8-connected blob removal. Returns the number of removed blobs.
function removeSmallBlobs(mask, w, h, minArea) {
  if (minArea <= 1) return 0;
  const seen = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  let removed = 0;
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let head = 0,
      tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    while (head < tail) {
      const p = queue[head++];
      const x = p % w,
        y = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (mask[q] && !seen[q]) {
            seen[q] = 1;
            queue[tail++] = q;
          }
        }
    }
    if (tail < minArea) {
      for (let i = 0; i < tail; i++) mask[queue[i]] = 0;
      removed++;
    }
  }
  return removed;
}

// Separable max filter (square). Small radius only.
function dilate(mask, w, h, r) {
  if (r <= 0) return mask;
  const tmp = new Uint8Array(mask.length);
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r && !v; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w && mask[y * w + xx]) v = 1;
      }
      tmp[y * w + x] = v;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r && !v; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h && tmp[yy * w + x]) v = 1;
      }
      out[y * w + x] = v;
    }
  return out;
}

// ---------- job ----------

async function run(name, job) {
  const t0 = Date.now();
  const input = path.resolve(job.input);
  const meta = await sharp(input).metadata();
  const width = Math.min(job.width, meta.width);
  const scale = width / REF_WIDTH;
  const sigma = clamp(num(o.sigma) * scale, 0.3, 50);
  const radius = Math.max(0, Math.round(num(o.dilate) * scale));
  const minArea = Math.max(1, Math.round(num(o["min-area"]) * scale * scale));

  const base = sharp(input)
    .rotate()
    .removeAlpha()
    .resize({ width, withoutEnlargement: true })
    .toColourspace("b-w");
  const first = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = first.info;
  const blurredRaw = await base.clone().blur(sigma).raw().toBuffer();
  // Safety: some sharp builds still return 3 channels for greyscale. Keep channel 0 only.
  const only = (buf) => {
    if (channels === 1) return buf;
    const out = Buffer.alloc(w * h);
    for (let i = 0; i < out.length; i++) out[i] = buf[i * channels];
    return out;
  };
  const gray = only(first.data),
    blurred = only(blurredRaw);

  const score = new Float32Array(w * h);
  for (let i = 0; i < score.length; i++)
    score[i] = (gray[i] - blurred[i]) / (blurred[i] + 20);

  const picked =
    o.threshold !== undefined
      ? { threshold: num(o.threshold), noiseLimit: NaN, coverageLimit: NaN }
      : pickThreshold(score, clamp(num(o.coverage), 0.01, 0.6), num(o["noise-k"]));
  const threshold = picked.threshold;
  let mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = score[i] >= threshold ? 1 : 0;

  const removed = removeSmallBlobs(mask, w, h, minArea);
  mask = dilate(mask, w, h, radius);

  // Soft edge: blur the 0/255 mask a little for anti-aliasing.
  const hard = Buffer.alloc(w * h);
  for (let i = 0; i < hard.length; i++) hard[i] = mask[i] ? 255 : 0;
  const softOut = await sharp(hard, { raw: { width: w, height: h, channels: 1 } })
    .blur(clamp(num(o.soften) * Math.max(scale, 0.5) + 0.3, 0.3, 5))
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const soft =
    softOut.info.channels === 1
      ? softOut.data
      : (() => {
          const c = softOut.info.channels,
            out = Buffer.alloc(w * h);
          for (let i = 0; i < out.length; i++) out[i] = softOut.data[i * c];
          return out;
        })();
  if (soft.length !== w * h) throw new Error("Mask buffer size mismatch");

  // Optional fade on the left side (headline area).
  const fade = clamp(num(o["fade-left"]), 0, 1);
  const alpha = Buffer.from(soft);
  if (fade > 0)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        alpha[y * w + x] = Math.round(alpha[y * w + x] * smoothstep(0, fade, x / w));

  const rgba = Buffer.alloc(w * h * 4);
  let on = 0;
  for (let i = 0; i < alpha.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = alpha[i];
    if (alpha[i] > 127) on++;
  }

  // Encode, stepping alpha quality down until the file fits the budget.
  const budget = num(o.budget) * 1024;
  let encoded = null,
    usedQuality = 0;
  for (const alphaQuality of [100, 90, 75, 60, 45, 30]) {
    encoded = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .webp({ quality: 50, alphaQuality, effort: 6, smartSubsample: true })
      .toBuffer();
    usedQuality = alphaQuality;
    if (encoded.length <= budget) break;
  }
  const output = path.resolve(job.output);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, encoded);

  const srcRatio = meta.width / meta.height,
    outRatio = w / h;
  console.log(
    `\n[${name}] ${job.input}  ${meta.width}x${meta.height}  ->  ${job.output}  ${w}x${h}`,
  );
  console.log(
    `  threshold ${threshold.toFixed(3)} (noise ${picked.noiseLimit.toFixed(3)}, coverage ${picked.coverageLimit.toFixed(3)})  trace coverage ${((on / (w * h)) * 100).toFixed(1)}%  specks removed ${removed}  dilate ${radius}px  sigma ${sigma.toFixed(2)}`,
  );
  console.log(
    `  size ${(encoded.length / 1024).toFixed(1)} KB (alphaQuality ${usedQuality}, budget ${o.budget} KB)  aspect error ${((Math.abs(srcRatio - outRatio) / srcRatio) * 100).toFixed(3)}%`,
  );
  if (encoded.length > budget)
    console.warn(
      "  WARNING over budget. Try: lower --width, raise --min-area, or lower --coverage.",
    );
  if (Math.abs(srcRatio - outRatio) / srcRatio > 0.005)
    console.warn(
      "  WARNING aspect ratio drifted. The mask will not line up with the photo.",
    );

  if (o.preview) {
    await mkdir("scripts/.out", { recursive: true });
    const tint = Buffer.alloc(w * h * 4);
    for (let i = 0; i < alpha.length; i++) {
      tint[i * 4] = 255;
      tint[i * 4 + 1] = 212;
      tint[i * 4 + 2] = 0;
      tint[i * 4 + 3] = Math.round(alpha[i] * 0.85);
    }
    const photo = await sharp(input).removeAlpha().resize({ width: w }).png().toBuffer();
    await sharp(photo)
      .composite([{ input: tint, raw: { width: w, height: h, channels: 4 } }])
      .png()
      .toFile(`scripts/.out/trace-preview-${name}.png`);
    await sharp(hard, { raw: { width: w, height: h, channels: 1 } })
      .png()
      .toFile(`scripts/.out/trace-mask-${name}.png`);
    console.log(`  preview  scripts/.out/trace-preview-${name}.png  (yellow = traces)`);
  }
  console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return { w: meta.width, h: meta.height };
}

const names = o.only ? [o.only] : Object.keys(JOBS);
const sizes = {};
for (const name of names) {
  if (!JOBS[name]) {
    console.error(`Unknown job "${name}". Use desktop or mobile.`);
    process.exit(1);
  }
  const job = {
    ...JOBS[name],
    ...(o.only && o.in ? { input: o.in } : {}),
    ...(o.only && o.out ? { output: o.out } : {}),
    ...(o.width ? { width: num(o.width) } : {}),
  };
  try {
    await stat(path.resolve(job.input));
  } catch {
    console.error(`Missing input: ${job.input}`);
    process.exit(1);
  }
  sizes[name] = await run(name, job);
}

// The hero needs the SOURCE image size for the cover math and the SVG viewBox.
await mkdir(path.dirname(path.resolve(o.meta)), { recursive: true });
let previous = {};
try {
  previous = JSON.parse(await readFile(path.resolve(o.meta), "utf8"));
} catch {
  /* first run */
}
await writeFile(
  path.resolve(o.meta),
  JSON.stringify({ ...previous, ...sizes }, null, 2) + "\n",
);
console.log(
  `\nSource sizes written to ${o.meta}: ${JSON.stringify({ ...previous, ...sizes })}`,
);
