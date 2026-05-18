/**
 * Twilio Call Status Callback Handler
 */

module.exports = async function handler(req, res) {
  try {
    const callSid = req.body?.CallSid;
    const callStatus = req.body?.CallStatus;
    const callDuration = req.body?.CallDuration;

    console.log(`[call-status] ${callSid} | status: ${callStatus} | duration: ${callDuration}s`);

    // Log for now — could notify Seth on call completion
    if (callStatus === 'completed') {
      console.log(`[call-status] Call completed successfully. Duration: ${callDuration}s`);
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('[call-status] Error:', err);
    res.status(500).send('error');
  }
};