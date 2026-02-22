require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const User = require("./models/User");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const prefix = process.env.PREFIX || "!";

  // ===== XP SYSTEM =====
  let user = await User.findOne({
    userId: message.author.id,
    guildId: message.guild.id
  });

  if (!user) {
    user = await User.create({
      userId: message.author.id,
      guildId: message.guild.id
    });
  }

  const xpGain = Math.floor(Math.random() * 10) + 5;
  user.xp += xpGain;

  const neededXp = (user.level + 1) * 100;

  if (user.xp >= neededXp) {
    user.level += 1;
    user.xp = 0;
    message.channel.send(
      `🎉 ${message.author}, you reached level **${user.level}**!`
    );
  }

  await user.save();
  // ===== END XP =====

  // ===== PREFIX COMMANDS =====
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    return message.reply("Pong!");
  }

  if (command === "rank") {
    return message.reply(
      `📊 Level: **${user.level}** | XP: **${user.xp}**`
    );
  }

  if (command === "leaderboard") {
    const top = await User.find({ guildId: message.guild.id })
      .sort({ level: -1, xp: -1 })
      .limit(10);

    const text = top
      .map(
        (u, i) =>
          `**${i + 1}.** <@${u.userId}> — Level ${u.level} (${u.xp} XP)`
      )
      .join("\n");

    message.channel.send(`🏆 **Leaderboard**\n${text}`);
  }
});

client.login(process.env.TOKEN);
