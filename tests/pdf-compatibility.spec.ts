import { test, expect } from "@playwright/test";
test("PDF renders without modern Promise APIs on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(Promise, "try", { value: undefined, configurable: true, writable: true });
  });
  page.on("pageerror", error => console.log("BROWSER ERROR:", error.message));
  page.on("console", message => { if(message.type() === "error") console.log(message.text()); });
  await page.goto("/research/ai-overwhelm");
  const first = page.locator('[data-pdf-page="1"]');
  await expect(first).toHaveAttribute("aria-busy", "false", { timeout: 60000 });
  await expect(first.locator("canvas")).toBeVisible();
  await expect(first.locator(".textLayer")).not.toBeEmpty();
  await expect(page.getByRole("region", { name: "PDF pages", exact: true }).getByRole("alert")).toHaveCount(0);
  await page.screenshot({ path: "artifacts/research/mobile-compatible.png" });
});
