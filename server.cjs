const WebSocket = require("ws");
const express = require("express");
const http = require("http");

// 🔐 Hardcoded credentials (you can switch to env vars later)
const ELEVEN_API_KEY = 'sk_37811e1fc04d5f38b01e1d77e10ed624977c67839fac4814';
const AGENT_ID = 'agent_01jzvw8mpffffb0bbf2gsqnfps';

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Relay server is running.");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(twilioSocket) {
  console.log("🔌 Twilio stream connected");

  const elevenSocket = new WebSocket(
    `wss://api.elevenlabs.io/v1/conversational/agents/${AGENT_ID}/stream-input`,
    {
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
      },
    }
  );

  elevenSocket.on("error", (err) => {
    console.error("❌ ElevenLabs error:", err.message);
  });

  twilioSocket.on("message", function incoming(message) {
    const msg = JSON.parse(message);

    if (msg.event === "start") {
      console.log("✅ Twilio stream started");
    }

    if (msg.event === "media") {
      if (elevenSocket.readyState === WebSocket.OPEN) {
        elevenSocket.send(JSON.stringify({ audio: msg.media.payload }));
      }
    }

    if (msg.event === "stop") {
      console.log("❌ Twilio stream stopped");
      elevenSocket.close();
    }
  });

  elevenSocket.on("message", function incoming(data) {
    if (twilioSocket.readyState === WebSocket.OPEN) {
      twilioSocket.send(data);
    }
  });

  elevenSocket.on("close", () => {
    console.log("🔕 ElevenLabs socket closed");
    if (twilioSocket.readyState === WebSocket.OPEN) twilioSocket.close();
  });

  twilioSocket.on("close", () => {
    console.log("🔌 Twilio socket closed");
    if (elevenSocket.readyState === WebSocket.OPEN) elevenSocket.close();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Relay server running on port ${PORT}`);
});
