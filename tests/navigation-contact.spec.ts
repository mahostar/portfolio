import { test, expect } from "@playwright/test";

for (const [width, height] of [[390, 844], [1440, 900], [2000, 1200], [2560, 1600]]) {
  test(`Contact stays active at the scroll limit at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const nav = page.locator(width < 768 ? ".bottom-nav" : ".desktop-nav");
    const contact = nav.getByRole("link", { name: "Contact", exact: true });
    await expect(page.getByRole("complementary", { name: "Page sections" })).toHaveCount(0);
    await contact.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(contact).toHaveAttribute("aria-current", "page");
    await expect(nav.locator(".active")).toHaveText("Contact");

    if (width === 2560) {
      // Reproduce the case where Contact cannot reach the scroll-spy anchor.
      expect(await page.locator("#contact").evaluate((element) =>
        element.getBoundingClientRect().top > innerHeight * 0.38,
      )).toBe(true);
    }

    await page.screenshot({ path: `artifacts/screenshots/contact-navigation-${width}.png` });
    await page.locator("#work").evaluate((element) =>
      window.scrollTo({
        top: scrollY + element.getBoundingClientRect().top - 120,
        behavior: "instant",
      }),
    );
    await expect(nav.locator(".active")).toHaveText("Work");
    // The URL is already #contact: repeat navigation must still update the tab.
    await contact.click();
    await expect(contact).toHaveAttribute("aria-current", "page");

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(nav.locator(".active")).toHaveText("Home");
    await page.evaluate(() => window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }));
    await expect(contact).toHaveAttribute("aria-current", "page");
    expect(errors).toEqual([]);
  });
}
