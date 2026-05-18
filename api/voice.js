/**
 * Twilio Voice Webhook Handler — Vercel Serverless
 * Receives incoming calls to +13853308222
 * 
 * Clawdius answers, attempts to handle the request, 
 * escalates to Seth only if needed.
 * 
 * Flow: Twilio → POST /api/voice → Clawdius handles → escalation if required
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const STATUS_CALLBACK_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/call-status`
  : null;

// Map of common intents Clawdius can handle directly
const HANDLABLE_ISSUES = [
  'appointment', 'schedule', 'booking', 'meeting',
  'hours', 'open', 'closed', 'location', 'address', 'directions',
  'confirm', 'confirmation', 'reschedule', 'cancel',
  'message', 'leave a message', 'take a message',
  'call back', 'returning', 'follow up',
  'information', 'info', 'question',
  ' document', 'paperwork', 'form',
  'claim', 'claimant', 'reca', 'uranium', 'downwind',
  'compensation', 'benefits', 'payment',
];

function canHandle(utterance) {
  if (!utterance) return false;
  const lower = utterance.toLowerCase();
  return HANDLABLE_ISSUES.some(word => lower.includes(word));
}

function getGreeting() {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${timeGreeting}. This is Clawdius, Seth's digital assistant. How can I help you today?`;
}

function buildResponse(twiml, text, gatherNext = false) {
  twiml.say({ voice: 'alice', language: 'en-US' }, text);
  if (gatherNext) {
    twiml.gather({
      numDigits: 1,
      timeout: 30,
      method: 'POST',
      action: '/api/voice-gather',
    });
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');

  try {
    const from = req.body?.From || 'unknown';
    const to = req.body?.To || 'unknown';
    const callerIntent = req.body?.TranscriptionText || req.body?.SpeechResult || '';
    const digits = req.body?.Digits;

    const twiml = new VoiceResponse();

    // Initial greeting and gathering
    buildResponse(twiml, getGreeting(), true);

    console.log(`[voice] Call from ${from} | intent: "${callerIntent}" | digits: ${digits}`);

    res.status(200).send(twiml.toString());

  } catch (err) {
    console.error('[voice] Error:', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};