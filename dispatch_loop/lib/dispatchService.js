const twilio = require('twilio');
const { buildSMSMessage, buildEmailSubject, buildEmailBody } = require('./dispatchPacket');
const { createDispatchEvent, updateCallStatus } = require('./airtable');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Retry timing configuration
const RETRY_TIMINGS = {
  NORMAL: {
    T1: 2 * 60 * 1000,  // 2 minutes
    T2: 5 * 60 * 1000,  // 5 minutes
    T3: 8 * 60 * 1000,  // 8 minutes
    T4: 11 * 60 * 1000, // 11 minutes
    T5: 14 * 60 * 1000, // 14 minutes
    CUTOFF: 20 * 60 * 1000, // 20 minutes
    MAX_ATTEMPTS: 6,
  },
  HIGH_URGENCY: {
    T1: 1 * 60 * 1000,  // 1 minute
    T2: 3 * 60 * 1000,  // 3 minutes
    T3: 5 * 60 * 1000,  // 5 minutes
    T4: 7 * 60 * 1000,  // 7 minutes
    T5: 9 * 60 * 1000,  // 9 minutes
    CUTOFF: 12 * 60 * 1000, // 12 minutes
    MAX_ATTEMPTS: 6,
  },
};

// ACK keywords
const ACK_KEYWORDS = ['Y', 'YES', 'ON IT', 'TAKING', 'CLAIM', 'ACCEPT', 'OK', 'GOT IT'];

/**
 * Send SMS dispatch
 */
async function sendSMS(to, message, callId, attemptNumber = 1) {
  try {
    if (!twilioPhone) {
      throw new Error('TWILIO_PHONE_NUMBER not configured');
    }
    
    const msg = await client.messages.create({
      from: twilioPhone,
      to: to,
      body: message,
    });
    
    // Log dispatch event (non-blocking, never throws)
    try {
      await createDispatchEvent({
        callId: callId,
        method: 'SMS',
        sentAt: new Date().toISOString(),
        deliveryStatus: msg.status || 'SENT',
        attemptNumber: attemptNumber,
        result: `SMS sent: ${msg.sid}`,
        messageSid: msg.sid, // Store for status callback lookup
      });
    } catch (eventError) {
      // Dispatch event logging failure should not abort SMS send
      console.warn('[DispatchService] Failed to log dispatch event (non-fatal):', eventError.message);
    }
    
    return {
      success: true,
      sid: msg.sid,
      status: msg.status,
      attempted: true,
    };
  } catch (error) {
    // Detect A2P 30034 error (error.code === 30034 OR error.message contains "30034")
    const isA2PBlocked = error.code === 30034 || 
                         (error.message && String(error.message).includes('30034'));
    
    if (isA2PBlocked) {
      console.log('[DispatchService] SMS blocked by A2P (30034) — no email fallback available');
    } else {
      console.error(`[DispatchService] SMS send failed (attempt ${attemptNumber}):`, error);
    }
    
    // Log dispatch event with error (non-blocking, never throws)
    try {
      await createDispatchEvent({
        callId: callId,
        method: 'SMS',
        sentAt: new Date().toISOString(),
        deliveryStatus: 'FAILED',
        attemptNumber: attemptNumber,
        result: isA2PBlocked ? 'BLOCKED_A2P_30034' : 'FAILED',
        error: error.message,
      });
    } catch (eventError) {
      // Dispatch event logging failure should not affect error return
      console.warn('[DispatchService] Failed to log dispatch event (non-fatal):', eventError.message);
    }
    
    return {
      success: false,
      error: error.message,
      errorCode: isA2PBlocked ? 30034 : undefined,
      attempted: true,
    };
  }
}

/**
 * Send voice call dispatch
 */
async function sendVoiceCall(to, callId, attemptNumber = 1) {
  try {
    if (!twilioPhone) {
      throw new Error('TWILIO_PHONE_NUMBER not configured');
    }
    
    // Create a TwiML URL that prompts for acknowledgment
    // In production, this would be a webhook URL
    const twimlUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/webhooks/twilio/ack-call?callId=${callId}`;
    
    const call = await client.calls.create({
      from: twilioPhone,
      to: to,
      url: twimlUrl,
      method: 'POST',
    });
    
    // Log dispatch event (non-blocking, never throws)
    try {
      await createDispatchEvent({
        callId: callId,
        method: 'CALL',
        sentAt: new Date().toISOString(),
        deliveryStatus: call.status || 'INITIATED',
        attemptNumber: attemptNumber,
        result: `Call initiated: ${call.sid}`,
      });
    } catch (eventError) {
      console.warn('[DispatchService] Failed to log dispatch event (non-fatal):', eventError.message);
    }
    
    return {
      success: true,
      sid: call.sid,
      status: call.status,
    };
  } catch (error) {
    console.error(`[DispatchService] Voice call failed (attempt ${attemptNumber}):`, error);
    
    // Log dispatch event with error (non-blocking, never throws)
    try {
      await createDispatchEvent({
        callId: callId,
        method: 'CALL',
        sentAt: new Date().toISOString(),
        deliveryStatus: 'FAILED',
        attemptNumber: attemptNumber,
        result: 'FAILED',
        error: error.message,
      });
    } catch (eventError) {
      console.warn('[DispatchService] Failed to log dispatch event (non-fatal):', eventError.message);
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send email dispatch (placeholder - would need email service)
 */
async function sendEmail(to, subject, body, callId, attemptNumber = 1) {
  const disabledReason = 'Email dispatch disabled (not implemented)';

  console.warn('[DispatchService] Email dispatch blocked:', {
    to,
    callId,
    reason: disabledReason,
  });

  // Log dispatch event (non-blocking, never throws)
  try {
    await createDispatchEvent({
      callId: callId,
      method: 'EMAIL',
      sentAt: new Date().toISOString(),
      deliveryStatus: 'DISABLED',
      attemptNumber: attemptNumber,
      result: 'EMAIL_DISABLED',
      error: disabledReason,
    });
  } catch (eventError) {
    console.warn('[DispatchService] Failed to log dispatch event (non-fatal):', eventError.message);
  }

  return {
    success: false,
    attempted: false,
    error: disabledReason,
  };
}

/**
 * Check if message is an acknowledgment
 */
function isAcknowledgment(message) {
  if (!message) return false;
  const upper = message.trim().toUpperCase();
  return ACK_KEYWORDS.some(keyword => upper.includes(keyword));
}

/**
 * Dispatch with retry logic
 * Errors must NOT bubble up to DispatchEngine - always return success/failure object
 * Returns structured channel results (SMS and email)
 */
async function dispatchWithRetry(callData, onCallContact, callRecordId, urgency = 'MEDIUM') {
  try {
    const timings = urgency === 'HIGH' ? RETRY_TIMINGS.HIGH_URGENCY : RETRY_TIMINGS.NORMAL;
    const startTime = Date.now();
    let attemptNumber = 1;
    let acknowledged = false;
    
    const smsMessage = buildSMSMessage(callData, callRecordId);
    
    // Attempt 1: SMS to Primary
    console.log(`[DispatchService] Attempt ${attemptNumber}: SMS to ${onCallContact.name} (${onCallContact.phone})`);
    const smsResult = await sendSMS(onCallContact.phone, smsMessage, callRecordId, attemptNumber);
    
    // Build structured SMS result
    const smsChannelResult = {
      attempted: smsResult.attempted || false,
      success: smsResult.success || false,
      errorCode: smsResult.errorCode,
      error: smsResult.error,
      sid: smsResult.sid,
      status: smsResult.status,
    };
    
    if (smsResult.success) {
      // Wait for ACK or timeout
      // In production, this would be handled by webhook callbacks
      // For now, we'll set up retry timers
      try {
        await updateCallStatus(callRecordId, 'DISPATCHING');
      } catch (statusError) {
        // Status update failure should not abort dispatch
        console.warn('[DispatchService] Failed to update call status (non-fatal):', statusError.message);
      }
    }
    
    // Set up retry sequence (would be handled by scheduled jobs or timers in production)
    // This is a simplified version - in production, use a job queue (Bull, Agenda, etc.)
    
    return {
      success: smsResult.success,
      acknowledged: false, // Would be updated by acknowledgment handler
      attemptNumber: attemptNumber,
      nextRetryAt: Date.now() + timings.T1,
      channels: {
        sms: smsChannelResult,
        email: null, // Will be set by dispatchEngine if email is sent
      },
    };
  } catch (error) {
    // DispatchService errors must NOT bubble up to DispatchEngine
    console.error('[DispatchService] Error in dispatchWithRetry (non-fatal):', error.message);
    // Return failure object instead of throwing
    return {
      success: false,
      acknowledged: false,
      attemptNumber: 1,
      nextRetryAt: null,
      error: error.message,
      channels: {
        sms: { attempted: false, success: false, error: error.message },
        email: null,
      },
    };
  }
}

module.exports = {
  sendSMS,
  sendVoiceCall,
  sendEmail,
  isAcknowledgment,
  dispatchWithRetry,
  RETRY_TIMINGS,
  ACK_KEYWORDS,
};
