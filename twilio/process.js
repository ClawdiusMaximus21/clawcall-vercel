/**
 * Twilio Voice Processor
 * Receives caller speech/input, determines if we can help or need to escalate.
 * 
 * Routing logic:
 * - Wants Seth / human → transfer to Seth immediately
 * - RECA / claim related → give helpful info, take a message
 * - Scheduling → give info, take a message  
 * - Other → try to help, escalate if needed
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://clawcall-vercel2.vercel.app';

// Keywords that mean caller wants Seth or a human
const HUMAN_KEYWORDS = [
  'speak to seth', 'talk to seth', 'call seth', 'seth', 'loveland',
  'speak to a human', 'talk to a human', 'real person', 'person',
  'human', 'live person', 'transfer', 'connect me', 'let me speak to',
  'i want to talk to', 'can i speak to', 'get me', 'patch me through',
];

// Keywords for RECA / downwind claims
const RECA_KEYWORDS = [
  'reca', 'uranium', 'downwind', 'down wind', 'nuclear test',
  'radiation', 'compensation', 'claim', 'claimant', '庞大山',
  'document', 'documents', 'paperwork', 'form', 'forms',
  'records', 'record', 'employment', 'dose', 'medical',
];

// Keywords for scheduling
const SCHEDULE_KEYWORDS = [
  'schedule', 'appointment', 'book', 'meeting', 'set up', 'calendar',
  'available', 'time', 'when', 'reservation',
];

function getEscalationMessage() {
  return "Of course. Let me connect you with Seth right now. Please hold for just a moment.";
}

function getRecaResponse(callerText) {
  const lower = callerText.toLowerCase();
  if (lower.includes('reca')) {
    return "I can help you with your RECA claim. What is the claimant's name and what do you need help with today?";
  }
  if (lower.includes('document') || lower.includes('record')) {
    return "For records or documents, I can help coordinate what's needed. What specific documents are you looking for?";
  }
  if (lower.includes('claim')) {
    return "I can help you file or track a RECA claim. What stage are you at with your claim? Have you filed yet?";
  }
  return "I'd be happy to help with your RECA compensation claim. Can you tell me a bit about what you need assistance with?";
}

function getScheduleResponse() {
  return "For scheduling with Seth, I can take a message and get back to you. What is your name and what time works best for you to meet?";
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  try {
    const callerText = req.body?.SpeechResult || req.body?.DtmfTone || '';
    const from = req.body?.From || 'unknown';

    console.log(`[process] From ${from} | "${callerText}"`);

    const twiml = new VoiceResponse();

    // No input — loop back to incoming
    if (!callerText) {
      twiml.say({ voice: 'alice', language: 'en-US' },
        "I didn't catch that. Could you please tell me what you need help with?");
      twiml.redirect({ method: 'POST' }, `${BASE}/twilio/incoming`);
      res.status(200).send(twiml.toString());
      return;
    }

    // Check if they want Seth or a human
    if (wantsHuman(callerText)) {
      twiml.say({ voice: 'alice', language: 'en-US' }, getEscalationMessage());
      twiml.pause({ length: 1 });
      const dial = twiml.dial({ callerId: '+13853308222', timeout: 30 });
      dial.number('+18014204625');
      res.status(200).send(twiml.toString());
      return;
    }

    // RECA-related request
    if (isRecaRelated(callerText)) {
      twiml.say({ voice: 'alice', language: 'en-US' }, getRecaResponse(callerText));
      twiml.gather({
        timeout: 30,
        method: 'POST',
        action: `${BASE}/twilio/collect`,
      });
      res.status(200).send(twiml.toString());
      return;
    }

    // Scheduling request
    if (isSchedulingRequest(callerText)) {
      twiml.say({ voice: 'alice', language: 'en-US' }, getScheduleResponse());
      twiml.gather({
        timeout: 30,
        method: 'POST',
        action: `${BASE}/twilio/collect`,
      });
      res.status(200).send(twiml.toString());
      return;
    }

    // General help — try to assist
    twiml.say({ voice: 'alice', language: 'en-US' },
      "I'm Clawdius, Seth's digital assistant. I can help you with RECA claims, scheduling, or passing along a message. What can I help you with?");
    twiml.gather({
      timeout: 30,
      method: 'POST',
      action: `${BASE}/twilio/incoming`,
    });

    res.status(200).send(twiml.toString());

  } catch (err) {
    console.error('[process]', err);
    res.status(500).send('<Response><Reject reason="server-error"/></Response>');
  }
};

function wantsHuman(text) {
  const lower = text.toLowerCase();
  return HUMAN_KEYWORDS.some(kw => lower.includes(kw));
}

function isRecaRelated(text) {
  const lower = text.toLowerCase();
  return RECA_KEYWORDS.some(kw => lower.includes(kw));
}

function isSchedulingRequest(text) {
  const lower = text.toLowerCase();
  return SCHEDULE_KEYWORDS.some(kw => lower.includes(kw));
}