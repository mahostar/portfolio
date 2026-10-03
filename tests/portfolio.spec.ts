import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

const widths = [
  280, 320, 360, 390, 430, 540, 600, 640, 767, 768, 800, 900, 1024, 1280, 1440, 1920,
  2560,
];
for (const width of widths) {
  test(`homepage layout and navigation at ${width}px`, async ({ page }) => {
    const height =
      width === 390 ? 844 : width === 768 ? 1024 : width >= 1920 ? 1080 : 900;
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Mohamed WassimMbarek.");
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".portrait img")
      .evaluate((image: HTMLImageElement) => image.decode());
    await expect(page.locator(".bottom-nav")).toBeVisible({ visible: width < 768 });
    await expect(page.locator(".desktop-nav")).toBeVisible({ visible: width >= 768 });
    await expect(page.getByRole("button", { name: /menu/i })).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const textGeometry = await page
      .locator(width < 768 ? ".hero-copy h1" : ".hero-tagline")
      .boundingBox();
    const statsGeometry = await page.locator(".hero-stats").boundingBox();
    expect(textGeometry!.y + textGeometry!.height).toBeLessThanOrEqual(statsGeometry!.y);
    const nameGeometry = await page
      .locator(".hero-copy h1")
      .evaluate((element) => ({
        width: element.clientWidth,
        scroll: element.scrollWidth,
      }));
    expect(nameGeometry.scroll).toBeLessThanOrEqual(nameGeometry.width + 1);
    await fs.mkdir("artifacts/screenshots", { recursive: true });
    await page.screenshot({
      path: `artifacts/screenshots/home-${width}.png`,
      fullPage: true,
    });
  });
}

test("mobile targets, stacked projects, and active navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const small = await page.locator("a, button").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          (rect.width < 44 || rect.height < 44)
        );
      })
      .map((element) => ({
        text: element.textContent?.trim(),
        rect: element.getBoundingClientRect().toJSON(),
      })),
  );
  expect(small).toEqual([]);
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page.locator(".bottom-nav .active")).toHaveText("Work");
  const cards = await page
    .locator(".featured-grid .project-card")
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    );
  for (let index = 1; index < cards.length; index++) {
    expect(cards[index].top).toBeGreaterThan(cards[index - 1].bottom);
    expect(cards[index].left).toBe(cards[0].left);
  }
  await expect(page.getByRole("link", { name: /Explore all \d+ projects/ })).toBeVisible();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(page.locator(".bottom-nav .active")).toHaveText("About");
  await page.locator("#skills").scrollIntoViewIfNeeded();
  await expect(page.locator(".bottom-nav .active")).toHaveText("Proof");
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(page.locator(".bottom-nav .active")).toHaveText("Contact");
});

test("twelve-letter names fit on a small phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".hero-copy").evaluate((element: HTMLElement) => {
    element.style.setProperty("--name-length", "12");
    element.querySelectorAll("h1 span").forEach((line) => {
      line.textContent = "WWWWWWWWWWWW";
    });
    element.style.width = "calc(100% - 41px)";
  });
  await expect
    .poll(() =>
      page
        .locator(".hero-copy h1")
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    )
    .toBe(true);
});

test("case-study routes and unfiltered project list", async ({ page }) => {
  await page.goto("/projects");
  const projectCount = Number(await page.locator(".catalog-total strong").innerText());
  expect(projectCount).toBeGreaterThan(0);
  await expect(page.locator(".project-list .project-card")).toHaveCount(projectCount);
  await expect(page.getByRole("navigation", { name: "Filter projects" })).toHaveCount(0);
  await expect(page.locator(".project-card .project-chips")).toHaveCount(0);
  const slugs = await page
    .locator(".project-card")
    .evaluateAll((cards) => cards.map((card) => card.getAttribute("href")!));
  expect(slugs.slice(-4)).toEqual([
    "/projects/algobrain",
    "/projects/cleenolve",
    "/projects/eazycode",
    "/projects/faza3d",
  ]);
  for (const slug of slugs) {
    const response = await page.goto(slug);
    expect(response!.status()).toBe(200);
    await expect(page.locator(".case-body h2")).toHaveCount(5);
    await expect(page.locator(".case-body h2").last()).toHaveText("What I would improve");
    await expect(page.locator(".desktop-nav .active")).toHaveText("Work");
    await expect(
      page.getByRole("link", { name: "All projects", exact: true }),
    ).toBeVisible();
  }
  const missing = await page.goto("/projects/missing-project");
  expect(missing!.status()).toBe(404);
});

test("contact validates fields and opens an encoded Gmail draft", async ({
  page,
}) => {
  await page.goto("/");
  let apiCalled = false;
  await page.route("**/api/contact", route => { apiCalled = true; return route.abort(); });
  // Intercept before Gmail receives any test data or requires sign-in.
  await page.route("https://mail.google.com/**", route => route.fulfill({ body: "Draft intercepted" }));
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#name")).toHaveAttribute("aria-describedby", "name-error");
  await expect(page.locator("#name")).toBeFocused();
  await expect(page.locator("#email-error")).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill("Preview & test");
  await page.getByLabel("Email", { exact: true }).fill("preview@example.com");
  await page
    .getByLabel("Message", { exact: true })
    .fill("A project idea with & symbols, + signs, and a new line.\nPlease reply with details.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.waitForURL("https://mail.google.com/**");
  const draft = new URL(page.url()).searchParams;
  expect(draft.get("to")).toBe("medwassimmbarek@gmail.com");
  expect(draft.get("su")).toBe("Portfolio enquiry from Preview & test");
  expect(draft.get("body")).toBe("A project idea with & symbols, + signs, and a new line.\nPlease reply with details.\n\nFrom: Preview & test\nReply email: preview@example.com");
  expect(apiCalled).toBe(false);
});

test("contact rejects malformed, fast, and oversized requests and silently absorbs spam", async ({
  request,
}) => {
  const payload = {
    name: "Preview test",
    email: "preview@example.com",
    message: "A test message with enough characters for validation.",
    website: "",
    loadedAt: Date.now() - 4000,
  };
  expect(
    (
      await request.post("/api/contact", { data: { ...payload, email: "invalid" } })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/contact", { data: { ...payload, loadedAt: Date.now() } })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/contact", {
        data: { ...payload, message: "x".repeat(17000) },
      })
    ).status(),
  ).toBe(413);
  const honeypot = await request.post("/api/contact", { data: { website: "spam" } });
  expect(honeypot.status()).toBe(200);
  expect(await honeypot.json()).toEqual({ ok: true });
});

test("contact keeps invalid drafts and offers another email app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#name-error")).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill("Preview test");
  await page.getByLabel("Email", { exact: true }).fill("invalid");
  await page
    .getByLabel("Message", { exact: true })
    .fill("This message must remain available after the server fails.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#email-error")).toBeVisible();
  await expect(page.getByRole("link", { name: "Use another email app" })).toHaveAttribute("href", "mailto:medwassimmbarek@gmail.com");
  await expect(page.locator("#message")).not.toHaveValue("");
});

for (const route of ["/", "/projects", "/projects/easyshield"]) {
  test(`accessibility at ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact || ""),
      ),
    ).toEqual([]);
  });
}

test("reduced motion, keyboard focus, and local assets", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const external: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith(new URL(process.env.PREVIEW_URL || "http://localhost:3000").origin) &&
      !request.url().startsWith("data:")
    )
      external.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator(".portrait img")).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  const outline = await page
    .getByRole("link", { name: "Skip to content" })
    .evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe("none");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  expect(external).toEqual([]);
});
