const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    try {
        const url = 'https://giabac.phuquygroup.vn/';
        console.log('🔗 Fetch:', url);

        const res = await fetch(url);
        const html = await res.text();

        const $ = cheerio.load(html);

        const rows = $('table.table-striped tbody tr');
        let matched = null;
        const logs = [];

        rows.each((i, el) => {
            const cols = $(el).find('td');
            if (cols.length < 4) return; // không đủ cột thì bỏ qua

            const product = $(cols[0]).text().replace(/\s+/g, ' ').trim();
            const unit = $(cols[1]).text().replace(/\s+/g, ' ').trim();
            let buyPrice = $(cols[2]).text().replace(/\s+/g, '').replace(/,/g, '');
            let sellPrice = $(cols[3]).text().replace(/\s+/g, '').replace(/,/g, '');

            // Nếu giá rỗng hoặc dấu '-', đổi thành null
            buyPrice = buyPrice === '-' || buyPrice === '' ? null : Number(buyPrice);
            sellPrice = sellPrice === '-' || sellPrice === '' ? null : Number(sellPrice);

            logs.push({ product, unit, buyPrice, sellPrice });

            if (
                product.toLowerCase().includes('1kilo') &&
                unit.toLowerCase().includes('vnđ/kg')
            ) {
                matched = { product, unit, buyPrice, sellPrice };
            }
        });

        console.log('📋 Tất cả dữ liệu:');
        logs.forEach((row, i) => {
            console.log(`🔸 [${i}] ${row.product} | ${row.unit} | Mua: ${row.buyPrice} | Bán: ${row.sellPrice}`);
        });

        if (matched) {
            const output = {
                timestamp: new Date().toISOString(),
                ...matched
            };
            fs.writeFileSync('silver_price.json', JSON.stringify(output, null, 2));
            console.log('\n✅ Đã lưu file silver_price.json');
        } else {
            console.log('\n❌ Không tìm thấy sản phẩm 1KILO');
        }
    } catch (err) {
        console.error('❌ Lỗi:', err);
    }
})();
