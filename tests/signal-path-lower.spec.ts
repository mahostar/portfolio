import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import baseline from "./fixtures/hero-baseline.json" with { type: "json" };

const matrix = [
  [320, 568],
  [360, 740],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
  [3440, 1440],
];
for (const [width, height] of matrix) {
  test(`Signal Path layout and hero isolation at ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".portrait img")
      .evaluate((image: HTMLImageElement) => image.decode());
    await page.waitForTimeout(900);
    if (width === 390 || width === 1440 || width === 3440) {
      const geometry = await page.locator("#home").evaluate((hero) => {
        const rect = (element: Element) => {
          const b = element.getBoundingClientRect();
          return { x: b.x, y: b.y, width: b.width, height: b.height };
        };
        return {
          box: rect(hero),
          text: (hero as HTMLElement).innerText,
          parts: [
            ...hero.querySelectorAll(
              ".portrait, .hero-copy, .hero-stats, .hero-background, .hero-tag",
            ),
          ].map((element) => ({ class: element.className, box: rect(element) })),
          background: getComputedStyle(hero.querySelector(".hero-background img")!)
            .objectFit,
        };
      });
      expect(geometry).toEqual(baseline[String(width) as keyof typeof baseline]);
      await page
        .locator("#home")
        .screenshot({ path: `artifacts/signal-path/final/hero-${width}.png` });
    }
    for (const id of [
      "work",
      "about",
      "journey",
      "interests",
      "impact",
      "skills",
      "certificates",
      "contact",
    ]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
      ).toBe(true);
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    const interests = await page.locator(".interest-card").evaluateAll((cards) =>
      cards.map((card) => ({
        height: card.getBoundingClientRect().height,
        clipped: [...card.querySelectorAll("h3,p")].some(
          (element) => element.scrollWidth > element.clientWidth + 1,
        ),
      })),
    );
    expect(interests.every((card) => card.height < 500 && !card.clipped)).toBe(true);
    await expect(page.locator(".archive-card")).toHaveCount(4);
    await expect(page.locator(".featured-grid .project-card")).toHaveCount(4);
    if (width === 390 || width === 1440) {
      for (const id of [
        "work",
        "about",
        "journey",
        "interests",
        "impact",
        "skills",
        "certificates",
        "contact",
      ]) {
        await page.locator(`#${id}`).screenshot({
          path: `artifacts/signal-path/final/${id}-${width}.png`,
          style:
            ".site-header,.bottom-nav,.skip-link,nextjs-portal{visibility:hidden!important}",
        });
      }
      await page.screenshot({
        path: `artifacts/signal-path/final/page-${width}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}

test("node toolkit selection, keyboard access and measured connectors", async ({
  page,
}) => {
  await page.goto("/");
  const tree = page.locator("[data-skill-tree]");
  await tree.scrollIntoViewIfNeeded();
  await expect(tree.locator("[data-group]")).toHaveCount(5);
  await expect(tree.locator("[data-tool]")).toHaveCount(16);
  const hardware = tree.getByRole("button", { name: /Hardware and PCB/ });
  await hardware.click();
  await expect(hardware).toHaveAttribute("aria-pressed", "true");
  await hardware.press("Tab");
  const pcb = tree.locator('[data-tool="pcb"]');
  await expect(pcb).toBeFocused();
  await pcb.press("Space");
  await expect(pcb).toHaveAttribute("aria-pressed", "true");
  await tree.getByRole("button", { name: "Show the whole toolkit" }).click();
  await expect(pcb).toHaveAttribute("aria-pressed", "false");
  for (const width of [390, 830, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => tree.locator("[data-wire-tool]").count()).toBe(16);
    await expect
      .poll(() =>
        tree.locator("[data-wire-tool]").evaluateAll((groups) =>
          groups.every((group) => {
            const tool = document.querySelector<HTMLElement>(
              '[data-tool="' + group.getAttribute("data-wire-tool") + '"]',
            )!;
            const path = group.querySelector("path")!;
            const end = path
              .getPointAtLength(path.getTotalLength())
              .matrixTransform(path.getScreenCTM()!);
            const box = tool.getBoundingClientRect();
            return (
              Math.abs(end.x - box.left) < 1 &&
              Math.abs(end.y - box.top - box.height / 2) < 1
            );
          }),
        ),
      )
      .toBe(true);
    const widths = await tree
      .locator("[data-tool]")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
    expect(widths.every((width) => width <= 149)).toBe(true);
  }
});

test("tree motion control leaves hero animation configuration alone", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("[data-skill-tree]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const before = await page
    .locator("#home")
    .evaluate((hero) =>
      [...hero.querySelectorAll("*")].map(
        (element) => getComputedStyle(element).animationPlayState,
      ),
    );
  await page.getByRole("button", { name: "Pause signal animation" }).click();
  await expect(page.locator("[data-skill-tree]")).toHaveAttribute("data-paused", "true");
  const after = await page
    .locator("#home")
    .evaluate((hero) =>
      [...hero.querySelectorAll("*")].map(
        (element) => getComputedStyle(element).animationPlayState,
      ),
    );
  expect(after).toEqual(before);
  await page.getByRole("button", { name: "Resume signal animation" }).click();
  await expect(page.locator("[data-skill-tree]")).toHaveAttribute("data-paused", "false");
});

test("marked sections are concise, aligned and image-led", async ({ page }) => {
  await page.setViewportSize({ width: 830, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByText("SIGNAL PATH / PORTFOLIO", { exact: true })).toHaveCount(0);
  await expect(page.getByText("01 / SELECTED WORK", { exact: true })).toHaveCount(0);
  await expect(page.locator("#featured-heading")).toHaveText("My projects");
  await expect(page.locator("#archive-heading")).toHaveText(
    "My achievements & milestones",
  );
  await expect(page.locator("#work .section-header p")).toHaveCount(0);
  await expect(page.locator(".archive-heading > p")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore all 8 projects" })).toHaveCSS(
    "background-color",
    "rgb(255, 212, 0)",
  );
  await expect(page.locator("#about dt svg")).toHaveCount(2);
  const alignment = await page
    .locator(".journey-list li:not(:last-child)")
    .evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        const number = item.querySelector(".journey-index")!.getBoundingClientRect();
        const line = getComputedStyle(item, "::before");
        return Math.abs(
          box.left +
            parseFloat(line.left) +
            parseFloat(line.width) / 2 -
            number.left -
            number.width / 2,
        );
      }),
    );
  expect(alignment.every((error) => error < 0.6)).toBe(true);
  const card = page.locator(".archive-card").first();
  const media = await card.locator(".archive-visual").boundingBox();
  const box = await card.boundingBox();
  expect(media!.width).toBeCloseTo(box!.width - 2, 0);
  expect(media!.height).toBeGreaterThan(250);
  await card.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(card.locator("details")).toHaveAttribute("open", "");
  await expect(card.locator("details p").first()).toBeVisible();
});

test("certificate dialog closes and restores focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Enlarge IELTS Academic" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("Overall band 6.0");
  await expect(
    page.getByRole("button", { name: "Close certificate viewer" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close certificate viewer" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("contact validates input and keeps a real email fallback on failure", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#name")).toBeFocused();
  await expect(page.locator("#name-error")).toBeVisible();
  await page.locator("#name").fill("Preview Check");
  await page.locator("#email").fill("preview@example.com");
  await page.locator("#message").fill("A local preview test of form error handling.");
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Email unavailable"}',
    }),
  );
  await page.waitForTimeout(3100);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("link", { name: "Send an email instead" })).toHaveAttribute(
    "href",
    "mailto:medwassimmbarek@gmail.com",
  );
  await expect(page.locator("#message")).not.toHaveValue("");
});

test("navigation groups cover the toolkit and all case study routes load", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#skills").scrollIntoViewIfNeeded();
  await expect(page.locator(".desktop-nav .active")).toHaveText("Proof");
  await page.goto("/projects");
  await expect(page.locator(".project-list .project-card")).toHaveCount(8);
  await expect(page.locator(".desktop-nav .active")).toHaveText("Work");
  expect(
    await page
      .locator(".desktop-nav")
      .evaluate((nav) => getComputedStyle(nav, "::before").content),
  ).toBe("none");
  const destinations = await page
    .locator(".project-list .project-card")
    .evaluateAll((cards) => cards.map((card) => card.getAttribute("href")!));
  for (const destination of destinations) {
    const response = await page.goto(destination);
    expect(response?.status()).toBe(200);
    await expect(page.locator(".case-body h2")).toHaveCount(5);
    const image = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");
    expect(image).not.toMatch(/\.svg$/);
  }
});

for (const width of [390, 1440])
  test(`accessible redesigned content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .include("[data-signal-site]")
      .include(".site-footer")
      .analyze();
    expect(result.violations).toEqual([]);
  });
