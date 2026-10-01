import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts/screenshots', { recursive: true });
let browser;
for (const channel of ['chrome', 'msedge', undefined]) {
  try { browser = await chromium.launch({ channel, headless: true }); console.log(`Browser: ${channel || 'playwright'}`); break; }
  catch { /* Try the next installed browser. */ }
}
if (!browser) throw new Error('No installed Chromium browser is available.');
const page = await browser.newPage({ reducedMotion: 'reduce' });
page.on('pageerror', (error) => console.error('PAGE ERROR', error.message));
for (const [width, height] of [[1440, 900], [390, 844]]) {
  await page.setViewportSize({ width, height });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.portrait img').evaluate((image) => image.decode());
  await page.waitForTimeout(900);
  await page.screenshot({ path: `artifacts/screenshots/home-${width}.png`, fullPage: true });
  await page.screenshot({ path: `artifacts/screenshots/viewport-${width}.png` });
  console.log(JSON.stringify({ width, title: await page.title(), heading: await page.locator('h1').innerText(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), featured: await page.locator('#featured-heading').boundingBox() }));
}
await browser.close();
