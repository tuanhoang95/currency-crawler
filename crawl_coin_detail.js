const https = require("https");
const fs = require("fs");
const path = require("path");

const COIN_LIST_URL = "https://raw.githubusercontent.com/tuanhoang95/currency-crawler/refs/heads/main/all_coins.json";

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    console.log("📥 Fetching coin list...");
    const listRaw = await download(COIN_LIST_URL);
    const coinList = JSON.parse(listRaw);
    const coinIds = coinList.map(c => c.id);

    const dir = path.join("coin", "detail");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Lọc coin chưa có file json
    const coinsToFetch = coinIds.filter(id => {
      const filePath = path.join(dir, `${id}.json`);
      return !fs.existsSync(filePath);
    }).slice(0, 200); // chỉ lấy 200 coin chưa crawl

    console.log(`🔎 Sẽ lấy thông tin cho ${coinsToFetch.length} coin chưa crawl`);

    for (let i = 0; i < coinsToFetch.length; i++) {
      const id = coinsToFetch[i];
      try {
        const url = `https://api.coingecko.com/api/v3/coins/${id}`;
        const data = await download(url);
        fs.writeFileSync(path.join(dir, `${id}.json`), data);
        console.log(`[${i + 1}/${coinsToFetch.length}] Đã lưu ${id}.json`);
        await delay(3000); // delay 3 giây = 20 request/phút
      } catch (err) {
        console.warn(`⚠️ Lỗi tải ${id}: ${err.message}`);
      }
    }

    console.log("✅ Hoàn thành batch crawl 200 coin.");

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
})();
