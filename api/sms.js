/**
 * Twilio SMS Webhook Handler — Vercel Serverless
 * Receives inbound SMS to +13853308222
 */

module.exports = async function handler(req, res) {
  try {
    const from = req.body?.From || 'unknown';
    const to = req.body?.To || 'unknown';
    const body = req.body?.Body || '';

    console.log(`[sms] From ${from} to ${to}: ${body}`);

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`
      <Response>
        <Message>Hi, this is Clawdius, Seth's digital assistant. I've received your message and will pass it along to Seth. Is there something specific I can help you with? You can also call +13853308222 to reach Seth directly.</Message>
      </Response>
    `);
  } catch (err) {
    console.error('[sms] Error:', err);
    res.status(500).send('<Response><Message>Sorry, something went wrong.</Message></Response>');
  }
};