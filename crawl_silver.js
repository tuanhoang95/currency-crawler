const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    try {
        const url = 'https://giabac.phuquygroup.vn/';
        console.log('🔗 Gửi request đến:', url);

        const res = await fetch(url);
        const body = await res.text();

        const $ = cheerio.load(body);

        const rows = $('table.table-striped tbody tr');
        let matched = null;
        const logs = [];

        rows.each((i, el) => {
            const cols = $(el).find('td');
            if (cols.length < 4) return; // skip row ko đủ cột

            const product = $(cols[0]).text().trim();
            const unit = $(cols[1]).text().trim();
            const buyPrice = $(cols[2]).text().trim();
            const sellPrice = $(cols[3]).text().trim();

            logs.push({ product, unit, buyPrice, sellPrice });

            if (
                product.toLowerCase().includes('1kilo') &&
                unit.toLowerCase().includes('vnd/kg')
            ) {
                matched = { product, unit, sellPrice };
            }
        });

        console.log('📋 Dữ liệu bảng:');
        logs.forEach((row, i) => {
            console.log(`🔸 [${i}] ${row.product} | ${row.unit} | Mua: ${row.buyPrice} | Bán: ${row.sellPrice}`);
        });

        if (matched) {
            const output = {
                timestamp: new Date().toISOString(),
                ...matched
            };
            fs.writeFileSync('silver_price.json', JSON.stringify(output, null, 2));
            console.log('\n✅ Lưu file silver_price.json thành công');
        } else {
            console.log('\n❌ Không tìm thấy dòng BẠC 1KILO');
        }
    } catch (err) {
        console.error('❌ Lỗi khi crawl:', err);
    }
})();
