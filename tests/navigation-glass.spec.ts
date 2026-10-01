import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`glass shader and page progress at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".nav-glass-shader")).toHaveAttribute("data-shader", "ready");
    expect(await page.locator(".nav-glass-shader").evaluate((canvas: HTMLCanvasElement) => canvas.getContext("webgl")!.getError())).toBe(0);
    const progress = page.getByRole("progressbar", { name: "Page scroll progress" });
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    for (const fraction of [0.25, 0.5, 1]) {
      await page.evaluate((value) => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * value, behavior: "instant" }), fraction);
      await expect(progress).toHaveAttribute("aria-valuenow", String(fraction * 100));
      const track = await progress.boundingBox();
      const fill = await progress.locator("span").boundingBox();
      expect(fill!.width / track!.width).toBeCloseTo(fraction, 2);
      expect(track!.y).toBeGreaterThan(0);
      expect(track!.y).toBeLessThan(120);
    }
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: "instant" }));
    await page.screenshot({ path: `artifacts/screenshots/glass-navigation-${width}.png` });
    await page.goto("/projects/easyshield");
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(errors).toEqual([]);
  });
}

test("scroll progress still works when WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".nav-glass-shader")).toHaveAttribute("data-shader", "fallback");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await expect(page.locator(".nav-brand")).toBeVisible();
});

for (const width of [390, 1440]) {
  test(`blue origin and ordered active navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const header = page.locator(".site-header");
    const active = page.locator(width < 768 ? ".bottom-nav .active" : ".desktop-nav .active");
    await expect(header).toHaveAttribute("data-scroll-state", "top");
    await expect(header).toHaveCSS("background-color", "rgb(1, 57, 180)");
    await expect(active).toHaveText("Home");
    await header.screenshot({ path: `artifacts/screenshots/blue-header-top-${width}.png` });
    const sections = await page.locator("main > section[id]").evaluateAll((elements) => elements.map((element) => element.id));
    const expected: Record<string, string> = { home: "Home", work: "Work", about: "About", journey: "About", impact: "Impact", skills: "Impact", interests: "Impact", certificates: "Impact", contact: "Contact" };
    for (const id of [...sections, ...sections.toReversed()]) {
      await page.locator(`#${id}`).evaluate((element) => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 120, behavior: "instant" }));
      await expect(active, `Active tab while viewing ${id}`).toHaveText(expected[id]);
      if (id !== "home") {
        await expect(header).toHaveAttribute("data-scroll-state", "scrolled");
        await expect(header).toHaveCSS("background-color", "rgba(11, 25, 68, 0.76)");
      }
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-scroll-state", "top");
    await expect(header).toHaveCSS("background-color", "rgb(1, 57, 180)");
  });
}
