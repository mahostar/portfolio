import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

await fs.mkdir('artifacts/header-audit', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
await page.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const results = [];
for (let width = 280; width <= 1440; width++) {
  await page.setViewportSize({ width, height: 900 });
  const result = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
    const brand = rect('.nav-brand'), cta = rect('.nav-cta'), nav = rect('.desktop-nav');
    const row = document.querySelector('.nav-inner');
    const name = document.querySelector('.nav-brand-name');
    return { width: innerWidth, header: rect('.site-header').height, available: row.clientWidth,
      brand: brand.width, cta: cta.width, nav: nav.width, gap: getComputedStyle(row).columnGap,
      name: getComputedStyle(name).display, wrapped: Math.abs(brand.y + brand.height / 2 - cta.y - cta.height / 2) > 1,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  results.push(result);
}
const ranges = [];
for (const result of results) {
  if (!result.wrapped && !result.overflow) continue;
  const last = ranges.at(-1);
  if (last && last.to + 1 === result.width && last.wrapped === result.wrapped && last.overflow === result.overflow) last.to = result.width;
  else ranges.push({ from: result.width, to: result.width, wrapped: result.wrapped, overflow: result.overflow });
}
console.log(JSON.stringify({ ranges, samples: results.filter(r => [340,341,360,375,390,480,767,768,1100,1101,1440].includes(r.width)) }, null, 2));
await fs.writeFile('artifacts/header-audit/baseline.json', JSON.stringify(results, null, 2));
await page.setViewportSize({ width: 360, height: 800 });
await page.screenshot({ path: 'artifacts/header-audit/before-360.png' });
const checks = [];
for (const route of ['/', '/projects']) {
  await page.goto(`http://localhost:3002${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const width of [340, 341, 390, 402, 403, 480, 767, 768, 1100, 1101, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    checks.push(await page.evaluate((route) => {
      const brand = document.querySelector('.nav-brand').getBoundingClientRect();
      const cta = document.querySelector('.nav-cta').getBoundingClientRect();
      const name = document.querySelector('.nav-brand-name');
      return { route, width: innerWidth, header: document.querySelector('.site-header').getBoundingClientRect().height,
        font: getComputedStyle(name).font, wrapped: Math.abs(brand.y + brand.height / 2 - cta.y - cta.height / 2) > 1 };
    }, route));
  }
}
await page.setViewportSize({ width: 403, height: 800 });
await page.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'artifacts/header-audit/fits-403.png' });
// Controlled fallback-font experiment: find the crossover with Arial metrics.
await page.locator('.nav-brand-name').evaluate(el => { el.style.fontFamily = 'Arial, sans-serif'; });
const fallback = [];
for (const width of [340,341,390,400,402,403]) {
  await page.setViewportSize({ width, height: 900 });
  fallback.push(await page.evaluate(() => {
    const brand = document.querySelector('.nav-brand').getBoundingClientRect();
    const cta = document.querySelector('.nav-cta').getBoundingClientRect();
    return { width: innerWidth, brand: brand.width, wrapped: Math.abs(brand.y + brand.height / 2 - cta.y - cta.height / 2) > 1 };
  }));
}
console.log(JSON.stringify({ checks, fallback }, null, 2));
await fs.writeFile('artifacts/header-audit/route-font-checks.json', JSON.stringify({ checks, fallback }, null, 2));
await browser.close();
