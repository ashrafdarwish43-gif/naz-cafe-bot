const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const cors = require("cors");
const botClient = require("../src/botClient");

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

  if (!client) {
    return res.send("Bot not ready yet");
  }

  const userGuilds = req.user.guilds;
  const botGuilds = client.guilds.cache;

  const mutualGuilds = userGuilds.filter(g => botGuilds.has(g.id));

  const guildList = mutualGuilds
    .map(g => {
      const icon = g.icon
        ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
        : "https://cdn.discordapp.com/embed/avatars/0.png";

      return `
      <li style="margin:10px 0;">
        <img src="${icon}" width="30" style="vertical-align:middle;border-radius:50%">
        <a href="/server/${g.id}">${g.name}</a>
      </li>
      `;
    })
    .join("");

  res.send(`
    <h1>Welcome ${req.user.username}</h1>

    <h2>Your Servers</h2>

    <ul style="list-style:none;padding:0">
      ${guildList}
    </ul>
  `);
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
