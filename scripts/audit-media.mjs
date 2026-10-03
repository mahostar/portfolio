import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const mediaPattern = /\.(png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|mov|mp3|wav|ogg)$/i;
async function files(root) {
  const result = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await files(file));
    else result.push(file);
  }
  return result;
}
const source = (await Promise.all((await files('src')).filter(f => /\.(tsx?|mdx|css|json)$/.test(f) && !f.endsWith('bundled-projects.json')).map(f => fs.readFile(f, 'utf8')))).join('\n');
const records = [];
for (const file of (await files('public')).filter(f => mediaPattern.test(f))) {
  const data = await fs.readFile(file);
  const url = '/' + path.relative('public', file).replaceAll('\\', '/');
  const record = { url, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex'), referenced: source.includes(url) };
  if (/\.(mp4|webm|mov|mp3|wav|ogg)$/i.test(file)) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8' }));
    record.duration = Number(probe.format.duration);
    record.streams = probe.streams.map(s => ({ type: s.codec_type, codec: s.codec_name, width: s.width, height: s.height, frameRate: s.avg_frame_rate, bitrate: s.bit_rate }));
    const moov = data.indexOf(Buffer.from('moov'));
    const mdat = data.indexOf(Buffer.from('mdat'));
    record.fastStart = moov >= 0 && moov < mdat;
  } else if (!/\.svg$/i.test(file)) {
    try {
      const m = await sharp(file, { animated: true }).metadata();
      Object.assign(record, { width: m.width, height: m.pageHeight || m.height, frames: m.pages || 1, alpha: m.hasAlpha });
    } catch (error) { record.decodeError = error.message; }
  }
  records.push(record);
}
records.sort((a, b) => b.bytes - a.bytes);
const report = { totalBytes: records.reduce((sum, r) => sum + r.bytes, 0), count: records.length, records };
await fs.mkdir('artifacts/media-audit', { recursive: true });
const output = process.argv[2] || 'artifacts/media-audit/current.json';
await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ count: report.count, totalMB: (report.totalBytes / 1e6).toFixed(2), output, largest: records.slice(0, 18).map(({url,bytes,width,height,frames,referenced}) => ({url,bytes,width,height,frames,referenced})) }, null, 2));
