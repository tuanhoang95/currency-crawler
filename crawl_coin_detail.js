const https = require("https");
const fs = require("fs");
const path = require("path");

const COIN_LIST_URL = "https://raw.githubusercontent.com/tuanhoang95/currency-crawler/refs/heads/main/all_coins.json";

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, status: res.statusCode, body: data });
        }
      });
    }).on("error", err => {
      resolve({ success: false, status: 0, body: err.message });
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    console.log("📥 Fetching coin list...");
    const listRaw = await download(COIN_LIST_URL);
    const coinList = JSON.parse(listRaw.data);
    const coinIds = coinList.map(c => c.id);

    const dir = path.join("coin", "detail");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const coinsToFetch = coinIds.filter(id => {
      const filePath = path.join(dir, `${id}.json`);
      return !fs.existsSync(filePath);
    }).slice(0, 200); // crawl tối đa 200 coin mỗi lần

    console.log(`🔎 Đang crawl ${coinsToFetch.length} coin (tối đa)`);

    for (let i = 0; i < coinsToFetch.length; i++) {
      const id = coinsToFetch[i];
      const url = `https://api.coingecko.com/api/v3/coins/${id}`;
      const res = await download(url);

      if (res.success) {
        fs.writeFileSync(path.join(dir, `${id}.json`), res.data);
        console.log(`[${i + 1}/${coinsToFetch.length}] ✅ Đã lưu ${id}.json`);
      } else {
        console.warn(`[${i + 1}/${coinsToFetch.length}] ❌ Lỗi lấy ${id} - HTTP ${res.status}`);
      }

      await delay(12000); // 🕒 Delay 12 giây ~ 5 request/phút
    }

    console.log("🏁 Hoàn thành batch crawl");

  } catch (err) {
    console.error("❌ Lỗi tổng thể:", err.message);
  }
})();
