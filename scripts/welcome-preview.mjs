import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://localhost:3002';
await fs.mkdir('artifacts/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
try {
  for (const [width, height] of [[1440, 900], [390, 844], [2560, 1440]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('[data-welcome-screen]').isVisible(), false, 'First visit skips the intro');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-welcome-screen][data-phase="greeting"]');
    const intro = page.locator('[data-welcome-screen]');
    assert.equal(await page.locator('#main').evaluate(node => node.inert), true);
    await page.waitForTimeout(650);
    const stroke = await page.locator('#welcome-title path').first().evaluate(node => parseFloat(getComputedStyle(node).strokeDashoffset));
    assert(stroke > 0 && stroke < 1, 'Pen stroke should be partway through drawing');
    await page.screenshot({ path: `artifacts/screenshots/welcome-writing-${width}.png` });
    await page.waitForTimeout(2700);
    await page.screenshot({ path: `artifacts/screenshots/welcome-${width}.png` });
    await page.waitForSelector('[data-welcome-screen][data-phase="reveal"]');
    await page.waitForTimeout(220);
    await page.screenshot({ path: `artifacts/screenshots/welcome-reveal-${width}.png` });
    const center = await page.evaluate(() => {
      const screen = document.querySelector('[data-welcome-screen]');
      const dot = document.querySelector('#welcome-title circle');
      const hole = screen.querySelector('mask circle');
      const bounds = screen.getBoundingClientRect();
      const point = dot.getBoundingClientRect();
      return { expected: (point.left + point.width / 2 - bounds.left) * screen.clientWidth / bounds.width, actual: Number(hole.getAttribute('cx')) };
    });
    assert(Math.abs(center.expected - center.actual) < 1, 'Reveal should start at the yellow dot, including QHD zoom');
    await intro.waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#main').evaluate(node => node.inert), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    await page.screenshot({ path: `artifacts/screenshots/welcome-finished-${width}.png` });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-welcome-screen][data-phase="greeting"]');
    assert.equal(await intro.isVisible(), true, 'Replay the intro on refresh');
    await page.getByRole('button', { name: 'Skip intro' }).click();
    await intro.waitFor({ state: 'hidden', timeout: 3000 });
    console.log(JSON.stringify({ width, penStroke: stroke, revealCenter: center, restoredInput: true, replayedOnRefresh: true }));
    await context.close();
  }
  for (const mode of ['skip', 'escape', 'reduced', 'hash', 'no-js', 'project']) {
    const context = await browser.newContext({ reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'no-js' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}${mode === 'hash' ? '/#skills' : mode === 'project' ? '/projects' : '/'}`, { waitUntil: 'domcontentloaded' });
    const intro = page.locator('[data-welcome-screen]');
    if (mode === 'skip' || mode === 'escape' || mode === 'reduced') {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-welcome-screen][data-phase="greeting"]');
      if (mode === 'skip') await page.getByRole('button', { name: 'Skip intro' }).click();
      if (mode === 'escape') await page.keyboard.press('Escape');
      await intro.waitFor({ state: 'hidden', timeout: 3000 });
      assert.equal(await page.locator('#main').evaluate(node => node.inert), false);
    } else {
      await page.waitForTimeout(400);
      assert.equal(await intro.isVisible(), false);
    }
    console.log(`PASS ${mode}`);
    await context.close();
  }
  assert.deepEqual(errors, [], 'Browser must have no uncaught errors');
} finally {
  await browser.close();
}
