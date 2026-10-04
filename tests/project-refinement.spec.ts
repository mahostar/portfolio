import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });
for (const width of [390, 1440]) {
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
