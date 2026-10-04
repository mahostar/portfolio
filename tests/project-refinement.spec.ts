import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });
for (const width of [390, 1440]) {
  for (const [slug, title, total] of [
    ["plantini", "Plantini", 24],
    ["aquaflow", "AquaFlow", 7],
    ["fabric-inspection", "FabricLens", 7],
    ["tpms-generator", "TPMS Studio", 3],
    ["algobrain", "AlgoBrain BCI", 4],
  ] as const) {
    test(`${slug} shows original project media at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.goto(`/projects/${slug}`);
      const heading = page.getByRole("heading", { name: `Building and testing ${title}`, exact: true });
      await expect(heading).toBeVisible();
      const album = heading.locator("../..");
      const tiles = album.locator('button[aria-label^="Open "]');
      await expect(tiles).toHaveCount(Math.min(6, total));
      if (total > 6) {
        await album.getByRole("button", { name: "View more", exact: true }).click();
        await expect(tiles).toHaveCount(total);
      }
      for (const image of await album.locator('button[aria-label^="Open "] img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img: HTMLImageElement) => img.decode());
      }
      await tiles.first().click();
      const image = page.locator("dialog[open] img");
      await expect(image).toHaveAttribute("src", /\/images\/evidence\//);
      await image.evaluate((img: HTMLImageElement) => img.decode());
      await page.getByRole("button", { name: "Zoom in", exact: true }).click();
      await expect(page.locator("dialog[open] [data-image-zoom]")).not.toHaveAttribute("data-image-zoom", "1.00");
      await page.locator("dialog[open]").press("Escape");
      await heading.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await page.screenshot({ path: `artifacts/${slug}-visible-album-${width}.png` });
    });
  }
  test(`homepage selection and development album at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/");
    await expect(page.locator("#work [data-project]")).toHaveCount(7);
    expect(await page.locator("#work [data-project]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-project"))))
      .toEqual(["plantini", "aquaflow", "easyshield", "windweave", "smarthart", "algobrain", "tpms-generator"]);
    await page.goto("/projects/easyshield");
    await expect(page.getByRole("heading", { name: "Building and testing EasyShield" })).toBeVisible();
    const more = page.getByRole("button", { name: "View more", exact: true });
    await more.click();
    await expect(page.getByRole("button", { name: "Show fewer", exact: true }).first()).toHaveAttribute("aria-expanded", "true");
    const training = page.getByRole("button", { name: "Open Training terminal output", exact: true }).first();
    await training.click();
    await expect(page.locator("dialog[open] img")).toHaveAttribute("src", /training-terminal-output/);
    await page.locator("dialog[open]").press("Escape");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ path: `artifacts/easyshield-album-${width}.png` });
  });
  for (const slug of ["remote-pc-power", "niotoshield"]) {
    test(`${slug} explanatory figures at ${width}px`, async ({ page, context }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.goto(`/projects/${slug}`);
      const figures = page.getByRole("button", { name: /^Open figure:/ });
      await expect(figures).toHaveCount(2);
      for (const figure of await figures.all()) {
        await figure.click();
        await expect(page.locator("dialog[open] img")).toBeVisible();
        await expect.poll(() => page.locator("dialog[open] img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        await page.locator("dialog[open]").press("Escape");
      }
      expect(context.pages()).toHaveLength(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await page.screenshot({ path: `artifacts/${slug}-figures-${width}.png` });
    });
  }
}
