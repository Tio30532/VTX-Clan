// index.js
const express = require("express");
const { Client, GatewayIntentBits, ChannelType } = require("discord.js");
const axios = require("axios");

const app = express();
const PORT = 3000;

// --- Your bot setup ---
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = "MTM2ODY1NDU2ODg5MTYxMzMxNQ.GoJ5cJ.-6-wYgnYiW-lI_KW8ORV4OE9mWgG0oACxbNTqM";
const CHANNEL_ID = "1368651717763268668"; // the channel to send messages in
const CLIENT_ID = "1368654568891613315";
const CLIENT_SECRET = "xtI5-qmeu9yC3CgbQhffnCSOiwcQ0DAG";
const REDIRECT_URI = "http://localhost:6969/callback"; // match what’s in your dev portal

// --- OAuth2 Callback ---
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send("No code provided.");

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: "identify",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Get user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;

    // Send message to channel
    const channel = await bot.channels.fetch(CHANNEL_ID);
    if (channel && channel.type === ChannelType.GuildText) {
      await channel.send(`✅ **${user.username}#${user.discriminator}** just authorized!`);
    }

    res.send("✅ You have successfully authorized. You can close this page.");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Authorization failed.");
  }
});

// Start server
app.listen(PORT, () => console.log(`OAuth2 server running at http://localhost:${PORT}`));

// Login bot
bot.login(TOKEN);
