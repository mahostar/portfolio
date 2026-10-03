import { expect, test } from "@playwright/test";

for (const route of ["/", "/projects"]) {
  test(`header keeps controls on one row while resizing ${route}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const widths = new Set([280, 320, 340, 341, 390, 402, 403, 404, 480, 767, 768, 1100, 1101, 1440, 1920, 2560]);
    for (let width = 330; width <= 420; width++) widths.add(width);
    for (let width = 280; width <= 1440; width += 31) widths.add(width);
    const ascending = [...widths].sort((a, b) => a - b);
    for (const width of [...ascending, ...ascending.toReversed()]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => {
        const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
        const row = rect(".nav-inner");
        const brand = rect(".nav-brand");
        const button = rect(".nav-cta");
        const label = document.querySelector(".nav-brand-name")!;
        const controls = [...document.querySelectorAll(".nav-brand, .desktop-nav, .nav-inner > [data-local-glass]")]
          .filter(element => getComputedStyle(element).display !== "none")
          .map(element => element.getBoundingClientRect());
        return {
          oneRow: Math.abs(brand.y + brand.height / 2 - button.y - button.height / 2) < 1,
          contained: controls.every(box => box.left >= row.left - 1 && box.right <= row.right + 1),
          separated: controls.every((box, index) => index === 0 || box.left >= controls[index - 1].right),
          nameContained: getComputedStyle(label).visibility === "hidden" ||
            (rect(".nav-brand-name").left >= brand.left && rect(".nav-brand-name").right <= brand.right + 1),
        };
      }), { message: `${route} at ${width}px` }).toEqual({ oneRow: true, contained: true, separated: true, nameContained: true });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".nav-brand-name")).toBeHidden();
    await page.screenshot({ path: `artifacts/header-audit/fixed-390${route === "/" ? "-home" : "-projects"}.png` });
    await page.setViewportSize({ width: 480, height: 900 });
    await expect(page.locator(".nav-brand-name")).toBeVisible();
    // A font-metric change must hide the name even without a viewport resize.
    await page.locator(".nav-brand-name").evaluate((element: HTMLElement) => { element.style.fontSize = "24px"; });
    await expect(page.locator(".nav-brand-name")).toBeHidden();
    await page.locator(".nav-brand-name").evaluate((element: HTMLElement) => { element.style.removeProperty("font-size"); });
    await expect(page.locator(".nav-brand-name")).toBeVisible();
  });
}
