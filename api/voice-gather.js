/**
 * Twilio Voice Gather Handler — Vercel Serverless
 * Receives DTMF digits from Twilio Gather after caller speaks
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BASE_URL = 'https://clawcall-vercel-9gnjpftfx-seth-s-projects21.vercel.app';

function getTransferMessage() {
  return "Let me connect you with Seth now. Please hold for just a moment.";
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');

  try {
    const from = req.body?.From || 'unknown';
    const digits = req.body?.Digits || '';
    const callerIntent = req.body?.SpeechResult || '';

    console.log(`[voice-gather] From ${from} | digits: ${digits} | speech: ${callerIntent}`);

    const twiml = new VoiceResponse();

    if (callerIntent || digits) {
      // Caller wants to be connected to Seth
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, getTransferMessage());

      // Small pause then dial Seth
      twiml.pause({ length: 1 });

      const dial = twiml.dial({
        callerId: '+13853308222',
        timeout: 30,
      });

      dial.number('+18014204625');
    } else {
      // No input — try again
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, "I didn't quite catch that. Could you please repeat what you need help with?");

      twiml.gather({
        numDigits: 1,
        timeout: 30,
        method: 'POST',
        action: `${BASE_URL}/api/voice-gather.js?x-vercel-protection-bypass=514ad9f082ef37caac3e0f835da30d0e`,
      });
    }

    res.status(200).send(twiml.toString());

  } catch (err) {
    console.error('[voice-gather] Error:', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};