import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

for (const width of [320, 390, 1440, 2560]) {
  test(`Research Journal continuous reader works at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/#research");
    const skip = page.getByRole("button", { name: /skip/i });
    if (await skip.isVisible()) await skip.click();
    await expect(page.locator("[data-welcome-screen]")).toBeHidden();
    const section = page.locator("#research");
    await section.scrollIntoViewIfNeeded();
    await expect(
      section.getByRole("heading", { name: "Research Journal" }),
    ).toBeVisible();
    await expect(section.locator("a")).toHaveCount(2);
    for (const card of await section.locator("a").all()) {
      const title = await card.locator("h3").boundingBox();
      const description = await card.locator("p").boundingBox();
      expect(description!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
    }
    await section.getByRole("link", { name: /EasyShield/ }).click();
    const stage = page.getByRole("region", { name: "PDF pages", exact: true });
    const first = page.locator('[data-pdf-page="1"]');
    const back = page.getByRole("link", {
      name: "EasyShield v2.5: Real-Time Face Anti-Spoofing",
      exact: true,
    });
    const backBar = back.locator("../..");
    await expect(first).toHaveAttribute("aria-busy", "false");
    await expect(stage.locator("[data-pdf-page]")).toHaveCount(18);
    await expect(page.locator("h1")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Previous page|Next page/ }),
    ).toHaveCount(0);
    await expect(page.getByLabel("Zoom level")).toHaveValue("100");
    await expect(back).toHaveCSS("font-size", "12px");
    expect((await backBar.boundingBox())!.height).toBeLessThanOrEqual(
      width === 2560 ? 38 : 32,
    );
    const second = page.locator('[data-pdf-page="2"]');
    expect(await second.evaluate((e) => (e as HTMLElement).offsetTop)).toBeGreaterThan(
      await first.evaluate((e) => (e as HTMLElement).offsetTop + e.clientHeight),
    );
    expect(await stage.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    const initialWidth = await first.evaluate((e) => e.getBoundingClientRect().width);
    await page.screenshot({ path: `artifacts/research/continuous-${width}.png` });
    await stage.evaluate((e) => {
      e.scrollTop = 240;
    });
    await expect(backBar).toHaveAttribute("data-hidden", "true");
    await expect.poll(async () => (await backBar.boundingBox())!.height).toBeLessThan(1);
    await stage.evaluate((e) => {
      e.scrollTop = 150;
    });
    await expect(backBar).toHaveAttribute("data-hidden", "false");
    await page.getByLabel("Page number").fill("2");
    await page.getByLabel("Page number").press("Enter");
    await expect(page.getByLabel("Page number")).toHaveValue("2");
    await expect(second).toHaveAttribute("aria-busy", "false");
    await expect(second.locator(".textLayer")).toContainText("Related Work");
    const alignment = await stage.evaluate((e) => {
      const target = e.querySelector('[data-pdf-page="2"]')!;
      return target.getBoundingClientRect().top - e.getBoundingClientRect().top;
    });
    expect(Math.abs(alignment)).toBeLessThan(20);
    await page.getByLabel("Page number").fill("2.5");
    await page.getByLabel("Page number").press("Enter");
    await expect(page.getByLabel("Page number")).toHaveValue("2");
    await page.getByLabel("Page number").fill("99");
    await page.getByLabel("Page number").press("Enter");
    await expect(page.getByLabel("Page number")).toHaveValue("18");
    await expect(page.locator('[data-pdf-page="18"]')).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await stage.evaluate((e) => {
      e.scrollTop = 0;
    });
    await expect(page.getByLabel("Page number")).toHaveValue("1");
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect(page.getByLabel("Zoom level")).toHaveValue("125");
    expect(await first.evaluate((e) => e.getBoundingClientRect().width)).toBeCloseTo(
      initialWidth * 1.25,
      0,
    );
    await page.getByRole("button", { name: "Zoom out", exact: true }).click();
    await expect(page.getByLabel("Zoom level")).toHaveValue("100");
    await page.getByLabel("Zoom level").selectOption("75");
    expect(await first.evaluate((e) => e.getBoundingClientRect().width)).toBeCloseTo(
      initialWidth * 0.75,
      0,
    );
    await page.getByLabel("Zoom level").selectOption("100");
    expect(await stage.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    await page.getByLabel("Zoom level").selectOption("200");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
    await page.getByLabel("Zoom level").selectOption("100");
    await expect(page.locator(".site-header")).toBeInViewport();
    if (width < 768)
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeInViewport();
    const bounds = await stage.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(901);
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download PDF", exact: true }).click();
    expect((await downloadEvent).suggestedFilename()).toBe("easyshield-v2-5.pdf");
    await stage.evaluate((e) => {
      e.scrollTop = 0;
    });
    await expect(backBar).toHaveAttribute("data-hidden", "false");
    await back.click();
    await expect(section).toBeInViewport();
    await section.getByRole("link", { name: /Where Does/ }).click();
    await expect(page.locator('[data-pdf-page="1"]')).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(page.locator('[data-pdf-page="1"] .textLayer')).toContainText(
      "Conversational language models",
    );
    await expect(stage.locator("[data-pdf-page]")).toHaveCount(19);
    await page.getByLabel("Page number").fill("19");
    await page.getByLabel("Page number").press("Enter");
    await expect(page.locator('[data-pdf-page="19"]')).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect(page.getByLabel("Page number")).toHaveValue("19");
    expect(errors).toEqual([]);
  });
}

test("Missing research PDFs offer a download fallback", async ({ page }) => {
  await page.route("**/research/easyshield-v2-5.pdf", (route) =>
    route.fulfill({ status: 404, body: "Missing" }),
  );
  await page.goto("/research/easyshield");
  const alert = page
    .getByRole("region", { name: "PDF pages", exact: true })
    .getByRole("alert");
  await expect(alert).toContainText("could not be loaded");
  await expect(alert.getByRole("link", { name: "Download PDF" })).toBeVisible();
});

test("Dark reader hides its paper bar on downward scrolling and refits on resize", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(() => localStorage.setItem("portfolio-theme", "dark"));
  await page.goto("/research/ai-overwhelm");
  const stage = page.getByRole("region", { name: "PDF pages" });
  const first = page.locator('[data-pdf-page="1"]');
  const back = page.getByRole("link", {
    name: "Where Does “I Am Overwhelmed” Come From in AI?",
    exact: true,
  });
  const bar = back.locator("../..");
  await expect(first).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(first).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await stage.hover();
  await page.mouse.wheel(0, 400);
  await expect(bar).toHaveAttribute("data-hidden", "true");
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeLessThan(1);
  await page.screenshot({ path: "artifacts/research/continuous-dark-scrolled.png" });
  await page.mouse.wheel(0, -100);
  await expect(bar).toHaveAttribute("data-hidden", "false");
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeGreaterThan(28);
  await page.setViewportSize({ width: 844, height: 500 });
  await expect
    .poll(() =>
      stage.evaluate((e) => {
        const sheet = e.querySelector('[data-pdf-page="1"]') as HTMLElement;
        return Math.abs(sheet.offsetWidth - (e.clientWidth - 24));
      }),
    )
    .toBeLessThanOrEqual(1);
  await expect(page.getByLabel("Zoom level")).toHaveValue("100");
  await stage.evaluate((e) => {
    e.scrollTop = 0;
  });
  await expect(first).toHaveAttribute("aria-busy", "false");
  await page.screenshot({ path: "artifacts/research/continuous-dark-landscape.png" });
});

test("Real research cards expose the supplied dates and distinct loaded logos", async ({
  page,
}) => {
  await page.setViewportSize({ width: 487, height: 900 });
  await page.goto("/#research");
  await page.getByRole("button", { name: /skip intro/i }).click();
  await expect(page.locator("[data-welcome-screen]")).toBeHidden();
  const section = page.locator("#research");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator("time")).toHaveText(["November 2025", "October 2026"]);
  await expect(section.locator("a").first()).toHaveAttribute(
    "href",
    "/research/easyshield",
  );
  await expect(section.locator("a").last()).toHaveAttribute(
    "href",
    "/research/ai-overwhelm",
  );
  await expect
    .poll(() =>
      section
        .locator("img")
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toBe(true);
  const sources = await section
    .locator("img")
    .evaluateAll((images) => images.map((image) => image.getAttribute("src")));
  expect(new Set(sources).size).toBe(2);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
});
