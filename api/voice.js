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

const BASE_URL = 'https://clawcall-vercel-9gnjpftfx-seth-s-projects21.vercel.app';

function getGreeting() {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${timeGreeting}. This is Clawdius, Seth's digital assistant. How can I help you today?`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');

  try {
    const from = req.body?.From || 'unknown';
    const to = req.body?.To || 'unknown';
    const callerIntent = req.body?.TranscriptionText || req.body?.SpeechResult || '';
    const digits = req.body?.Digits;

    console.log(`[voice] Call from ${from} | intent: "${callerIntent}" | digits: ${digits}`);

    const twiml = new VoiceResponse();

    // Clawdius greets the caller
    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, getGreeting());

    // Gather caller response — use absolute URL since Next.js overrides /api/*
    twiml.gather({
      numDigits: 1,
      timeout: 30,
      method: 'POST',
      action: `${BASE_URL}/api/voice-gather.js?x-vercel-protection-bypass=514ad9f082ef37caac3e0f835da30d0e`,
    });

    res.status(200).send(twiml.toString());

  } catch (err) {
    console.error('[voice] Error:', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};