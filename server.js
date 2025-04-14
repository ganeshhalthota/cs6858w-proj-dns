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

// Helper function to handle responses and errors
const handleRequest = async (req, res, operation, successMessage, errorMessage) => {
  try {
    const success = await operation(req.body);
    if (success) {
      res.send(`✅ ${successMessage}`);
    } else {
      res.status(500).send(`❌ ${errorMessage}`);
    }
  } catch (err) {
    console.error(`${errorMessage} error:`, err);
    res.status(500).send("❌ Internal server error");
  }
};

// Register endpoint
app.post("/register", (req, res) => {
  handleRequest(req, res, 
    ({ accId, priKey, domain, ipv4 }) => registerDomain(accId, priKey, domain, ipv4),
    "Domain registered successfully!",
    "Domain registration failed"
  );
});

// Renew endpoint
app.post("/renew", (req, res) => {
  handleRequest(req, res, 
    ({ accId, priKey, domain }) => renewDomain(accId, priKey, domain),
    "Domain renewed successfully!",
    "Domain renew failed"
  );
});

// Resolve endpoint
app.get("/resolve", async (req, res) => {
  const { domain } = req.query;
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

// Transfer Initiation endpoint
app.post("/init_transfer", (req, res) => {
  handleRequest(req, res, 
    ({ accId, priKey, domain, newAccId }) => initTransfer(accId, priKey, domain, newAccId),
    "Domain Transfer Initiated!",
    "Domain Transfer failed"
  );
});

// Transfer Approval endpoint
app.post("/approve_transfer", (req, res) => {
  handleRequest(req, res, 
    ({ accId, priKey, domain }) => approveTransfer(accId, priKey, domain),
    "Domain Transfer Success!",
    "Domain Transfer failed"
  );
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
app.listen(3000, () => {
  console.log("🌐 Server running at http://localhost:3000");
});
