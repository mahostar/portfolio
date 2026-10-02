// Publish reviewed derivatives only. Raw sources, notes and unresolved evidence stay private.
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('Achievements');
const assets=JSON.parse(await fs.readFile(path.join(root,'catalog/manifest.json'),'utf8'));
const excluded=new Set(['055','056','057','122','124']);
// Publication of identifiable people/certificates requires the pending explicit approval.
const technicalOnly=new Set(['001','002','003','004','005','006','007','009','010','011','014','015','016','017','018','019','026','028','029','030','032','033','034','035','036','051','052','055','056','058','059','062','063','065','069','070','071','072','073','077','078','079','081','082','083','084','086','087','088','089','090','091','097','098','104','105','106','107','108','110']);
const peopleApproved=process.argv.includes('--include-adults');
// Owner explicitly approved adult photos and scans, and excluded children.
const childOrUncertainWorkshop=new Set(['093','094','095','099','100','101','102','103','109','111','112']);
for(const id of childOrUncertainWorkshop) excluded.add(id);
excluded.delete('055');excluded.delete('056');
const media=[];
for(const a of assets.filter(a=>a.derivatives.length && !excluded.has(a.id) && (peopleApproved || technicalOnly.has(a.id)))) {
  if(['055','056'].includes(a.id)) {
    a.folder='projects/niotoshield/hardware';a.tags=['project:niotoshield'];
  }
  if(a.folder==='projects/medical-robot') a.tags=['milestone:medical-robot'];
  const main=a.derivatives.find(d=>d.type==='video')??a.derivatives.find(d=>d.type==='image');
  const poster=a.derivatives.find(d=>d.type==='poster')??a.derivatives.find(d=>d.type==='image');
  const thumbnail=a.derivatives.find(d=>d.type==='thumbnail');
  const publish=async d=>{
    const isVideo=d.type==='video';
    const relative=`${isVideo?'videos':'images'}/evidence/${a.folder}/${path.basename(d.path)}`;
    const destination=path.resolve('public',relative);
    if(!destination.startsWith(path.resolve('public')+path.sep)) throw new Error('Unsafe publication path');
    await fs.mkdir(path.dirname(destination),{recursive:true});
    await fs.copyFile(path.join(root,d.path),destination);
    return '/'+relative;
  };
  const src=await publish(main);
  const preview=await publish(poster);
  const thumb=await publish(thumbnail);
  const concept=/concept|architecture/.test(a.folder) && ['028','035','091','092'].includes(a.id) || a.id==='090';
  media.push({id:a.id,src,preview,thumbnail:thumb,type:main.type==='video'?'video':'image',caption:a.name.replaceAll('-',' ').replace(/^./,s=>s.toUpperCase()),alt:a.name.replaceAll('-',' '),width:a.webWidth,height:a.webHeight,concept,tags:a.tags,folder:a.folder});
}
await fs.writeFile('src/content/evidence.json',JSON.stringify(media,null,2));
console.log(`Published ${media.length} reviewed media records. Excluded IDs: ${[...excluded].join(', ')}.`);
