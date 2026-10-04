import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });

for (const width of [390, 1440]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`device ${scheme} default and saved override at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.emulateMedia({ colorScheme: scheme });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/projects");
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      expect(
        await page.evaluate(() => localStorage.getItem("portfolio-theme")),
      ).toBeNull();
      const opposite = scheme === "dark" ? "light" : "dark";
      await page.getByRole("button", { name: "Change color theme" }).click();
      await page
        .getByRole("button", {
          name: opposite === "dark" ? "Dark" : "Light",
          exact: true,
        })
        .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      expect(await page.evaluate(() => localStorage.getItem("portfolio-theme"))).toBe(
        opposite,
      );
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await page.emulateMedia({ colorScheme: opposite });
      await page.emulateMedia({ colorScheme: scheme });
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await page.goto("/projects/easyshield");
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await page.getByRole("button", { name: "Change color theme" }).click();
      await page.getByRole("button", { name: "Device setting", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await page.emulateMedia({ colorScheme: opposite });
      await expect(page.locator("html")).toHaveAttribute("data-theme", opposite);
      await page.getByRole("button", { name: /cover in gallery$/ }).click();
      await expect(page.locator("dialog[open] img")).toBeVisible();
      await page
        .locator("dialog[open] img")
        .evaluate((img: HTMLImageElement) => img.decode());
      await page.screenshot({ path: `artifacts/theme-gallery-${opposite}-${width}.png` });
      await page.locator("dialog[open]").press("Escape");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      ).toBe(false);
      expect(errors).toEqual([]);
    });
  }
  test(`dark homepage contrast and preserved skill badges at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const skip = page.getByRole("button", { name: /Skip intro/ });
    await skip.waitFor({ state: "visible" });
    await skip.click();
    await expect(page.locator("[data-welcome-screen]")).toBeHidden();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator(".project-summary").first()).toHaveCSS(
      "color",
      "rgb(225, 233, 247)",
    );
    await expect(page.locator(".certificate-copy .eyebrow").first()).toHaveCSS(
      "color",
      "rgb(197, 216, 245)",
    );
    await expect(page.locator(".contact-copy > p")).toHaveCSS(
      "color",
      "rgb(225, 233, 247)",
    );
    await expect(page.locator("#about p").first()).toHaveCSS(
      "color",
      "rgb(212, 223, 239)",
    );
    await expect(page.locator(".journey-meta").first()).toHaveCSS(
      "color",
      "rgb(212, 223, 239)",
    );
    await expect(
      page.locator("[data-skill-tree] .tech-logo.with-name").first(),
    ).toHaveCSS("color", "rgb(11, 25, 68)");
    await expect(
      page.locator("[data-skill-tree] .tech-logo.with-name").first(),
    ).toHaveCSS("background-color", "rgb(244, 246, 255)");
    for (const id of ["home", "work", "about", "skills", "certificates", "contact"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `artifacts/theme-home-${id}-dark-${width}.png` });
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    ).toBe(false);
  });
}

test("navbar accounts for theme button through resizing", async ({ page }) => {
  await page.goto("/projects");
  for (const width of [320, 360, 390, 465, 499, 768, 1024, 1440, 2560, 465]) {
    await page.setViewportSize({ width, height: 850 });
    await expect(page.getByRole("button", { name: "Change color theme" })).toBeVisible();
    await expect
      .poll(() =>
        page.locator(".nav-inner").evaluate((row) => {
          const brand = row.querySelector(".nav-brand")!.getBoundingClientRect();
          const actions = row.querySelector(".nav-actions")!.getBoundingClientRect();
          const box = row.getBoundingClientRect();
          return brand.right <= actions.left && actions.right <= box.right + 1;
        }),
      )
      .toBe(true);
    const button = page.getByRole("button", { name: "Change color theme" });
    const box = (await button.boundingBox())!;
    expect(Math.abs(box.width - box.height)).toBeLessThan(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    ).toBe(false);
  }
  await page.getByRole("button", { name: "Change color theme" }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Change color theme" })).toBeFocused();
  await expect(page.getByRole("group", { name: "Color theme" })).toHaveCount(0);
});

test("paper tables, captions, math and next-project card remain readable", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/projects/plantini");
  for (const selector of [".case-body td", ".case-body figcaption"]) {
    await expect(page.locator(selector).first()).toHaveCSS("color", "rgb(212, 223, 239)");
  }
  await expect(page.locator(".case-body .katex").first()).toHaveCSS(
    "color",
    "rgb(230, 237, 248)",
  );
  await expect(page.locator(".case-next strong")).toHaveCSS("color", "rgb(11, 25, 68)");
  await page.locator(".case-next").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/theme-paper-next-dark.png" });
});

test("saved theme syncs to another open tab", async ({ page, context }) => {
  await page.goto("/projects");
  const second = await context.newPage();
  await second.goto("/projects/easyshield");
  await page.getByRole("button", { name: "Change color theme" }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(second.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("dark main-page and case-study text meets contrast requirements", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  for (const route of ["/", "/projects", "/projects/plantini"]) {
    await page.goto(route);
    if (route === "/") {
      await page.getByRole("button", { name: "Skip intro" }).click();
      await expect(page.locator("[data-welcome-screen]")).toBeHidden();
    }
    const result = await new AxeBuilder({ page })
      .include("main")
      .withRules(["color-contrast"])
      .analyze();
    expect(result.violations, route).toEqual([]);
  }
});
