const { updateCallStatus, createDispatchEvent } = require('./airtable');
const { isAcknowledgment } = require('./dispatchService');

/**
 * Handle acknowledgment from SMS reply
 */
async function handleSMSAcknowledgment(callId, contactId, message) {
  if (!isAcknowledgment(message)) {
    return { acknowledged: false, reason: 'Message is not an acknowledgment' };
  }
  
  try {
    // Update call status
    await updateCallStatus(callId, 'DISPATCHED_CONFIRMED', contactId);
    
    // Log acknowledgment event
    await createDispatchEvent({
      callId: callId,
      contactId: contactId,
      method: 'SMS',
      acknowledged: true,
      result: 'ACKNOWLEDGED',
    });
    
    return {
      acknowledged: true,
      callId: callId,
      status: 'DISPATCHED_CONFIRMED',
    };
  } catch (error) {
    console.error('[AcknowledgmentHandler] Error handling SMS acknowledgment:', error);
    return {
      acknowledged: false,
      error: error.message,
    };
  }
}

/**
 * Handle acknowledgment from call IVR (press 1)
 */
async function handleCallAcknowledgment(callId, contactId) {
  try {
    // Update call status
    await updateCallStatus(callId, 'DISPATCHED_CONFIRMED', contactId);
    
    // Log acknowledgment event
    await createDispatchEvent({
      callId: callId,
      contactId: contactId,
      method: 'CALL',
      acknowledged: true,
      result: 'ACKNOWLEDGED',
    });
    
    return {
      acknowledged: true,
      callId: callId,
      status: 'DISPATCHED_CONFIRMED',
    };
  } catch (error) {
    console.error('[AcknowledgmentHandler] Error handling call acknowledgment:', error);
    return {
      acknowledged: false,
      error: error.message,
    };
  }
}

/**
 * Handle acknowledgment from secure link click
 */
async function handleLinkAcknowledgment(callId, contactId) {
  try {
    // Update call status
    await updateCallStatus(callId, 'DISPATCHED_CONFIRMED', contactId);
    
    // Log acknowledgment event
    await createDispatchEvent({
      callId: callId,
      contactId: contactId,
      method: 'LINK',
      acknowledged: true,
      result: 'ACKNOWLEDGED',
    });
    
    return {
      acknowledged: true,
      callId: callId,
      status: 'DISPATCHED_CONFIRMED',
    };
  } catch (error) {
    console.error('[AcknowledgmentHandler] Error handling link acknowledgment:', error);
    return {
      acknowledged: false,
      error: error.message,
    };
  }
}

/**
 * Send confirmation to caller (if business enables it)
 */
async function sendCallerConfirmation(callData, businessConfig) {
  // TODO: Implement if business has caller confirmation enabled
  // Would send SMS/email to caller saying "Tech is on it - you'll get a call shortly"
  console.log('[AcknowledgmentHandler] Caller confirmation (placeholder):', {
    callerPhone: callData.callerPhone,
    enabled: businessConfig?.sendCallerConfirmation || false,
  });
}

module.exports = {
  handleSMSAcknowledgment,
  handleCallAcknowledgment,
  handleLinkAcknowledgment,
  sendCallerConfirmation,
};
