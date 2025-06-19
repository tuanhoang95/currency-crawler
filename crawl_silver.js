const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Khởi động trình duyệt...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  console.log('🌐 Truy cập trang web...');
  await page.goto('https://giabac.phuquygroup.vn/', { waitUntil: 'networkidle2' });

  console.log('⏳ Chờ bảng giá tải...');
  await page.waitForSelector('table.table-striped');

  console.log('🔍 Đang phân tích dữ liệu bảng...');
  const result = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table.table-striped tbody tr'));
    const logs = [];
    let matched = null;

    for (const row of rows) {
      const cols = row.querySelectorAll('td');
      if (cols.length < 4) continue; // bỏ dòng không đủ cột

      const product = cols[0]?.innerText.trim();
      const unit = cols[1]?.innerText.trim();
      const buyPrice = cols[2]?.innerText.trim();
      const sellPrice = cols[3]?.innerText.trim();

      // Ghi log lại cho mỗi dòng
      logs.push({ product, unit, buyPrice, sellPrice });

      // Kiểm tra điều kiện khớp
      if (
        product?.toLowerCase().includes('1kilo') &&
        unit?.toLowerCase().includes('vnd/kg')
      ) {
        matched = { product, unit, sellPrice };
      }
    }

    return { logs, matched };
  });

  console.log('\n📋 Dữ liệu từng dòng đã đọc được từ bảng:');
  result.logs.forEach((row, i) => {
    console.log(`🔸 [${i}] ${row.product} | ${row.unit} | Mua: ${row.buyPrice} | Bán: ${row.sellPrice}`);
  });

  if (result.matched) {
    const output = {
      timestamp: new Date().toISOString(),
      ...result.matched
    };
    console.log('\n✅ Đã tìm thấy dòng khớp:');
    console.log(output);

    console.log('\n💾 Đang lưu vào silver_price.json...');
    fs.writeFileSync('silver_price.json', JSON.stringify(output, null, 2));
    console.log('✅ Đã lưu xong!');
  } else {
    console.log('\n❌ Không tìm thấy dòng BẠC 1KG nào!');
  }

  console.log('🛑 Đóng trình duyệt...');
  await browser.close();
})();
