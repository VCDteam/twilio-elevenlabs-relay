const WebSocket = require("ws");
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Relay server is up.");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  console.log("🔌 Twilio stream connected");

  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);
    console.log("📨 Message received:", msg.event);

    if (msg.event === "start") {
      console.log("✅ Stream started from Twilio");
      // Connect to ElevenLabs here (optional for now)
    }

    if (msg.event === "media") {
      const audioData = msg.media.payload;
      // Forward audio to ElevenLabs here
    }

    if (msg.event === "stop") {
      console.log("❌ Stream stopped");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Relay server running on port ${PORT}`);
});

