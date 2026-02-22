require("dotenv").config();
const { Client, GatewayIntentBits, Partials, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Rank } = require("canvacord");
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

client.once("clientReady", () => {
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

  const neededXp = Math.floor(100 * Math.pow(user.level + 1, 1.5));

  if (user.xp >= neededXp) {
  user.level += 1;
  user.xp = 0;

  const levelEmbed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🎉 Level Up!")
    .setDescription(`${message.author} reached **Level ${user.level}**`)
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  await message.channel.send({ embeds: [levelEmbed] });
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
  const neededXp = Math.floor(100 * Math.pow(user.level + 1, 1.5));

  const rank = new Rank()
    .setAvatar(message.author.displayAvatarURL({ forceStatic: true }))
    .setCurrentXP(user.xp)
    .setRequiredXP(neededXp)
    .setLevel(user.level)
    .setUsername(message.author.username)
    .setDiscriminator(message.author.discriminator || "0000")
    .setProgressBar("#5865F2", "COLOR")
    .setBackground("COLOR", "#0f172a");

  const data = await rank.build();

  return message.reply({
    files: [{ attachment: data, name: "rank.png" }]
  });
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
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply("❌ You lack permission to ban.");
  }

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user to ban.");
  if (!member.bannable) return message.reply("❌ I cannot ban this user.");

  await member.ban({ reason: `Banned by ${message.author.tag}` });
  return message.channel.send(`🔨 Banned **${member.user.tag}**`);
}

// KICK
if (command === "kick") {
  if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return message.reply("❌ You lack permission to kick.");
  }

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user to kick.");
  if (!member.kickable) return message.reply("❌ I cannot kick this user.");

  await member.kick(`Kicked by ${message.author.tag}`);
  return message.channel.send(`👢 Kicked **${member.user.tag}**`);
}

// TIMEOUT (smart duration)
if (command === "timeout") {
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply("❌ You lack permission to timeout.");
  }

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user.");

  const timeArg = args[1];
  if (!timeArg) return message.reply("❌ Provide duration (e.g. 10m, 1h, 1d).");

  // ===== PARSE TIME =====
  const timeRegex = /^(\d+)(s|m|h|d)$/;
  const match = timeArg.match(timeRegex);

  if (!match) {
    return message.reply("❌ Invalid time format. Use 10m, 1h, 1d, etc.");
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  let duration;

  switch (unit) {
    case "s":
      duration = value * 1000;
      break;
    case "m":
      duration = value * 60 * 1000;
      break;
    case "h":
      duration = value * 60 * 60 * 1000;
      break;
    case "d":
      duration = value * 24 * 60 * 60 * 1000;
      break;
  }

  // Discord max timeout = 28 days
  const max = 28 * 24 * 60 * 60 * 1000;
  if (duration > max) {
    return message.reply("❌ Timeout cannot exceed 28 days.");
  }

  await member.timeout(duration);

  return message.channel.send(
    `⏳ Timed out **${member.user.tag}** for **${timeArg}**`
  );
}

// ===== END MODERATION =====
});
client.login(process.env.TOKEN);
