const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "naz-secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------------- LOGIN ---------------- */

app.get("/auth/discord", passport.authenticate("discord"));

/* ---------------- CALLBACK ---------------- */

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

/* ---------------- DASHBOARD ---------------- */

app.get("/dashboard", (req, res) => {
  if (!req.user) {
    return res.redirect("/auth/discord");
  }

  const guildList = req.user.guilds
    .map(g => `<li>${g.name}</li>`)
    .join("");

  res.send(`
    <h1>Welcome ${req.user.username}</h1>
    <h2>Your Servers</h2>
    <ul>
      ${guildList}
    </ul>
  `);
});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req, res) => {
  res.json({
    status: "NAZ Cafe dashboard online 🚀"
  });
});
console.log("Dashboard routes loaded:");
console.log("/auth/discord");
console.log("/auth/discord/callback");
console.log("/dashboard");
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});
