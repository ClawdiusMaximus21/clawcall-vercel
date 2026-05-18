/**
 * Twilio Voice Gather Handler
 * Receives DTMF digits from caller after initial greeting
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BYPASS = '514ad9f082ef37caac3e0f835da30d0e';
const BASE = 'https://clawcall-vercel-9gnjpftfx-seth-s-projects21.vercel.app';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const digits = req.body?.Digits || '';
    const speech = req.body?.SpeechResult || '';
    const from = req.body?.From || 'unknown';

    console.log(`[gather] From ${from} | digits: ${digits} | speech: ${speech}`);

    const twiml = new VoiceResponse();

    // Caller spoke or pressed a digit — connect them to Seth
    twiml.say({ voice: 'alice', language: 'en-US' },
      "Let me connect you with Seth now. Please hold for just a moment.");
    twiml.pause({ length: 1 });

    const dial = twiml.dial({
      callerId: '+13853308222',
      timeout: 30,
    });
    dial.number('+18014204625');

    res.status(200).send(twiml.toString());
  } catch (err) {
    console.error('[gather]', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};