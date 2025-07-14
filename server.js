const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (twilio) => {
  console.log('🔗 Twilio connected');

  const eleven = new WebSocket(`wss://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream-input`, {
    headers: { 'xi-api-key': ELEVEN_API_KEY }
  });

  twilio.on('message', (data) => {
    if (eleven.readyState === WebSocket.OPEN) eleven.send(data);
  });

  eleven.on('message', (data) => {
    if (twilio.readyState === WebSocket.OPEN) twilio.send(data);
  });

  twilio.on('close', () => eleven.close());
  eleven.on('close', () => twilio.close());
});

server.listen(3000, () => {
  console.log('✅ WebSocket server running on port 3000');
});
