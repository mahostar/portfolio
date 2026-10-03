import { expect, test } from "@playwright/test";

for (const width of [602, 1440]) {
  test(`every milestone cover is in its gallery exactly once at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const cards = page.locator(".archive-card[data-story]");
    await expect(cards).toHaveCount(7);
    for (let index = 0; index < 7; index++) {
      const card = cards.nth(index);
      const image = card.locator(".archive-visual img");
      const cover = await image.getAttribute("src");
      const url = new URL(cover!, page.url());
      const source = url.searchParams.get("url") || url.pathname;
      await card.getByRole("button", { name: "Read the story" }).click();
      const dialog = card.locator("dialog");
      await expect(dialog).toBeVisible();
      const counter = dialog.locator('footer [aria-live="polite"]');
      const total = Number((await counter.innerText()).match(/\/\s*(\d+)/)?.[1]);
      expect(total).toBeGreaterThan(0);
      const images: string[] = [];
      for (let position = 1; position <= total; position++) {
        await expect(counter).toContainText(`${position} / ${total}`);
        const current = dialog.locator("img");
        if (await current.count()) images.push((await current.getAttribute("src"))!);
        if (position < total) await dialog.getByRole("button", { name: "Next media" }).click();
      }
      expect(images.filter((src) => src === source), (await card.getAttribute("data-story")) || "Milestone card").toHaveLength(1);
      if (await card.getAttribute("data-story") === "pcb-training") {
        expect(images.some((src) => src.endsWith("custom-control-pcb--105.webp"))).toBe(true);
      }
      await dialog.getByRole("button", { name: "Close gallery" }).click();
    }
  });
}
