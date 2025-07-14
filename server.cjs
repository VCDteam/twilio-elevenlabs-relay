const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const AGENT_ID = process.env.ELEVEN_AGENT_ID;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (twilioSocket) => {
  console.log('🔗 Twilio connected');

  const elevenSocket = new WebSocket(
    `wss://api.elevenlabs.io/v1/conversational/agents/${AGENT_ID}/stream-input`,
    {
      headers: {
        'xi-api-key': ELEVEN_API_KEY
      }
    }
  );

  // Pipe audio from Twilio → ElevenLabs
  twilioSocket.on('message', (data) => {
    if (elevenSocket.readyState === WebSocket.OPEN) {
      elevenSocket.send(data);
    }
  });

  // Pipe audio back from ElevenLabs → Twilio
  elevenSocket.on('message', (data) => {
    if (twilioSocket.readyState === WebSocket.OPEN) {
      twilioSocket.send(data);
    }
  });

  // Handle cleanup
  twilioSocket.on('close', () => elevenSocket.close());
  elevenSocket.on('close', () => twilioSocket.close());
});

server.listen(3000, () => {
  console.log('✅ Relay server running on port 3000');
});
