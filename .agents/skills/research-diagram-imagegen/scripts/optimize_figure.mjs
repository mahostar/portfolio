import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const usage = "Usage: node optimize_figure.mjs --input <selected-raster> --output <figure.webp> [--max-width 1920] [--quality 92] [--report <metadata.json>] [--overwrite]";

async function main() {
  const options = { maxWidth: 1920, quality: 92, overwrite: false };
  const names = { "--input": "input", "--output": "output", "--max-width": "maxWidth", "--quality": "quality", "--report": "report" };
  const args = process.argv.slice(2);
  if (args.includes("--help")) { console.log(usage); return; }
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === "--overwrite") { options.overwrite = true; continue; }
    const name = names[flag];
    if (!name || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Invalid argument: ${flag}. ${usage}`);
    options[name] = args[++i];
  }
  if (!options.input || !options.output) throw new Error(usage);
  options.maxWidth = Number(options.maxWidth);
  options.quality = Number(options.quality);
  if (!Number.isInteger(options.maxWidth) || options.maxWidth < 1) throw new Error("--max-width must be a positive integer");
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) throw new Error("--quality must be an integer from 1 to 100");
  const input = path.resolve(options.input);
  const output = path.resolve(options.output);
  const reportPath = options.report ? path.resolve(options.report) : null;
  if (path.extname(output).toLowerCase() !== ".webp") throw new Error("--output must have a .webp extension");
  if (reportPath && path.extname(reportPath).toLowerCase() !== ".json") throw new Error("--report must have a .json extension");
  const paths = [input, output, ...(reportPath ? [reportPath] : [])].map((value) => process.platform === "win32" ? value.toLowerCase() : value);
  if (new Set(paths).size !== paths.length) throw new Error("Input, output, and report must be different files");
  for (const target of [output, ...(reportPath ? [reportPath] : [])]) {
    const existing = await fs.stat(target).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (existing && (!options.overwrite || !existing.isFile())) throw new Error(`Refusing to replace ${target}; choose a sibling filename or use --overwrite for a file`);
  }
  const source = await fs.readFile(input);
  const metadata = await sharp(source).metadata();
  if (metadata.pages > 1) throw new Error("This figure helper supports a single still image; it would discard animation/multipage content");
  if (metadata.format === "svg" || metadata.format === "pdf") throw new Error("Use a selected raster image here; export vector bases separately");
  const { data, info } = await sharp(source).rotate()
    .resize({ width: options.maxWidth, withoutEnlargement: true })
    .webp({ quality: options.quality, effort: 6 }).toBuffer({ resolveWithObject: true });
  const report = {
    input, output, width: info.width, height: info.height, bytes: data.length,
    format: "webp", maxWidth: options.maxWidth, quality: options.quality, effort: 6,
    inputSha256: createHash("sha256").update(source).digest("hex"),
    outputSha256: createHash("sha256").update(data).digest("hex"),
  };
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, data, { flag: options.overwrite ? "w" : "wx" });
  if (reportPath) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", { flag: options.overwrite ? "w" : "wx" });
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
