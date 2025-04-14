const express = require("express");
const bodyParser = require("body-parser");
const { registerDomain } = require("./src/register");
const { resolveDomain } = require("./src/resolve");
const { renewDomain } = require("./src/renew");
const { initTransfer, approveTransfer } = require("./src/transfer");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend")));

// Register endpoint
app.post("/register", async (req, res) => {
  const { accId, priKey, domain, ipv4 } = req.body;
  try {
    const success = await registerDomain(accId, priKey, domain, ipv4);
    if (success) {
      res.send("✅ Domain registered successfully!");
    } else {
      res.status(500).send("❌ Domain registration failed.");
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// Renew endpoint
app.post("/renew", async (req, res) => {
  const { accId, priKey, domain } = req.body;
  try {
    const success = await renewDomain(accId, priKey, domain);
    if (success) {
      res.send("✅ Domain renewed successfully!");
    } else {
      res.status(500).send("❌ Domain renew failed.");
    }
  } catch (err) {
    console.error("Renew error:", err);
    res.status(500).send("❌ Internal server error");
  }
});

// Resolve endpoint
app.get("/resolve", async (req, res) => {
  const domain = req.query.domain;
  try {
      const result = await resolveDomain(domain);
      if (result) {
          res.send(`✅ Resolved IP: ${result}`);
      } else {
          res.status(404).send("❌ Domain not found or validation failed");
      }
  } catch (error) {
      console.error("Resolve error:", error);
      res.status(500).send("❌ Internal Server Error during resolution");
  }
});

app.post("/init_transfer", async (req, res) => {
  const { accId, priKey, domain , newAccId} = req.body;
  try {
    const success = await initTransfer(accId, priKey, domain, newAccId);
    if (success) {
      res.send("✅ Domain Transfer Initiated!");
    } else {
      res.status(500).send("❌ Domain Transfer failed.");
    }
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).send("❌ Internal server error");
  }
});

app.post("/approve_transfer", async (req, res) => {
  const { accId, priKey, domain } = req.body;
  try {
    const success = await approveTransfer(accId, priKey, domain);
    if (success) {
      res.send("✅ Domain Transfer Success!");
    } else {
      res.status(500).send("❌ Domain Transfer failed.");
    }
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).send("❌ Internal server error");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("🌐 Server running at http://localhost:3000");
});
