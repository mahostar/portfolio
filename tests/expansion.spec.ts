import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("journey, pending content, identity, and certificate keyboard interaction", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page).toHaveTitle(/Med Wassim Mbarek/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Hi, I'm Med Wassim Mbarek");
  await expect(page.locator(".journey-list li")).toHaveCount(5);
  await expect(page.locator("#journey")).toContainText("completed in June 2025");
  await expect(page.locator("#journey")).toContainText("Former CEO · KaTEK");
  await expect(page.locator(".journey-planned .story-badge")).toHaveText("Planned");
  await expect(page.locator(".impact-card")).toHaveCount(3);
  await expect(page.locator(".interest-card")).toHaveCount(4);
  await expect(page.locator(".certificate-pending")).toHaveCount(2);
  const trigger = page.getByRole("button", { name: "Enlarge IELTS Academic" });
  await trigger.click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toBeVisible();
  await expect(viewer).toContainText("Overall band 6.0 · CEFR B2");
  await expect(page.getByRole("button", { name: "Close certificate viewer" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close certificate viewer" })).toBeFocused();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(viewer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "View details" }).click();
  await page.getByRole("button", { name: "Close certificate viewer" }).click();
  await expect(viewer).not.toBeVisible();
});

for (const width of [320, 390, 768, 1440, 2560]) {
  test(`new sections reflow and footer anchors work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const id of ["journey", "impact", "interests", "certificates"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.locator(`#${id}`).screenshot({ path: `artifacts/screenshots/expansion-${id}-${width}.png`, style: ".site-header,.bottom-nav,.skip-link{visibility:hidden!important}" });
    }
    await page.locator(".site-footer").screenshot({ path: `artifacts/screenshots/expansion-footer-${width}.png`, style: ".site-header,.bottom-nav,.skip-link{visibility:hidden!important}" });
    await page.getByRole("navigation", { name: "Footer navigation" }).getByRole("link", { name: "Impact", exact: true }).click();
    await expect(page.locator(width < 768 ? ".bottom-nav .active" : ".desktop-nav .active")).toHaveText("Impact");
    await expect(page.locator("#impact")).toBeInViewport();
    expect(errors).toEqual([]);
  });
}
