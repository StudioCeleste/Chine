const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  
  console.log('Waiting for nav buttons...');
  await page.waitForSelector('nav button');
  const buttons = await page.$$('nav button');
  
  console.log('Clicking Carte...');
  await buttons[1].click(); // Click Carte
  
  await page.waitForTimeout(2000);
  console.log('Done.');
  await browser.close();
})();
