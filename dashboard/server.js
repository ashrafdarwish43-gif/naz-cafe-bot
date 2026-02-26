const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.json({
    status: "NAZ Cafe dashboard online 🚀"
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API working ✅"
  });
});

// 🚨 CRITICAL — Railway requires a port
const PORT = process.env.PORT || 3000;

// 🚨 CRITICAL — bind to 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});

// keep-alive heartbeat (optional but good)
setInterval(() => {
  console.log("💓 Dashboard heartbeat");
}, 60000);
