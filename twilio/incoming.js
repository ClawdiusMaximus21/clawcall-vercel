/**
 * Twilio Voice Webhook Handler
 * Receives incoming calls to +13853308222
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BYPASS = '514ad9f082ef37caac3e0f835da30d0e';
const BASE = 'https://clawcall-vercel-9gnjpftfx-seth-s-projects21.vercel.app';

function getGreeting() {
  const h = new Date().getHours();
  return (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') +
    ". This is Clawdius, Seth's digital assistant. How can I help you today?";
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice', language: 'en-US' }, getGreeting());
    twiml.gather({
      numDigits: 1,
      timeout: 30,
      method: 'POST',
      action: `${BASE}/twilio/gather?x-vercel-protection-bypass=${BYPASS}`,
    });
    res.status(200).send(twiml.toString());
  } catch (err) {
    console.error('[twilio/incoming]', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};