// crawl.js
const fs = require("fs");
const https = require("https");

https.get("https://api.exchangerate.host/latest?base=USD", (res) => {
  let data = "";

  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const parsed = JSON.parse(data);
    const vndRate = parsed.rates.VND;
    const output = {
      timestamp: new Date().toISOString(),
      USD_VND: vndRate
    };
    fs.writeFileSync("data.json", JSON.stringify(output, null, 2));
    console.log("Updated:", output);
  });
}).on("error", err => {
  console.error("Error:", err.message);
});
