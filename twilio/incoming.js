/**
 * Twilio Voice Webhook Handler
 * Clawdius answers, helps callers directly, transfers to Seth only if needed.
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://clawcall-vercel2.vercel.app';

function getGreeting() {
  const h = new Date().getHours();
  return (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') +
    ". This is Clawdius, Seth's digital assistant. How can I help you today?";
}

// Keywords that indicate the caller wants to speak with a human or Seth specifically
const ESCALATION_KEYWORDS = [
  'speak with seth', 'talk to seth', 'call seth', 'get seth',
  'speak to a human', 'talk to a human', 'real person', 'actual person',
  'person', 'human', 'live person', 'someone real',
  'transfer', 'transfer me', 'connect me', 'let me speak to',
];

function wantsEscalation(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return ESCALATION_KEYWORDS.some(kw => lower.includes(kw));
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice', language: 'en-US' }, getGreeting());
    
    // After greeting, send caller input to Clawdius for processing
    twiml.gather({
      timeout: 30,
      method: 'POST',
      action: `${BASE}/twilio/process`,
    });

    res.status(200).send(twiml.toString());
  } catch (err) {
    console.error('[twilio/incoming]', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};