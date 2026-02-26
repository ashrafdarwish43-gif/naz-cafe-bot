const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.json({
    status: "NAZ Cafe dashboard online 🚀"
  });
});

// ✅ Test config route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API working ✅"
  });
});

// ⭐ SAFE PORT HANDLING
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});
setInterval(() => {
  console.log("🌐 Dashboard heartbeat");
}, 60000);
