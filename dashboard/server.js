const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Health check (Railway watches this)
app.get("/", (req, res) => {
  res.status(200).send("NAZ Cafe Dashboard Alive 🚀");
});

// ✅ API test
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API working ✅"
  });
});

// ⭐ IMPORTANT
const PORT = process.env.PORT || 3000;

// ⭐ IMPORTANT (Railway requirement)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});

// ⭐ HEARTBEAT (prevents sleep detection issues)
setInterval(() => {
  console.log("💓 Dashboard heartbeat alive");
}, 60_000);
