import { test, expect } from "@playwright/test";
import { paperSections } from "../src/lib/content-schema";

test.use({ reducedMotion: "reduce" });

const papers = [
  { slug: "windweave", equations: 13, figures: 10, styled: 7, coverVideo: false },
  { slug: "fabric-inspection", equations: 2, figures: 4, styled: 3, coverVideo: false },
  { slug: "easyshield", equations: 3, figures: 4, styled: 3, coverVideo: false },
  { slug: "tpms-generator", equations: 7, figures: 2, styled: 2, coverVideo: false },
  { slug: "algobrain", equations: 6, figures: 3, styled: 2, coverVideo: false },
  { slug: "plantini", equations: 5, figures: 7, styled: 7, coverVideo: false },
  { slug: "aquaflow", equations: 3, figures: 5, styled: 5, coverVideo: false },
  { slug: "smarthart", equations: 4, figures: 2, styled: 2, coverVideo: false },
];

for (const width of [390, 1440]) {
  for (const paper of papers) {
    test(`${paper.slug} renders math and navigates its gallery at ${width}px`, async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width, height: 950 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const { slug } = paper;
      await page.goto(`/projects/${slug}`);
      await expect(page.locator(".case-body h2")).toHaveText(paperSections);
      await expect(page.locator(".case-contents a")).toHaveText(
        paperSections.map(
          (title, index) => `${String(index + 1).padStart(2, "0")}${title}`,
        ),
      );
      await expect(page.locator(".katex-error, .case-body pre")).toHaveCount(0);
      await expect(page.locator(".case-body .katex-display")).toHaveCount(
        paper.equations,
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      ).toBe(false);
      expect(
        await page
          .locator(".katex-display")
          .evaluateAll((equations) =>
            equations.every((element) => element.scrollWidth <= element.clientWidth),
          ),
      ).toBe(true);
      if (!paper.coverVideo) {
        await page.getByRole("button", { name: /cover in gallery$/ }).click();
        await expect(page.locator("dialog[open]")).toBeVisible();
        if (slug === "algobrain" || slug === "easyshield") {
          await expect(page.locator("dialog[open] img"))
            .toHaveAttribute("src", slug === "algobrain" ? /algobrain\.webp/ : /easyshield-cover-v2\.webp/);
          await page.locator("dialog[open] img")
            .evaluate((element: HTMLImageElement) => element.decode());
          await page.screenshot({ path: `artifacts/${slug}-paper-cover-${width}.png` });
        }
        if (slug === "windweave") {
          await expect(page.locator("dialog[open] img")).toHaveAttribute(
            "src",
            /windweave-cover-v2\.webp/,
          );
          await page
            .locator("dialog[open] img")
            .evaluate((element: HTMLImageElement) => element.decode());
          await page.screenshot({ path: `artifacts/windweave-cuda-cover-${width}.png` });
        }
        await page.locator("dialog[open]").press("Escape");
      }
      for (const image of await page.locator(".case-body figure img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element: HTMLImageElement) => element.decode());
      }
      const triggers = page.getByRole("button", { name: /^Open figure:/ });
      const figureCount = await triggers.count();
      expect(figureCount).toBe(paper.figures);
      await expect(
        page.locator(".case-body figure img[src*='-styled.webp']"),
      ).toHaveCount(paper.styled);
      if (slug === "windweave") {
        await expect(
          page.locator(".case-body figure").first().locator("img"),
        ).toHaveAttribute("src", /windweave-streaming\.webp/);
      }
      if (slug === "algobrain" || slug === "easyshield") {
        await expect(page.locator(".case-body figure").first().locator("img"))
          .toHaveAttribute("src", slug === "algobrain" ? /algobrain-abstract-v2\.webp/ : /easyshield-thumbnail\.webp/);
      }
      for (let i = 0; i < figureCount; i++) {
        const expectedSrc = await page
          .locator(".case-body figure img")
          .nth(i)
          .getAttribute("src");
        await triggers.nth(i).click();
        const dialog = page.locator("dialog[open]");
        await expect(dialog).toBeVisible();
        const selectedImage = dialog.locator("img");
        const originalSrc = (src: string) => {
          const url = new URL(src, "http://localhost");
          return url.searchParams.get("url") || url.pathname;
        };
        await expect
          .poll(async () => originalSrc((await selectedImage.getAttribute("src")) || ""))
          .toBe(originalSrc(expectedSrc || ""));
        await selectedImage.evaluate((element: HTMLImageElement) => element.decode());
        await dialog.getByRole("button", { name: "Next media" }).click();
        await dialog.press("ArrowLeft");
        await dialog.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(triggers.nth(i)).toBeFocused();
      }
      expect(context.pages()).toHaveLength(1);
      await page.locator(".case-contents a").filter({ hasText: "Method" }).click();
      await page.screenshot({ path: `artifacts/paper-${slug}-${width}.png` });
      if (slug === "windweave") {
        await page
          .getByRole("button", {
            name: "Open figure: CPU–GPU streaming architecture",
            exact: true,
          })
          .click();
        await page
          .locator("dialog[open] img")
          .evaluate((element: HTMLImageElement) => element.decode());
        await page.screenshot({ path: `artifacts/paper-gallery-${width}.png` });
        await page.locator("dialog[open]").press("Escape");
      }
      expect(errors).toEqual([]);
    });
  }
}
