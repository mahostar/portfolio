import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const [width, height] of [
  [320, 568],
  [360, 740],
  [390, 844],
  [430, 932],
]) {
  test(`hero content and artwork coordinates fit ${width}×${height}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
      baseURL: process.env.AUDIT_URL || "http://localhost:3001",
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".portrait img")
      .evaluate((image: HTMLImageElement) => image.decode());
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) =>
        document.querySelector(selector)!.getBoundingClientRect();
      const navigation = rect(".bottom-nav"),
        heading = rect("#hero-name"),
        portrait = rect(".portrait"),
        stats = rect(".hero-stats"),
        cta = rect(".hero-project-link");
      return {
        heading: heading.bottom,
        portrait: portrait.bottom,
        stats: stats.bottom,
        cta: cta.bottom,
        navigation: navigation.top,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(geometry.overflow).toBe(false);
    for (const value of [
      geometry.heading,
      geometry.portrait,
      geometry.stats,
      geometry.cta,
    ])
      expect(value).toBeLessThanOrEqual(geometry.navigation);
    // Reduced motion hides the SVG; expose it only for the projection check.
    await page.locator(".pulses-mobile").evaluate((node) => {
      (node as SVGElement).style.display = "block";
    });
    const errors = await page.locator(".sticker").evaluateAll((stickers) =>
      stickers.map((sticker) => {
        const anchor = (sticker as HTMLElement).dataset.anchor;
        const path = document.querySelector<SVGPathElement>(
          `.pulses-mobile [data-route="${anchor}"] .pulse`,
        )!;
        const point = path
          .getPointAtLength(path.getTotalLength())
          .matrixTransform(path.getScreenCTM()!);
        const dot = sticker.querySelector(".anchor-dot")!.getBoundingClientRect();
        return Math.hypot(
          point.x - (dot.left + dot.width / 2),
          point.y - (dot.top + dot.height / 2),
        );
      }),
    );
    expect(errors.every((error) => error < 1)).toBe(true);
    const crops = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => decodeURIComponent(entry.name))
        .filter((name) => /hero-bg[^/]*\.webp/.test(name)),
    );
    expect(crops.some((name) => name.includes("hero-bg-mobile.webp"))).toBe(true);
    expect(crops.some((name) => name.includes("hero-bg.webp"))).toBe(false);
    expect(await page.locator('img[fetchpriority="high"]').count()).toBe(1);
    await page.getByRole("button", { name: "IoT", exact: true }).tap();
    await expect(page.locator("#proof-io")).toContainText("ESP32 in Plantini");
    await expect(page.locator("#proof-io a")).toHaveAttribute(
      "href",
      "/projects/plantini",
    );
    await context.close();
  });
}

test("intro runs once, pulses restart, and global pause freezes motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-scene")).toHaveAttribute("data-intro", "run");
  await expect(page.locator(".portrait img")).toHaveCSS("opacity", "1");
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem("signal-path-intro")))
    .toBe("seen");
  await page.getByRole("button", { name: "AI", exact: true }).focus();
  await expect(page.locator("#proof-ai")).toBeVisible();
  await expect(page.locator('.pulses-desktop [data-route="ai"]')).toHaveAttribute(
    "data-run",
    "true",
  );
  await page.getByRole("button", { name: "Pause site motion" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  const running = await page.evaluate(
    () =>
      document.getAnimations().filter((animation) => animation.playState === "running")
        .length,
  );
  expect(running).toBe(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator(".hero-scene")).not.toHaveAttribute("data-intro", "run");
  await page.getByRole("button", { name: "Resume site motion" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "running");
});

test("keyboard, reduced motion, forced colors, and unavailable storage remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage disabled");
      },
    });
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Storage disabled");
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("button", { name: "PCB", exact: true }).focus();
  await expect(page.locator("#proof-pcb")).toContainText("PCB design in AlgoBrain BCI");
  await expect(page.locator(".hero-pulses").first()).toBeHidden();
  expect(errors).toEqual([]);
});

test("homepage has no accessibility violations and production hides the playground", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
  const response = await page.goto("/test-dev");
  expect(response?.status()).toBe(404);
});

test("tablet and desktop anchors remain inside the displayed artwork", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
    [1920, 1080],
    [2560, 1440],
    [3440, 1440],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "networkidle" });
    const visible = await page.locator(".anchor-dot").evaluateAll((dots) => {
      const artwork = document.querySelector(".hero-art-frame")!.getBoundingClientRect();
      return dots.map((dot) => {
        const point = dot.getBoundingClientRect();
        return (
          point.x + point.width / 2 >= artwork.left &&
          point.x + point.width / 2 <= artwork.right &&
          point.y + point.height / 2 >= artwork.top &&
          point.y + point.height / 2 <= artwork.bottom
        );
      });
    });
    expect(visible, `anchors at ${width}×${height}`).toEqual([true, true, true, true]);
  }
});
