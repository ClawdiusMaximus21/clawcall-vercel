/**
 * Health check endpoint for the Vercel call forwarding server.
 */

const SIP_TARGET = 'sip:102@192.168.1.77:3000';

module.exports = async function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'clawcall-vercel',
    timestamp: new Date().toISOString(),
    target: SIP_TARGET,
  });
};