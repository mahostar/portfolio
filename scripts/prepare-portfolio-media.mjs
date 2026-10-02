// Reviewed asset classification -> preserved originals + private web copies.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const workspace = process.cwd();
const root = path.resolve('Achievements');
const legacy = path.resolve('Achivments');
const exists = file => fs.access(file).then(() => true, () => false);
function checked(base, relative) {
  const target = path.resolve(base, relative);
  if (target === base || !target.startsWith(base + path.sep)) throw new Error(`Unsafe path: ${target}`);
  return target;
}
const hash = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
if (path.dirname(root) !== workspace || path.dirname(legacy) !== workspace) throw new Error('Root outside workspace');
const manifestFile = checked(root, 'catalog/source-manifest.json');
const reviewed = await exists(manifestFile) ? manifestFile : path.resolve('artifacts/evidence-review/classification.json');
const assets = JSON.parse(await fs.readFile(reviewed, 'utf8'));
for (const a of assets) {
  a.sourcePath = `originals/${a.folder}/${a.name}--${a.id}${path.extname(a.originalName).toLowerCase()}`;
  checked(root, a.sourcePath); checked(legacy, a.originalPath);
}
if (!process.argv.includes('--apply')) {
  console.log(`Dry run: ${assets.length} originals organized under ${root}. Run --apply to proceed.`);
  process.exit(0);
}
if (await exists(legacy)) {
  if (!(await exists(root))) {
    try { await fs.rename(legacy, root); }
    catch (error) {
      if (error.code !== 'EPERM') throw error;
      // An Explorer window can hold the root open. Move checked files individually.
      await fs.mkdir(root,{recursive:true});
    }
  }
}
await fs.mkdir(path.dirname(manifestFile), {recursive:true});
await fs.writeFile(manifestFile, JSON.stringify(assets,null,2));
for (const a of assets) {
  const oldFile = await exists(checked(root,a.originalPath)) ? checked(root,a.originalPath) : checked(legacy,a.originalPath);
  const newFile = checked(root,a.sourcePath);
  const current = await exists(newFile) ? newFile : oldFile;
  if (await hash(current) !== a.sha256) throw new Error(`Checksum mismatch: ${a.id}`);
  if (current !== newFile) {
    await fs.mkdir(path.dirname(newFile),{recursive:true});
    await fs.rename(current,newFile);
  }
}
// Only remove empty legacy folders; never recursively delete originals.
async function removeEmpty(dir,base=root) {
  checked(base,path.relative(base,dir));
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    if (entry.isDirectory()) await removeEmpty(path.join(dir,entry.name),base);
  }
  if (!(await fs.readdir(dir)).length) await fs.rmdir(dir);
}
for (const entry of await fs.readdir(root,{withFileTypes:true})) {
  if (entry.isDirectory() && !['originals','web','catalog'].includes(entry.name)) await removeEmpty(path.join(root,entry.name));
}
if (await exists(legacy)) {
  for (const entry of await fs.readdir(legacy,{withFileTypes:true})) {
    if (entry.isDirectory()) {
      try {await removeEmpty(path.join(legacy,entry.name),legacy);}
      catch(error) {if(error.code!=='EPERM') throw error;}
    }
  }
  await fs.writeFile(checked(legacy,'README-MOVED.txt'),'Your media library is now E:\\portfolio\\Achievements. All originals are preserved in originals/; see README.md and catalog/ for the classification.\n');
}
const ffmpeg = args => execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:['ignore','ignore','pipe']});
const probe = file => JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{encoding:'utf8'}));
const output = [];
const cacheFile = checked(root,'catalog/manifest.json');
const previous = await exists(cacheFile) ? JSON.parse(await fs.readFile(cacheFile,'utf8')) : [];
for (const a of assets) {
  const source = checked(root,a.sourcePath);
  const base = `web/${a.folder}/${a.name}--${a.id}`;
  const imageFile = checked(root,`${base}.webp`);
  const thumbFile = checked(root,`${base}-thumb.webp`);
  const record = {...a,optimizationVersion:1,derivatives:[]};
  const cached = previous.find(p=>p.id===a.id && p.sha256===a.sha256 && p.optimizationVersion===1);
  if (cached && (await Promise.all(cached.derivatives.map(d=>exists(checked(root,d.path))))).every(Boolean)) {
    output.push(cached); continue;
  }
  if (!['image','video','animation'].includes(a.kind)) {output.push(record);continue;}
  await fs.mkdir(path.dirname(imageFile),{recursive:true});
  const add = async (file,type) => record.derivatives.push({path:path.relative(root,file).replaceAll('\\','/'),type,bytes:(await fs.stat(file)).size,sha256:await hash(file)});
  try {
    if (a.kind === 'image') {
      let input = source;
      try { await sharp(source).rotate().resize(32,32,{fit:'inside'}).toBuffer(); }
      catch {
        input = checked(root,`catalog/recovery-cache/${a.id}.png`);
        await fs.mkdir(path.dirname(input),{recursive:true});
        ffmpeg(['-i',source,'-frames:v','1',input]);
        record.recovery = 'FFmpeg decoded malformed JPEG; original preserved.';
      }
      const text = a.tags.includes('certificate') || /software|app|architecture|website|models/.test(a.folder);
      const size = a.tags.includes('certificate') ? 2400 : 1600;
      await sharp(input).rotate().resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({quality:text?92:84,effort:5}).toFile(imageFile);
      await sharp(input).rotate().resize(480,480,{fit:'inside',withoutEnlargement:true}).webp({quality:76}).toFile(thumbFile);
      const meta = await sharp(imageFile).metadata();
      record.webWidth=meta.width;record.webHeight=meta.height;
      await add(imageFile,'image');await add(thumbFile,'thumbnail');
    } else {
      const videoFile=checked(root,`${base}.mp4`);
      const scale="scale='if(gte(iw,ih),min(1280,iw),min(720,iw))':'if(gte(iw,ih),min(720,ih),min(1280,ih))':force_original_aspect_ratio=decrease:force_divisible_by=2";
      ffmpeg(['-i',source,'-map','0:v:0','-map','0:a?','-vf',`${scale},fps=30`,'-c:v','libx264','-preset','medium','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',videoFile]);
      if(a.kind==='video' && (await fs.stat(videoFile)).size>a.bytes) {
        ffmpeg(['-i',source,'-map','0:v:0','-map','0:a?','-c','copy','-movflags','+faststart',videoFile]);
        record.videoMode='Original streams remuxed; transcoding offered no size benefit.';
      } else record.videoMode='H.264/AAC, up to 720p, 30 fps, fast-start MP4.';
      const meta=probe(videoFile);
      const stream=meta.streams.find(s=>s.codec_type==='video');
      record.webWidth=stream.width;record.webHeight=stream.height;
      record.webDuration=Number(meta.format.duration);
      const poster=checked(root,`catalog/recovery-cache/poster-${a.id}.png`);
      await fs.mkdir(path.dirname(poster),{recursive:true});
      ffmpeg(['-ss',String(Math.min(3,record.webDuration/3)),'-i',videoFile,'-frames:v','1',poster]);
      await sharp(poster).resize(1280,1280,{fit:'inside',withoutEnlargement:true}).webp({quality:84}).toFile(imageFile);
      await sharp(poster).resize(480,480,{fit:'inside',withoutEnlargement:true}).webp({quality:76}).toFile(thumbFile);
      await add(videoFile,'video');await add(imageFile,'poster');await add(thumbFile,'thumbnail');
    }
    delete record.error;
  } catch(error) {record.processingError=error.message;}
  output.push(record);
  await fs.writeFile(cacheFile,JSON.stringify(output,null,2));
  console.log(`${a.id} ${a.name}: ${record.processingError?'ERROR':'ready'}`);
}
await fs.writeFile(cacheFile,JSON.stringify(output,null,2));
const csv=value=>`"${String(value??'').replaceAll('"','""')}"`;
await fs.writeFile(checked(root,'catalog/asset-catalog.csv'),[
  ['ID','Category','Name','Kind','Original filename','Old path','Organized source','Bytes','Tags','Notes','Web files','Processing error'].map(csv).join(','),
  ...output.map(a=>[a.id,a.folder,a.name,a.kind,a.originalName,a.originalPath,a.sourcePath,a.bytes,a.tags.join('; '),a.note,a.derivatives.map(d=>d.path).join('; '),a.processingError].map(csv).join(',')),
].join('\n'));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const cards=output.filter(a=>a.derivatives.length).map(a=>{
  const thumb=a.derivatives.find(d=>d.type==='thumbnail');
  const main=a.derivatives.find(d=>d.type==='video')??a.derivatives.find(d=>d.type==='image');
  return `<article data-search="${esc(`${a.id} ${a.folder} ${a.name} ${a.tags.join(' ')}`.toLowerCase())}"><a href="../${encodeURI(main.path)}"><img loading="lazy" src="../${encodeURI(thumb.path)}" alt="${esc(a.name)}"></a><small>${esc(a.id+' · '+a.kind+' · '+a.folder)}</small><h2>${esc(a.name.replaceAll('-',' '))}</h2><p>${esc(a.note)}</p><a href="../${encodeURI(a.sourcePath)}">Original</a> · <a href="../${encodeURI(main.path)}">Web version</a>${a.tags.includes('restricted')?'<b class="restricted">Redact private identifiers before publishing</b>':''}</article>`;
}).join('\n');
await fs.writeFile(checked(root,'catalog/gallery.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio evidence catalogue</title><style>body{margin:0;padding:32px;background:#0b1328;color:#e7edf8;font:15px system-ui}h1{margin-top:0}input{padding:14px;width:min(600px,90%);margin:16px 0 24px;background:#172640;color:white;border:1px solid #597096;border-radius:8px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}article{padding:16px;background:#14213a;border-radius:10px}img{width:100%;height:190px;object-fit:contain;background:#0b1328}h2{font-size:17px}small,p{color:#adbdd7;font-size:12px}a{color:#8bc7ff}.restricted{display:block;color:#ffdb58;margin-top:10px}</style><h1>Portfolio evidence catalogue</h1><p>Private local review. Originals are preserved. Search projects, milestones, certificates, review or an asset ID.</p><input type="search" placeholder="Search assets…" aria-label="Search assets"><div class="grid">${cards}</div><script>document.querySelector('input').addEventListener('input',e=>{const query=e.target.value.toLowerCase();for(const card of document.querySelectorAll('article'))card.hidden=!card.dataset.search.includes(query);});</script></html>`);
const summary={files:output.length,media:output.filter(a=>['image','video','animation'].includes(a.kind)).length,originalBytes:output.reduce((n,a)=>n+a.bytes,0),webBytes:output.reduce((n,a)=>n+a.derivatives.reduce((m,d)=>m+d.bytes,0),0),primaryWebBytes:output.reduce((n,a)=>n+a.derivatives.filter(d=>['image','video'].includes(d.type)).reduce((m,d)=>m+d.bytes,0),0),recovered:output.filter(a=>a.recovery).map(a=>a.id),errors:output.filter(a=>a.processingError).map(a=>({id:a.id,error:a.processingError}))};
await fs.writeFile(checked(root,'catalog/summary.json'),JSON.stringify(summary,null,2));
// Remove known temporary decoded frames after successful derivative generation.
for(const a of output.filter(a=>!a.processingError && a.derivatives.length)) {
  for(const name of [`${a.id}.png`,`poster-${a.id}.png`]) {
    const temporary=checked(root,`catalog/recovery-cache/${name}`);
    if(await exists(temporary)) await fs.unlink(temporary);
  }
}
const recoveryDir=checked(root,'catalog/recovery-cache');
if(await exists(recoveryDir) && !(await fs.readdir(recoveryDir)).length) await fs.rmdir(recoveryDir);
console.log(JSON.stringify(summary,null,2));
