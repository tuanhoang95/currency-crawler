const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://giabac.phuquygroup.vn/', { waitUntil: 'networkidle2' });

  await page.waitForSelector('table.table-striped');

  const result = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table.table-striped tbody tr'));
    for (const row of rows) {
      const cols = row.querySelectorAll('td');
      if (cols.length < 4) continue; // bỏ dòng tiêu đề

      const product = cols[0]?.innerText.trim();
      const unit = cols[1]?.innerText.trim();
      const sellPrice = cols[3]?.innerText.trim();

      if (
        product?.toLowerCase().includes('1kilo') &&
        unit?.toLowerCase().includes('vnd/kg')
      ) {
        return {
          product,
          unit,
          sellPrice
        };
      }
    }

    return null;
  });

  if (result) {
    const output = {
      timestamp: new Date().toISOString(),
      ...result
    };
    fs.writeFileSync('silver_price.json', JSON.stringify(output, null, 2));
    console.log('✅ Saved:', output);
  } else {
    console.log('❌ Không tìm thấy dòng BẠC 1KG nào');
  }

  await browser.close();
})();
