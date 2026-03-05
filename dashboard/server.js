const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const cors = require("cors");

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

// Discord login
app.get("/auth/discord", passport.authenticate("discord"));

// Discord callback
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// health check
app.get("/", (req, res) => {
  res.json({
    status: "NAZ Cafe dashboard online 🚀"
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Dashboard running on port ${PORT}`);
});
