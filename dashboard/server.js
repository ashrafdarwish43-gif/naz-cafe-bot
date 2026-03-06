const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const cors = require("cors");
const botClient = require("../src/botClient");

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));
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

/*
========================
DISCORD LOGIN
========================
*/

app.get("/auth/discord", passport.authenticate("discord"));

/*
========================
DISCORD CALLBACK
========================
*/

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

/*
========================
DASHBOARD
========================
*/

app.get("/dashboard", (req, res) => {
  if (!req.user) return res.redirect("/auth/discord");

  const client = botClient.getClient();
  if (!client) return res.send("Bot not ready yet");

  const userGuilds = req.user.guilds;
  const botGuilds = client.guilds.cache;

  const mutualGuilds = userGuilds.filter(g => botGuilds.has(g.id));

  res.render("dashboard", {
    user: req.user,
    guilds: mutualGuilds
  });
});
/*
========================
SERVER DASHBOARD
========================
*/

app.get("/server/:id", (req, res) => {
  if (!req.user) return res.redirect("/auth/discord");

  const guildId = req.params.id;

  res.send(`
    <h1>Server Dashboard</h1>

    <h2>Guild ID: ${guildId}</h2>

    <h3>Modules</h3>

    <ul>
      <li>Moderation</li>
      <li>Leveling</li>
      <li>Economy</li>
      <li>Welcome System</li>
      <li>Logs</li>
    </ul>

    <a href="/dashboard">⬅ Back</a>
  `);
});

app.get("/server/:id", (req, res) => {
  if (!req.user) return res.redirect("/auth/discord");

  const guildId = req.params.id;

  res.render("server", {
    guildId
  });
});
/*
========================
HEALTH CHECK
========================
*/

app.get("/", (req, res) => {
  res.json({
    status: "NAZ Cafe dashboard online 🚀"
  });
});

/*
========================
START SERVER
========================
*/

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});
