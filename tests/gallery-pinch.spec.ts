import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 850 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
test("two fingers zoom and pan the image; navigation and reopening reset it", async ({ page, context }) => {
  await page.goto("/projects/windweave");
  await page.getByRole("button", { name: /cover in gallery$/ }).click();
  const surface = page.locator("dialog[open] [data-image-zoom]");
  const bounds = (await surface.boundingBox())!;
  const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
  const cdp = await context.newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", points: { x: number; y: number; id: number }[]) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
  await touch("touchStart", [{ x: x - 40, y, id: 1 }, { x: x + 40, y, id: 2 }]);
  await touch("touchMove", [{ x: x - 80, y, id: 1 }, { x: x + 80, y, id: 2 }]);
  await touch("touchEnd", []);
  await expect.poll(() => surface.getAttribute("data-image-zoom")).toBe("2.00");
  const before = await surface.locator("img").getAttribute("style");
  await touch("touchStart", [{ x, y, id: 1 }]);
  await touch("touchMove", [{ x: x + 35, y: y + 30, id: 1 }]);
  await touch("touchEnd", []);
  await expect.poll(() => surface.locator("img").getAttribute("style")).not.toBe(before);
  await page.getByRole("button", { name: "Reset image zoom" }).click();
  await expect(surface).toHaveAttribute("data-image-zoom", "1.00");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Next media" }).click();
  await expect(surface).toHaveAttribute("data-image-zoom", "1.00");
  await page.locator("dialog[open]").press("Escape");
  await page.getByRole("button", { name: /cover in gallery$/ }).click();
  await expect(surface).toHaveAttribute("data-image-zoom", "1.00");
});

test("mouse wheel zooms around the cursor without scrolling the page", async ({ page }) => {
  await page.goto("/projects/windweave");
  await page.getByRole("button", { name: /cover in gallery$/ }).click();
  const surface = page.locator("dialog[open] [data-image-zoom]");
  const bounds = (await surface.boundingBox())!;
  const scroll = await page.evaluate(() => scrollY);
  await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.5);
  await page.mouse.wheel(0, -350);
  await expect.poll(async () => Number(await surface.getAttribute("data-image-zoom"))).toBeGreaterThan(1.5);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await surface.dblclick();
  await expect(surface).toHaveAttribute("data-image-zoom", "1.00");
  await page.mouse.wheel(0, -350);
  await expect.poll(async () => Number(await surface.getAttribute("data-image-zoom"))).toBeGreaterThan(1.5);
  await page.mouse.wheel(0, 5000);
  await expect(surface).toHaveAttribute("data-image-zoom", "1.00");
});
