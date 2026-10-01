import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';

const phase = process.argv[2] || 'baseline';
const origin = process.env.AUDIT_URL || 'http://localhost:3001';
const directory = `artifacts/signal-path/${phase}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--remote-debugging-port=9224'] });
const matrix = [[320,568],[360,740],[390,844],[430,932],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080],[2560,1440],[3440,1440]];
const errors = [];
const measurements = [];
for (const [width,height] of matrix) {
  const page = await browser.newPage({ viewport: {width,height}, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, {waitUntil:'networkidle'});
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.portrait img').evaluate(image => image.decode());
  await page.screenshot({path:`${directory}/viewport-${width}.png`});
  if ([390,1440].includes(width)) await page.screenshot({path:`${directory}/page-${width}.png`,fullPage:true});
  measurements.push(await page.evaluate(() => {
    const bounds = selector => { const node=document.querySelector(selector); if(!node) return null; const r=node.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,visible:r.width>0&&r.height>0}; };
    return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,heading:bounds('#hero-name'),portrait:bounds('.portrait'),stats:bounds('.hero-stats'),cta:bounds('.hero-project-link'),stickers:[...document.querySelectorAll('[data-anchor]')].map(node=>({anchor:node.dataset.anchor,x:node.getBoundingClientRect().x,y:node.getBoundingClientRect().y}))};
  }));
  await page.close();
}
await writeFile(`${directory}/geometry.json`,JSON.stringify({measurements,errors},null,2));
const tracePage = await browser.newPage({viewport:{width:1440,height:900}});
const cdp = await tracePage.context().newCDPSession(tracePage);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline',transferMode:'ReturnAsStream'});
await tracePage.goto(origin,{waitUntil:'networkidle'});
await tracePage.waitForTimeout(4000);
const finished = new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
await cdp.send('Tracing.end');
const {stream} = await finished;
let trace='';
while(true){ const chunk=await cdp.send('IO.read',{handle:stream}); trace+=chunk.data; if(chunk.eof) break; }
await cdp.send('IO.close',{handle:stream});
await writeFile(`${directory}/hero-4x-trace.json`,trace);
await tracePage.close();
if (!process.env.SKIP_LIGHTHOUSE) for(const formFactor of ['mobile','desktop']) {
  const result=await lighthouse(origin,{port:9224,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},formFactor==='desktop'?{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:900,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}}:undefined);
  await writeFile(`${directory}/lighthouse-${formFactor}.json`,result.report);
  console.log(formFactor,JSON.stringify({scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([id,value])=>[id,value.score])),lcp:result.lhr.audits['largest-contentful-paint'].numericValue,cls:result.lhr.audits['cumulative-layout-shift'].numericValue}));
}
await browser.close();
console.log(`${phase}: ${measurements.length} viewports; ${errors.length} browser errors. Reports: ${directory}`);
