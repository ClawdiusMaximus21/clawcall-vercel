/**
 * Twilio Voice Gather Handler
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const from = req.body?.From || 'unknown';
    console.log(`[gather] From ${from}`);

    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice', language: 'en-US' },
      "Let me connect you with Seth. Please hold for a moment.");
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