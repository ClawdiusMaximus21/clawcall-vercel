/**
 * Twilio Voice Webhook Handler
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://clawcall-vercel2.vercel.app';

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
      action: `${BASE}/twilio/gather`,
    });
    res.status(200).send(twiml.toString());
  } catch (err) {
    console.error('[twilio/incoming]', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};
