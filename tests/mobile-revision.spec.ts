import { test, expect, devices } from "@playwright/test";

for (const device of ["iPhone SE", "iPhone 13", "iPhone 13 Pro Max", "Pixel 7", "Galaxy S9+"]) {
  test(`phone stats, connectors, logos, and vertical projects on ${device}`, async ({ browser }) => {
    const context = await browser.newContext({ ...devices[device], baseURL: "http://localhost:3000", reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".hero-bottom")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const initial = await page.evaluate(() => ({
      scroll: window.scrollY,
      stats: document.querySelector(".hero-stats")!.getBoundingClientRect().bottom,
      navigation: document.querySelector(".bottom-nav")!.getBoundingClientRect().top,
    }));
    expect(initial.scroll).toBe(0);
    expect(initial.stats).toBeLessThan(initial.navigation);
    const labels = await page.locator(".hero-stats dt").evaluateAll((elements) => elements.map((element) => {
      const words = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getClientRects().length;
      });
      return { words, fits: element.scrollWidth <= element.clientWidth };
    }));
    expect(labels.every((label) => label.fits && label.words.every((lines) => lines === 1))).toBe(true);
    await expect(page.locator(".sticker-connector")).toHaveCount(4);
    for (const connector of await page.locator(".sticker-connector").all()) await expect(connector).toBeVisible();
    const printing = page.locator('.skill-items .tech-logo[title="3D printing · Bambu Lab"]');
    await expect(printing).toHaveText("3D printing");
    await expect(printing.locator("svg")).toBeVisible();
    const solidworks = page.locator('.skill-items .tech-logo[title="SOLIDWORKS"]');
    await solidworks.scrollIntoViewIfNeeded();
    await expect(solidworks.locator("img")).toHaveAttribute("src", /solidworks-cube/);
    await solidworks.locator("img").evaluate((image: HTMLImageElement) => image.decode());
    await expect(solidworks).toHaveText("SOLIDWORKS");
    const stacked = async (selector: string) => {
      const boxes = await page.locator(selector).evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()));
      for (let index = 1; index < boxes.length; index++) {
        expect(boxes[index].top).toBeGreaterThan(boxes[index - 1].bottom);
        expect(boxes[index].left).toBe(boxes[0].left);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    };
    await stacked(".featured-grid .project-card");
    if (device === "iPhone 13") {
      const style = ".site-header,.bottom-nav,.skip-link{visibility:hidden!important}";
      await page.locator(".hero").screenshot({ path: "artifacts/screenshots/revision-phone-hero.png", style });
      await page.locator("#work").screenshot({ path: "artifacts/screenshots/revision-phone-work.png", style });
      await page.locator(".skill-group").last().screenshot({ path: "artifacts/screenshots/revision-phone-cad.png", style });
    }
    await page.getByRole("link", { name: "Explore all 8 projects" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator(".project-list .project-card")).toHaveCount(8);
    await stacked(".project-list .project-card");
    await context.close();
  });
}

test("name, portrait, and every stat fit the first screen with phone browser bars", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: "http://localhost:3000", isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const page = await context.newPage();
  // Heights represent the usable page viewport after browser controls take space.
  for (const [width, height] of [[320, 480], [360, 560], [375, 547], [390, 600], [390, 664], [430, 740], [540, 720]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".portrait img").evaluate((image: HTMLImageElement) => image.decode());
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const header = rect(".site-header");
      const name = rect("#hero-name");
      const stats = rect(".hero-stats");
      const portrait = rect(".portrait");
      const navigation = rect(".bottom-nav");
      return { scroll: window.scrollY, headerBottom: header.bottom, nameTop: name.top, nameBottom: name.bottom, portraitTop: portrait.top, statsTop: stats.top, statsBottom: stats.bottom, navigationTop: navigation.top };
    });
    expect(geometry.scroll, `${width}×${height}`).toBe(0);
    expect(geometry.nameTop).toBeGreaterThanOrEqual(geometry.headerBottom);
    expect(geometry.nameBottom).toBeLessThanOrEqual(geometry.portraitTop);
    expect(geometry.portraitTop).toBeLessThan(geometry.statsTop);
    expect(geometry.statsBottom, `Every stat above navigation at ${width}×${height}`).toBeLessThan(geometry.navigationTop - 8);
    await page.screenshot({ path: `artifacts/screenshots/initial-view-${width}-${height}.png` });
  }
  await context.close();
});
