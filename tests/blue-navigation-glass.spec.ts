import { expect, test, type Page } from "@playwright/test";

const header = (page: Page) => page.locator(".site-header");
const glass = (page: Page) => page.locator("canvas[data-blue-glass]");
const gold = (page: Page) => page.locator(".nav-cta");

const goldStyle = (page: Page) => gold(page).evaluate((element) => {
  const style = getComputedStyle(element);
  return Object.fromEntries([
    "width", "height", "padding", "font", "color", "borderRadius",
    "background", "border", "boxShadow", "gap",
  ].map((property) => [property, style.getPropertyValue(property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`))]));
});

for (const width of [390, 1440, 2268]) {
  test(`shared blue glass persists across routes and leaves gold unchanged at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects");
    await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
    await page.waitForSelector('[data-local-glass="golden-link"][data-gold-shader="ready"]');
    const originalGold = await goldStyle(page);
    const originalHeader = await header(page).evaluate((element) => ({
      background: getComputedStyle(element).background,
      blur: getComputedStyle(element).backdropFilter,
      height: element.getBoundingClientRect().height,
    }));
    await page.goto("/dsfsdf");
    await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
    await page.waitForSelector('[data-local-glass="golden-link"][data-gold-shader="ready"]');
    expect(await goldStyle(page)).toEqual(originalGold);
    expect(await header(page).evaluate((element) => getComputedStyle(element).backdropFilter)).toBe("blur(3px) saturate(1.2)");
    expect(await header(page).evaluate((element) => element.getBoundingClientRect().height)).toBe(originalHeader.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    // Client navigation must retain exactly one working shared material.
    await page.getByRole("link", { name: "Explore projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(glass(page)).toHaveCount(1);
    await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
    expect(await header(page).evaluate((element) => ({
      background: getComputedStyle(element).background,
      blur: getComputedStyle(element).backdropFilter,
      height: element.getBoundingClientRect().height,
    }))).toEqual(originalHeader);
    await page.goBack();
    await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
    await header(page).getByRole("link", { name: /— Go to home$/ }).click();
    await expect(page).toHaveURL(/\/#home$/);
    await expect(glass(page)).toHaveCount(1);
    await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
    await expect(page.locator("html")).not.toHaveAttribute("data-welcome", /.+/);
    expect(errors).toEqual([]);
  });
}

test("unknown project slugs get the same shared glass", async ({ page }) => {
  await page.goto("/projects/does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("a different route");
  await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
});

test("every published project page uses the shared blue glass", async ({ page }) => {
  await page.goto("/projects");
  const routes = await page.locator('main a[href^="/projects/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute("href")!))],
  );
  expect(routes).toHaveLength(12);
  for (const route of routes) {
    await page.goto(route);
    await expect(glass(page)).toHaveCount(1);
    await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
    expect(await header(page).evaluate((element) => getComputedStyle(element).backdropFilter)).toBe("blur(3px) saturate(1.2)");
  }
});

test("context loss falls back and restoration rebuilds the shader", async ({ page }) => {
  await page.goto("/dsfsdf");
  await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
  await glass(page).evaluate((element) => {
    const extension = (element as HTMLCanvasElement).getContext("webgl")?.getExtension("WEBGL_lose_context");
    // getExtension returns null while the context is lost; retain the handle.
    Object.assign(element, { restoreForTest: () => extension?.restoreContext() });
    extension?.loseContext();
  });
  await expect(glass(page)).toHaveAttribute("data-blue-glass", "fallback");
  expect(await header(page).evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("linear-gradient");
  await glass(page).evaluate((element) => {
    (element as HTMLCanvasElement & { restoreForTest: () => void }).restoreForTest();
  });
  await expect(glass(page)).toHaveAttribute("data-blue-glass", "ready");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => glass(page).evaluate((element) => (element as HTMLCanvasElement).width)).toBe(390);
});

test("WebGL unavailable still has a usable blue bar and golden link", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/dsfsdf");
  await expect(glass(page)).toHaveAttribute("data-blue-glass", "fallback");
  expect(await header(page).evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("linear-gradient");
  await expect(gold(page)).toBeVisible();
  await gold(page).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(glass(page)).toHaveCount(1);
  await expect(glass(page)).toHaveAttribute("data-blue-glass", "fallback");
});
