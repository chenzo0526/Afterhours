/**
 * Retry Scheduler
 * Handles retry logic for dispatch attempts
 * In production, this would use a job queue (Bull, Agenda, etc.)
 * For now, this is a simplified in-memory version
 */

const { getBackupContacts } = require('./onCallSelector');
const { sendSMS, sendVoiceCall, RETRY_TIMINGS } = require('./dispatchService');
const { updateCallStatus, createDispatchEvent, findLostDispatches, getOnCallRoster, findBusinessById, FIELDS } = require('./airtable');
const { buildSMSMessage } = require('./dispatchPacket');

// In-memory retry tracking (in production, use Redis/database)
const activeRetries = new Map();

/**
 * Schedule retry sequence
 */
function scheduleRetrySequence(callId, callData, primaryContact, urgency = 'MEDIUM') {
  const timings = urgency === 'HIGH' ? RETRY_TIMINGS.HIGH_URGENCY : RETRY_TIMINGS.NORMAL;
  const startTime = Date.now();
  
  const sequence = {
    callId,
    callData,
    primaryContact,
    urgency,
    timings,
    startTime,
    attemptNumber: 1,
    acknowledged: false,
    backups: [],
  };
  
  activeRetries.set(callId, sequence);
  
  // Schedule retries (simplified - in production use job queue)
  scheduleNextRetry(sequence);
  
  return sequence;
}

/**
 * Schedule next retry attempt
 */
function scheduleNextRetry(sequence) {
  const { callId, callData, primaryContact, timings, attemptNumber } = sequence;
  
  if (sequence.acknowledged) {
    activeRetries.delete(callId);
    return;
  }
  
  const elapsed = Date.now() - sequence.startTime;
  
  if (elapsed >= timings.CUTOFF || attemptNumber >= timings.MAX_ATTEMPTS) {
    // Cutoff reached - escalate to owner
    handleCutoff(sequence);
    activeRetries.delete(callId);
    return;
  }
  
  let delay;
  let method;
  let contact = primaryContact;
  
  // Determine next retry based on attempt number and timing
  if (attemptNumber === 1) {
    delay = timings.T1;
    method = 'SMS';
  } else if (attemptNumber === 2) {
    delay = timings.T2;
    method = 'CALL';
  } else if (attemptNumber === 3) {
    delay = timings.T3;
    method = 'SMS';
    // Switch to backup
    contact = sequence.backups[0] || primaryContact;
  } else if (attemptNumber === 4) {
    delay = timings.T4;
    method = 'CALL';
    contact = sequence.backups[0] || primaryContact;
  } else if (attemptNumber === 5) {
    delay = timings.T5;
    method = 'SMS';
    contact = sequence.backups[1] || sequence.backups[0] || primaryContact;
  }
  
  // Schedule the retry
  setTimeout(async () => {
    if (!activeRetries.has(callId)) {
      return; // Already acknowledged or cancelled
    }
    
    sequence.attemptNumber = attemptNumber + 1;
    
    try {
      if (method === 'SMS') {
        const message = buildSMSMessage(callData, callId);
        await sendSMS(contact.phone, message, callId, sequence.attemptNumber);
      } else if (method === 'CALL') {
        await sendVoiceCall(contact.phone, callId, sequence.attemptNumber);
      }
      
      // Schedule next retry
      scheduleNextRetry(sequence);
    } catch (error) {
      console.error(`[RetryScheduler] Retry attempt ${sequence.attemptNumber} failed:`, error);
      // Continue with next retry
      scheduleNextRetry(sequence);
    }
  }, delay);
}

/**
 * Handle cutoff (max attempts or time exceeded)
 */
async function handleCutoff(sequence) {
  const { callId, callData } = sequence;
  
  console.log(`[RetryScheduler] Cutoff reached for call ${callId}`);
  
  // Update call status
  await updateCallStatus(callId, 'DISPATCHED_NO_ACK');
  
  // Send alert to owner
  // TODO: Implement owner alert
  
  // Log cutoff event
  await createDispatchEvent({
    callId: callId,
    method: 'CUTOFF',
    sentAt: new Date().toISOString(),
    deliveryStatus: 'CUTOFF',
    attemptNumber: sequence.attemptNumber,
    result: 'CUTOFF_REACHED',
    error: 'No acknowledgment received within cutoff time',
  });
}

/**
 * Mark acknowledgment received
 */
function markAcknowledged(callId) {
  const sequence = activeRetries.get(callId);
  if (sequence) {
    sequence.acknowledged = true;
    activeRetries.delete(callId);
    return true;
  }
  return false;
}

/**
 * Get active retry sequence
 */
function getActiveRetry(callId) {
  return activeRetries.get(callId);
}

/**
 * Get count of active retry sequences
 */
function getActiveRetryCount() {
  return activeRetries.size;
}

/**
 * Recover lost retry sequences from Airtable
 * Finds calls with Status = DISPATCHING and last event > 5 minutes ago
 * Restarts retry sequence for each lost call
 */
async function recoverLostRetries() {
  console.log('[RetryScheduler] Checking for lost retry sequences...');
  
  try {
    const lostCalls = await findLostDispatches(5); // 5 minutes ago
    
    if (lostCalls.length === 0) {
      console.log('[RetryScheduler] No lost retry sequences found');
      return;
    }
    
    console.log(`[RetryScheduler] Found ${lostCalls.length} lost retry sequence(s)`);
    
    for (const call of lostCalls) {
      const callId = call.id;
      
      // Skip if retry already active
      if (activeRetries.has(callId)) {
        console.log(`[RetryScheduler] Retry already active for call ${callId}, skipping`);
        continue;
      }
      
      console.log(`[RetryScheduler] Recovering lost retry for call: ${callId}`);
      
      try {
        // Reconstruct callData from Airtable record
        const callData = {
          callerPhone: call.get('Caller Phone') || '',
          emergencyLevel: call.get('Emergency Level') || 'MEDIUM',
          issueSummary: call.get('Issue Summary') || '',
          twilioToNumber: call.get('Twilio To Number') || '',
          callId: callId,
        };
        
        // Get business and on-call contact
        const businessId = call.get('Business');
        let primaryContact = null;
        
        if (businessId) {
          const businessIds = Array.isArray(businessId) ? businessId : [businessId];
          if (businessIds.length > 0) {
            const business = await findBusinessById(businessIds[0]);
            if (business) {
              const roster = await getOnCallRoster(businessIds[0]);
              if (roster.length > 0) {
                primaryContact = {
                  id: roster[0].id,
                  name: roster[0].get('Name') || 'Unknown',
                  phone: roster[0].get('Phone') || '',
                };
              }
            }
          }
        }
        
        if (!primaryContact || !primaryContact.phone) {
          console.warn(`[RetryScheduler] Cannot recover call ${callId}: no on-call contact found`);
          continue;
        }
        
        // Determine urgency
        const urgency = (callData.emergencyLevel || '').toUpperCase() === 'HIGH' ? 'HIGH' : 'MEDIUM';
        
        // Restart retry sequence
        scheduleRetrySequence(callId, callData, primaryContact, urgency);
        console.log(`[RetryScheduler] Retry sequence restarted for call ${callId}`);
        
      } catch (error) {
        console.error(`[RetryScheduler] Error recovering call ${callId}:`, error.message);
        // Continue with next call
      }
    }
    
    console.log(`[RetryScheduler] Recovery complete`);
  } catch (error) {
    console.error('[RetryScheduler] Error in recoverLostRetries:', error.message);
    // Don't throw - recovery failure should not crash server
  }
}

module.exports = {
  scheduleRetrySequence,
  markAcknowledged,
  getActiveRetry,
  getActiveRetryCount,
  recoverLostRetries,
};
