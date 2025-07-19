const https = require("https");
const fs = require("fs");

const url = "https://api.coingecko.com/api/v3/coins/list";

https.get(url, (res) => {
  let data = "";

  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    try {
      const coins = JSON.parse(data);
      fs.writeFileSync("all_coins.json", JSON.stringify(coins, null, 2));
      console.log(`✅ Đã lưu ${coins.length} coin vào all_coins.json`);
    } catch (err) {
      console.error("❌ Lỗi khi phân tích JSON:", err.message);
      process.exit(1);
    }
  });
}).on("error", err => {
  console.error("❌ Lỗi kết nối API:", err.message);
  process.exit(1);
});
