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

    let index = 0;

    const interval = setInterval(async () => {
      let count = 0;
      while (index < coinIds.length && count < 3) {
        const id = coinIds[index];
        const filePath = path.join(dir, `${id}.json`);

        if (fs.existsSync(filePath)) {
          console.log(`🔹 Skip ${id}, file đã tồn tại.`);
          index++;
          continue;
        }

        try {
          const url = `https://api.coingecko.com/api/v3/coins/${id}`;
          const data = await download(url);
          fs.writeFileSync(filePath, data);
          console.log(`✅ [${index + 1}/${coinIds.length}] Đã lưu ${id}.json`);
          count++;
        } catch (err) {
          console.warn(`⚠️ Lỗi tải ${id}: ${err.message}`);
        }
        index++;
      }

      if (index >= coinIds.length) {
        clearInterval(interval);
        console.log("✅ Hoàn thành tải thông tin coin.");
      }
    }, 60 * 1000); // 1 phút = 60000ms

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
})();
