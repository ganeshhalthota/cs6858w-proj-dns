const fs = require("fs");
const csvParser = require("csv-parser");
const csvWriter = require("csv-writer").createObjectCsvWriter;
const csvFilePath = "domain_registry.csv";

const writer = csvWriter({
  path: csvFilePath,
  header: [
    { id: "transactionType", title: "Transaction Type" },
    { id: "transactionId", title: "Transaction ID" },
    { id: "domain", title: "Domain" },
    { id: "ipv4", title: "IPv4" },
    { id: "expiration", title: "Expiration" },
  ],
  append: fs.existsSync(csvFilePath),
});

function store_in_csv(transactionType, transactionId, domain, ipv4, expiration) {
  writer.writeRecords([
    {
      transactionType: transactionType,
      transactionId: transactionId,
      domain: domain,
      ipv4: ipv4,
      expiration: expiration,
    },
  ]);
}

// Function to find the domain in the CSV file
const find_domain_in_csv = async (domain) => {
  return new Promise((resolve, reject) => {
    let lastMatch = null;

    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (data) => {
        if (data["Domain"] === domain) {
          lastMatch = data;
        }
      })
      .on("end", () => resolve(lastMatch))
      .on("error", reject);
  });
};

module.exports = { store_in_csv, find_domain_in_csv };
