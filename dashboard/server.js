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

// test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API working ✅"
  });
});

// 🚨 CRITICAL FOR RAILWAY
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});

// ✅ keep-alive log (helps Railway detect activity)
setInterval(() => {
  console.log("🫀 Dashboard heartbeat alive");
}, 60000);
