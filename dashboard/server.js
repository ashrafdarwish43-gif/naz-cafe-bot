const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./auth");
const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
// ✅ Health check
app.get("/", (req, res) => {
  res.json({
    status: "NAZ Cafe dashboard online 🚀"
  });
});

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API working ✅"
  });
});
// login
app.get("/auth/discord", passport.authenticate("discord"));

// callback
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/api/me");
  }
);

// current user
app.get("/api/me", (req, res) => {
  if (!req.user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: req.user.username,
    id: req.user.id,
    guilds: req.user.guilds
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
  
});
