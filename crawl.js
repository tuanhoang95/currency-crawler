const fs = require("fs");
const https = require("https");

const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,vnd";

https.get(url, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const parsed = JSON.parse(data);
    const output = {
      timestamp: new Date().toISOString(),
      bitcoin: parsed.bitcoin,
      ethereum: parsed.ethereum
    };
    fs.writeFileSync("prices.json", JSON.stringify(output, null, 2));
    console.log("Saved:", output);
  });
}).on("error", err => {
  console.error("Error:", err.message);
});
