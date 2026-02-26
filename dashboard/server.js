const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH CHECK (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.status(200).send("NAZ Cafe alive");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API working ✅"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});
