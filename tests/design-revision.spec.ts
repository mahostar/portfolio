import { test, expect } from "@playwright/test";

for (const width of [390, 768, 1440, 2560]) {
  test(`navigation clearance, project layout, and attached tags at ${width}px`, async ({
    page,
  }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const header = await page.locator(".site-header").boundingBox();
    const hero = await page.locator(".hero").boundingBox();
    expect(hero!.y).toBeGreaterThanOrEqual(header!.y + header!.height);

    const anchors = await page.locator(".anchor-dot").evaluateAll((dots) =>
      dots.map((dot) => {
        const point = dot.getBoundingClientRect();
        const art = document.querySelector(".hero-art-frame")!.getBoundingClientRect();
        return (
          point.left + point.width / 2 >= art.left &&
          point.left + point.width / 2 <= art.right &&
          point.top + point.height / 2 >= art.top &&
          point.top + point.height / 2 <= art.bottom
        );
      }),
    );
    expect(anchors).toEqual([true, true, true, true]);

    for (const route of ["/", "/projects"]) {
      if (route !== "/") await page.goto(route);
      const cards = page.locator(
        route === "/" ? ".featured-grid .project-card" : ".project-list .project-card",
      );
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      if (width >= 768) {
        expect(second!.y).toBeCloseTo(first!.y, 0);
        expect(second!.x).toBeGreaterThan(first!.x + first!.width);
      } else {
        expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      }
      const cover = await cards.nth(0).locator(".project-cover").boundingBox();
      const content = await cards.nth(0).locator(".project-content").boundingBox();
      expect(content!.y).toBeGreaterThanOrEqual(cover!.y + cover!.height - 1);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/");
    await page.screenshot({
      path: `artifacts/screenshots/design-revision-${width}.png`,
      fullPage: true,
      caret: "initial",
    });
    if (width === 1440) {
      await page.setViewportSize({ width, height: 1380 });
      await page.screenshot({
        path: "artifacts/screenshots/navbar-and-projects.png",
        caret: "initial",
      });
    }
    expect(browserErrors).toEqual([]);
  });
}
