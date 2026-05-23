const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1440px
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/dashboard?verify=true');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification-1440px-centered.png', fullPage: true });

  // 1920px
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/dashboard?verify=true');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification-1920px-centered.png', fullPage: true });

  // 360px
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification-360px-mobile.png', fullPage: true });

  await browser.close();
})();
