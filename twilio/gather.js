/**
 * Twilio Voice Gather Handler
 * Redirects to /twilio/process for speech recognition routing.
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://clawcall-vercel2.vercel.app';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const twiml = new VoiceResponse();
    twiml.redirect({ method: 'POST' }, `${BASE}/twilio/process`);
    res.status(200).send(twiml.toString());
  } catch (err) {
    console.error('[gather]', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};