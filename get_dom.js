const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://bemboardknowlage.my.canva.site/knowlage-sharing-page2', { waitUntil: 'networkidle' });
  const text = await page.innerText('body');
  console.log(text);
  await browser.close();
})();
