require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { processDispatch } = require('./lib/dispatchEngine');
const { handleSMSAcknowledgment, handleCallAcknowledgment, handleLinkAcknowledgment } = require('./lib/acknowledgmentHandler');
const { markAcknowledged, getActiveRetryCount, recoverLostRetries } = require('./lib/retryScheduler');
const { initializeTableFields, getPendingDispatches, updateDispatchEventByMessageSid, TABLES } = require('./lib/airtable');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Count active retry sequences
    const activeRetries = getActiveRetryCount();
    
    // Count pending dispatches (Status = DISPATCHING)
    const pendingDispatches = await getPendingDispatches();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Afterhours Dispatch Loop',
      version: '2.0.0',
      metrics: {
        activeRetries: activeRetries,
        pendingDispatches: pendingDispatches,
      },
    });
  } catch (error) {
    // Health check should never fail - return basic status
    console.error('[Health] Error getting health metrics:', error.message);
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Afterhours Dispatch Loop',
      version: '2.0.0',
      metrics: {
        activeRetries: 0,
        pendingDispatches: 0,
        error: 'Failed to fetch metrics',
      },
    });
  }
});

/**
 * Retell call-ended webhook
 * Primary trigger for dispatch
 */
app.post('/webhooks/retell/call-ended', async (req, res) => {
  console.log('[Webhook] ========== RETELL CALL-ENDED ==========');
  console.log('[Webhook] Request body keys:', Object.keys(req.body || {}));
  
  // Return 200 immediately (don't block webhook)
  res.sendStatus(200);
  
  // Process dispatch asynchronously
  (async () => {
    try {
      const result = await processDispatch(req.body);
      console.log('[Webhook] Dispatch result:', result);
    } catch (error) {
      console.error('[Webhook] Dispatch error:', error);
    }
  })();
});

/**
 * Twilio status callback webhook
 * Fallback trigger when call ends and recording/transcript is available
 */
app.post('/webhooks/twilio/status-callback', async (req, res) => {
  console.log('[Webhook] ========== TWILIO STATUS CALLBACK ==========');
  
  // Only process if call is completed
  if (req.body.CallStatus === 'completed') {
    res.sendStatus(200);
    
    (async () => {
      try {
        const result = await processDispatch(req.body);
        console.log('[Webhook] Dispatch result:', result);
      } catch (error) {
        console.error('[Webhook] Dispatch error:', error);
      }
    })();
  } else {
    res.sendStatus(200);
  }
});

/**
 * Manual dispatch trigger
 * Dashboard button "Dispatch Now" on a Call record
 */
app.post('/api/dispatch/manual', async (req, res) => {
  console.log('[API] ========== MANUAL DISPATCH ==========');
  
  try {
    const { callId, callData } = req.body;
    
    if (!callData) {
      return res.status(400).json({ error: 'callData is required' });
    }
    
    const result = await processDispatch(callData);
    
    res.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error('[API] Manual dispatch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Twilio SMS status callback webhook
 * Receives delivery status updates for SMS messages
 */
app.post('/webhooks/twilio/sms-status', async (req, res) => {
  const messageSid = req.body.MessageSid;
  const status = req.body.MessageStatus; // queued, sent, delivered, failed, undelivered
  const errorCode = req.body.ErrorCode;
  
  console.log('[Webhook] ========== SMS STATUS CALLBACK ==========');
  console.log('[Webhook] Message SID:', messageSid);
  console.log('[Webhook] Status:', status);
  console.log('[Webhook] Error Code:', errorCode);
  
  // Return 200 immediately (don't block webhook)
  res.sendStatus(200);
  
  // Process status update asynchronously
  (async () => {
    try {
      // Find Dispatch Event by messageSid and update delivery status
      if (messageSid && status) {
        await updateDispatchEventByMessageSid(messageSid, status.toUpperCase(), errorCode);
        
        // If delivery failed, log for alerting (future enhancement)
        if (status === 'failed' || status === 'undelivered') {
          console.warn(`[Webhook] SMS delivery failed for message ${messageSid}, error code: ${errorCode}`);
          // TODO: Trigger retry or alert (future enhancement)
        }
      }
    } catch (error) {
      console.error('[Webhook] SMS status callback error:', error);
    }
  })();
});

/**
 * SMS acknowledgment handler
 * Receives SMS replies with ACK keywords
 */
app.post('/webhooks/twilio/sms', async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body?.trim() || '';
  const callSid = req.body.CallSid; // If this SMS is related to a call
  
  console.log('[Webhook] ========== SMS RECEIVED ==========');
  console.log('[Webhook] From:', from);
  console.log('[Webhook] Body:', body);
  console.warn('[Webhook] SMS acknowledgment disabled: no call mapping in place');
  
  // Check if this is an acknowledgment
  // In production, would look up callId from contact phone number
  // For now, this is a placeholder
  
  // TODO: Look up callId from contact phone and pending dispatches
  // const callId = await findCallIdByContactPhone(from);
  // if (callId) {
  //   const result = await handleSMSAcknowledgment(callId, contactId, body);
  //   if (result.acknowledged) {
  //     markAcknowledged(callId);
  //   }
  // }
  
  res.send('<Response></Response>');
});

/**
 * Call acknowledgment handler (IVR)
 * Handles "Press 1 to accept" calls
 */
app.post('/webhooks/twilio/ack-call', async (req, res) => {
  const callSid = req.body.CallSid;
  const digits = req.body.Digits;
  const callId = req.query.callId;
  
  console.log('[Webhook] ========== ACK CALL ==========');
  console.log('[Webhook] Call SID:', callSid);
  console.log('[Webhook] Digits:', digits);
  console.log('[Webhook] Call ID:', callId);
  
  const twiml = new twilio.twiml.VoiceResponse();
  
  if (digits === '1' && callId) {
    // Acknowledged
    const contactId = req.query.contactId; // Would be passed in URL
    const result = await handleCallAcknowledgment(callId, contactId);
    
    if (result.acknowledged) {
      markAcknowledged(callId);
      twiml.say('Thank you. You have accepted the dispatch. Please contact the customer.');
    } else {
      twiml.say('There was an error processing your acknowledgment. Please contact dispatch.');
    }
  } else {
    // Prompt for acknowledgment
    const gather = twiml.gather({
      numDigits: 1,
      timeout: 10,
      action: `/webhooks/twilio/ack-call?callId=${callId}`,
    });
    gather.say('You have a new after-hours dispatch. Press 1 to accept, or hang up to decline.');
    
    twiml.say('We did not receive your response. Goodbye.');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Link acknowledgment handler
 * Secure link click acknowledgment
 */
app.get('/api/ack/:callId/:token', async (req, res) => {
  const { callId, token } = req.params;
  
  console.log('[API] ========== LINK ACK ==========');
  console.log('[API] Call ID:', callId);
  const maskedToken = token ? `${token.slice(0, 4)}...${token.slice(-4)}` : 'none';
  console.log('[API] Token:', maskedToken);
  
  // TODO: Validate token
  // TODO: Look up contactId from token
  
  res.status(410).send('Link acknowledgment disabled until token validation is implemented.');
});

/**
 * Get dispatch status
 */
app.get('/api/dispatch/status/:callId', async (req, res) => {
  const { callId } = req.params;
  
  try {
    // TODO: Query Airtable for call status
    res.json({
      callId: callId,
      status: 'UNKNOWN',
      message: 'Status lookup not yet implemented',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

// Initialize Airtable field caches on startup
(async () => {
  try {
    await initializeTableFields();
  } catch (error) {
    console.error('[Startup] Failed to initialize Airtable field caches:', error.message);
    console.error('[Startup] Continuing anyway - fields will be detected on first use');
  }
  
  // Log Airtable configuration
  const baseId = process.env.AIRTABLE_BASE_ID || 'appMJsHP71wkLODeW';
  const maskedBaseId = baseId.length > 8 
    ? `${baseId.substring(0, 4)}...${baseId.substring(baseId.length - 4)}`
    : baseId;
    console.log(
      `[Startup] Airtable base: ${maskedBaseId} | Tables: ` +
      `Businesses="${process.env.AIRTABLE_TABLE_BUSINESSES || 'Businesses'}", ` +
      `Calls="${process.env.AIRTABLE_TABLE_CALLS || 'Calls'}", ` +
      `Dispatch Events="${process.env.AIRTABLE_TABLE_DISPATCH_EVENTS || 'Dispatch Events'}", ` +
      `On-Call Roster="${process.env.AIRTABLE_TABLE_ONCALL || 'On-Call Roster'}"`
    );
      
  // Recover lost retry sequences on startup
  try {
    await recoverLostRetries();
  } catch (error) {
    console.error('[Startup] Failed to recover lost retry sequences:', error.message);
    console.error('[Startup] Continuing anyway - recovery can be run manually');
  }
  
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Afterhours Dispatch Loop`);
    console.log(`Version: 2.0.0`);
    console.log(`Listening on port ${PORT}`);
    console.log(`========================================`);
    console.log(`Webhooks:`);
    console.log(`  POST /webhooks/retell/call-ended`);
    console.log(`  POST /webhooks/twilio/status-callback`);
    console.log(`  POST /webhooks/twilio/sms-status`);
    console.log(`  POST /webhooks/twilio/sms`);
    console.log(`  POST /webhooks/twilio/ack-call`);
    console.log(`API:`);
    console.log(`  POST /api/dispatch/manual`);
    console.log(`  GET  /api/dispatch/status/:callId`);
    console.log(`  GET  /api/ack/:callId/:token`);
    console.log(`Health:`);
    console.log(`  GET  /health`);
    console.log(`========================================`);
  });
})();
