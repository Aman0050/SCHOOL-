const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text(), msg.location());
    }
  });
  
  page.on('pageerror', err => {
    console.log('UNCAUGHT EXCEPTION:', err.stack);
  });
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  } catch (err) {
    console.log('Navigation failed:', err.message);
  }
  
  await browser.close();
})();
