import { test, expect } from '@playwright/test';

test('verify desktop alignment and centering', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification-1440px-centered.png', fullPage: true });

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification-1920px-centered.png', fullPage: true });

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification-360px-mobile.png', fullPage: true });
});
