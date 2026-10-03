import { readdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

type AuditEvent = { event: string; url: string; time: number; attribute?: string; previous?: string | null; value?: string | null; persisted?: boolean };
declare global {
  interface Window {
    __welcomeAudit: { documentId: string; events: AuditEvent[] };
  }
}

const projectSlugs = readdirSync("src/content/projects")
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => file.slice(0, -4));
const homeSections = ["home", "work", "about", "journey", "interests", "impact", "skills", "certificates", "contact"];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const events: AuditEvent[] = [];
    window.__welcomeAudit = { documentId: Math.random().toString(36).slice(2), events };
    const log = (event: string, data: Partial<AuditEvent> = {}) => events.push({
      event, url: location.pathname + location.search + location.hash, time: performance.now(), ...data,
    });
    for (const name of ["DOMContentLoaded", "load", "popstate", "hashchange", "pagehide", "pageshow"]) {
      addEventListener(name, (event) => log(name, { persisted: (event as PageTransitionEvent).persisted }));
    }
    new MutationObserver((records) => {
      for (const record of records) {
        const element = record.target as Element;
        if (record.attributeName === "inert" && element.id !== "main") continue;
        log("attribute", { attribute: record.attributeName!, previous: record.oldValue, value: element.getAttribute(record.attributeName!) });
      }
    }).observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["data-welcome", "data-phase", "inert"] });
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (!page.isClosed()) {
    await testInfo.attach("welcome-events", {
      body: JSON.stringify(await page.evaluate(() => window.__welcomeAudit ?? null), null, 2),
      contentType: "application/json",
    });
  }
});

async function resetAudit(page: Page) {
  await page.evaluate(() => { window.__welcomeAudit.events.length = 0; });
}

async function expectNoWelcome(page: Page) {
  await expect(page.locator("[data-welcome-screen]")).toBeHidden();
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  // Allow queued effects/mutation callbacks to settle, then reject even a flash.
  await page.waitForTimeout(200);
  const events = await page.evaluate(() => window.__welcomeAudit.events.filter((entry) => entry.event === "attribute"));
  expect(events).toEqual([]);
  expect(await page.evaluate(() => document.activeElement?.closest("[data-welcome-screen]") !== null)).toBe(false);
}

async function reloadAndSkip(page: Page) {
  await page.reload();
  await expect(page.locator('[data-welcome-screen][data-phase="greeting"]')).toBeVisible();
  await expect(page.locator("#main")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator("[data-welcome-screen]")).toBeHidden();
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await resetAudit(page);
}

test("fresh home and section URLs skip welcome; every home-section refresh plays", async ({ page }) => {
  test.setTimeout(120000);
  for (const section of homeSections) {
    await page.goto(`/#${section}`);
    await expectNoWelcome(page);
    await reloadAndSkip(page);
    await expect(page).toHaveURL(new RegExp(`#${section}$`));
    await expectNoWelcome(page);
  }
});

test("a home reload cannot replay through catalog, projects, or browser history", async ({ page }) => {
  await page.goto("/");
  await reloadAndSkip(page);
  const documentId = await page.evaluate(() => window.__welcomeAudit.documentId);
  await page.locator('a[href="/projects"]').first().click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await expectNoWelcome(page);
  await page.locator('a[href="/projects/easyshield"]').first().click();
  await expect(page).toHaveURL(/\/projects\/easyshield$/);
  await page.locator(".nav-brand").click();
  await expect(page).toHaveURL(/\/#home$/);
  await expectNoWelcome(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/easyshield$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/#home$/);
  await expectNoWelcome(page);
  expect(await page.evaluate(() => window.__welcomeAudit.documentId)).toBe(documentId);
  expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0] && (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type)).toBe("reload");
});

test("every project stays ineligible after project refresh and home return", async ({ page }) => {
  test.setTimeout(120000);
  for (const slug of projectSlugs) {
    await page.goto(`/projects/${slug}`);
    await expectNoWelcome(page);
    await page.reload();
    await expectNoWelcome(page);
    await page.locator(".nav-brand").click();
    await expect(page).toHaveURL(/\/#home$/);
    await expectNoWelcome(page);
  }
});

test("all home navigation destinations and 404 recovery skip welcome", async ({ page }) => {
  test.setTimeout(120000);
  for (const section of homeSections) {
    await page.goto("/projects");
    const link = page.locator(`.desktop-nav a[href="/#${section}"]`);
    await (await link.count() ? link : page.locator(`.site-footer a[href="/#${section}"]`).first()).click();
    await expect(page).toHaveURL(new RegExp(`#${section}$`));
    await expectNoWelcome(page);
  }
  await page.goto("/missing-welcome-test");
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expectNoWelcome(page);
});

test("mobile navigation and same-home repeated anchors never play welcome", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/plantini");
  await page.locator('.bottom-nav a[href="/#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expectNoWelcome(page);
  await page.locator('.bottom-nav a[href="#home"]').click();
  await page.locator('.bottom-nav a[href="#home"]').click();
  await expectNoWelcome(page);
  await expect(page).toHaveURL(/#home$/);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("intro completion releases Escape for home dialogs and leaves contact usable", async ({ page }) => {
  await page.goto("/");
  await reloadAndSkip(page);
  await page.locator(".certificate-preview").first().click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.locator('.desktop-nav a[href="#contact"]').click();
  await page.getByLabel("Name", { exact: true }).fill("Navigation check");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Navigation check");
  await expectNoWelcome(page);
});

test("history interrupts a playing intro without rearming it", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  await page.reload();
  await expect(page.locator('[data-phase="greeting"]')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await resetAudit(page);
  await page.goForward();
  await expect(page).toHaveURL(/#work$/);
  await expectNoWelcome(page);
});

test("page suspension retires a playing intro and restores input", async ({ page }) => {
  await page.goto("/");
  await page.reload();
  await expect(page.locator('[data-phase="greeting"]')).toBeVisible();
  // Deterministic lifecycle contract; this does not claim an actual BFCache hit.
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
  await expect(page.locator("[data-welcome-screen]")).toBeHidden();
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await resetAudit(page);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await expectNoWelcome(page);
  await page.locator('a[href="/projects"]').first().click();
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expectNoWelcome(page);
});

test("missing Navigation Timing leaves a refreshed homepage usable", async ({ page }) => {
  await page.addInitScript(() => {
    const getEntries = performance.getEntriesByType.bind(performance);
    performance.getEntriesByType = (type) => type === "navigation" ? [] : getEntries(type);
  });
  await page.goto("/");
  await page.reload();
  await expectNoWelcome(page);
});

test("no JavaScript never blocks a refreshed homepage", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-welcome-screen]")).toBeHidden();
    await expect(page.locator("#main")).not.toHaveAttribute("inert");
  } finally {
    await context.close();
  }
});

test("expired pending intro cannot restart after delayed hydration", async ({ page }) => {
  test.setTimeout(45000);
  await page.route("**/_next/**/*.js*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 9000));
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-welcome-screen]")).toBeHidden({ timeout: 15000 });
  await page.waitForLoadState("load");
  await resetAudit(page);
  await expectNoWelcome(page);
  await page.locator('a[href="/projects"]').first().click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expectNoWelcome(page);
});
