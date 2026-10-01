import { test, expect } from "@playwright/test";

// Check the rendered portrait's conservative hair/head rectangle, not just its img box.
// The supplied cutout is 1217×1292. Boundaries include hair and a safety margin.
test("dense width and height sweep keeps every hero text line outside the head", async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".portrait img").evaluate((img: HTMLImageElement) => img.decode());
  const dimensions: [number, number][] = [];
  for (let width = 280; width <= 2560; width += 17) dimensions.push([width, 900]);
  for (const width of [280,320,360,390,430,540,600,640,767,768,800,900,1024,1280,1440,1920,2560]) {
    for (const height of [240,320,400,600,844,1080]) dimensions.push([width,height]);
  }
  for (const [width,height] of dimensions) {
    await page.setViewportSize({width,height});
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const result = await page.evaluate(() => {
      window.scrollTo(0,0);
      const image = document.querySelector<HTMLImageElement>(".portrait img")!;
      const r = image.getBoundingClientRect();
      const scale = Math.min(r.width/1217,r.height/1292);
      const iw=1217*scale, ih=1292*scale;
      const ox=r.x+(r.width-iw)/2, oy=r.bottom-ih;
      const face={left:ox+iw*.25-8,right:ox+iw*.75+8,top:oy-8,bottom:oy+ih*.62+8};
      const collisions:string[]=[];
      for(const region of document.querySelectorAll(".hero-copy, .hero-bottom, .stickers, .site-header")) {
        const walker=document.createTreeWalker(region,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
          const node=walker.currentNode;
          if(!node.textContent?.trim()) continue;
          const range=document.createRange(); range.selectNodeContents(node);
          for(const b of range.getClientRects()) {
            if(b.width&&b.height&&b.left<face.right&&b.right>face.left&&b.top<face.bottom&&b.bottom>face.top) collisions.push(node.textContent.trim());
          }
        }
      }
      const cards=[...document.querySelectorAll(".featured-grid .project-card")];
      const clipped=cards.filter(card=>{
        const cr=card.getBoundingClientRect();
        return [...card.querySelectorAll("h3,.project-summary,.project-bottom")].some(el=>{
          const b=el.getBoundingClientRect(); return b.width&&b.height&&(b.bottom>cr.bottom+1||b.top<cr.top-1);
        });
      }).map(card=>card.textContent?.trim());
      return {collisions,clipped,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};
    });
    expect(result,`Layout ${width}×${height}`).toEqual({collisions:[],clipped:[],overflow:false});
  }
});

test("200 percent text enlargement preserves content and portrait separation", async ({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  for(const width of [280,390,640,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto("/");
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{
      const sizes=[...document.querySelectorAll<HTMLElement>("body *")].map(el=>[el,parseFloat(getComputedStyle(el).fontSize)] as const);
      for(const [el,size] of sizes) if(el.childNodes.length&&[...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent?.trim())) el.style.fontSize=`${size*2}px`;
    });
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`Text enlargement at ${width}`).toBe(true);
    const copy=await page.locator(".hero-copy").boundingBox();
    const portrait=await page.locator(".portrait-region").boundingBox();
    expect(width<768 ? copy!.y+copy!.height<=portrait!.y+1 : copy!.x+copy!.width<=portrait!.x+1).toBe(true);
    await page.screenshot({path:`artifacts/screenshots/text-200-${width}.png`,fullPage:true});
  }
});
