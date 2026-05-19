/**
 * Twilio Voice Collect Handler
 * After initial categorization, collects specific info from caller.
 * Then takes a message and hangs up with a confirmation.
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://clawcall-vercel2.vercel.app';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const callerText = req.body?.SpeechResult || '';
    const from = req.body?.From || 'unknown';

    console.log(`[collect] From ${from} | "${callerText}"`);

    const twiml = new VoiceResponse();

    // Take a message — caller has given us their info
    twiml.say({ voice: 'alice', language: 'en-US' },
      "Got it. I've noted that down and will pass it along to Seth. He'll follow up with you soon. Thanks for calling. Goodbye!");
    twiml.hangup();

    res.status(200).send(twiml.toString());

  } catch (err) {
    console.error('[collect]', err);
    res.status(500).send('<Response><Say>Sorry, something went wrong. Goodbye.</Say></Response>');
  }
};