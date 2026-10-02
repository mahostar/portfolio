import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await fs.mkdir('artifacts/screenshots', { recursive: true });
try {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://localhost:3002/?intro=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-welcome-screen][data-phase="greeting"]');
    await page.locator('[data-welcome-screen]').waitFor({ state: 'hidden' });
    const covers = page.locator('.archive-visual img');
    for (const image of await covers.all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async node => { await node.decode(); });
      assert(await image.evaluate(node => node.naturalWidth > 0));
    }
    const card = page.locator('[data-story="solar-training"]');
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('.archive-visual img');
    const details = await image.evaluate(node => ({ src: node.currentSrc, width: node.naturalWidth, height: node.naturalHeight, fit: getComputedStyle(node).objectFit }));
    assert(details.src.endsWith('/images/evidence/milestones/solar-training/training-group-photo--117.webp'));
    assert.equal(details.width, 1600);
    assert.equal(details.height, 900);
    const response = await page.request.get(details.src);
    assert.equal(response.status(), 200);
    await card.screenshot({ path: `artifacts/screenshots/solar-restored-${width}.png` });
    await card.getByRole('button', { name: 'Read the story' }).click();
    const dialog = card.locator('dialog');
    await dialog.waitFor({ state: 'visible' });
    for (let index = 0; index < 6; index++) {
      const media = dialog.locator('img');
      if (await media.count()) await media.evaluate(async node => { await node.decode(); });
      if (index < 5) await dialog.getByRole('button', { name: 'Next media' }).click();
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    console.log(JSON.stringify({ width, solar: details, milestoneCoversLoaded: await covers.count(), galleryItemsChecked: 6, browserErrors: errors }));
    await context.close();
  }
} finally { await browser.close(); }
