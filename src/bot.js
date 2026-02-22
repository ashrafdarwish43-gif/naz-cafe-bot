require("dotenv").config();
const { Client, GatewayIntentBits, Partials, PermissionFlagsBits } = require("discord.js");
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
console.log("PREFIX =", prefix);
console.log("MESSAGE =", message.content);
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

  // ===== COMMAND CHECK =====
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ===== COMMANDS =====
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

    return message.channel.send(`🏆 **Leaderboard**\n${text}`);
  }
  // ===== MODERATION =====

// BAN
if (command === "ban") {
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)
    return message.reply("❌ You lack permission to ban.");

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user to ban.");

  if (!member.bannable)
    return message.reply("❌ I cannot ban this user.");

  await member.ban({ reason: `Banned by ${message.author.tag}` });

  return message.channel.send(`🔨 Banned **${member.user.tag}**`);
}

// KICK
if (command === "kick") {
  if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)
    return message.reply("❌ You lack permission to kick.");

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user to kick.");

  if (!member.kickable)
    return message.reply("❌ I cannot kick this user.");

  await member.kick(`Kicked by ${message.author.tag}`);

  return message.channel.send(`👢 Kicked **${member.user.tag}**`);
}

// TIMEOUT (10 minutes)
if (command === "timeout") {
  if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)
    return message.reply("❌ You lack permission to timeout.");

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user.");

  await member.timeout(10 * 60 * 1000);

  return message.channel.send(`⏳ Timed out **${member.user.tag}**`);
}

// ===== END MODERATION =====ِ
});
client.login(process.env.TOKEN);
