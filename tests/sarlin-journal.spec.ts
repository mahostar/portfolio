import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
 test(`Sarlin public paper renders at ${width}px`, async ({ page }) => {
  await page.setViewportSize({width, height:900});
  await page.goto('/research/sarlin-persona');
  const first=page.locator('[data-pdf-page="1"]');
  await expect(first).toHaveAttribute('aria-busy','false',{timeout:45000});
  await expect(first.locator('.textLayer')).toContainText('Sarlin');
  await expect(page.locator('[data-pdf-page]')).toHaveCount(41);
  await expect(page.getByRole('region',{name:'PDF pages',exact:true}).getByRole('alert')).toHaveCount(0);
  await page.screenshot({path:`artifacts/sarlin/reader-${width}.png`});
 });
}
