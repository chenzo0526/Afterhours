const { upsertCall, updateCallStatus, FIELDS, findBusinessById } = require('./airtable');
const { matchBusiness } = require('./businessMatcher');
const { classifyUrgency } = require('./urgencyClassifier');
const { selectOnCallPerson, getBackupContacts } = require('./onCallSelector');
const { dispatchWithRetry } = require('./dispatchService');
const { buildSMSMessage } = require('./dispatchPacket');

/**
 * Main dispatch engine
 * Orchestrates the entire dispatch process
 */
async function processDispatch(callData) {
  const startTime = Date.now();
  const emailDispatchDisabledReason = 'Email dispatch disabled (not implemented)';
  
  try {
    console.log('[DispatchEngine] ========== STARTING DISPATCH ==========');
    console.log('[DispatchEngine] Call data:', JSON.stringify(callData, null, 2));
    
    // Step 1: Normalize inbound payload
    const normalized = normalizePayload(callData);
    console.log('[DispatchEngine] Normalized payload:', JSON.stringify(normalized, null, 2));
    
    // Step 2: Determine business match (never throws - always returns)
    const businessMatch = await matchBusiness(normalized);
    console.log('[DispatchEngine] Business match:', businessMatch);
    
    // Set businessId from match (may be null)
    normalized.businessId = businessMatch.businessId || null;
    
    // Log business match result
    if (businessMatch.businessId) {
      console.log('[BusinessMatch] matched via', businessMatch.matchMethod, 'businessId:', businessMatch.businessId);
    } else {
      console.log('[BusinessMatch] no match found, needsReview:', businessMatch.needsReview);
    }
    
    // Get business object and emergency keywords (only if business matched)
    let business = businessMatch.business;
    let emergencyKeywords = [];
    
    if (normalized.businessId) {
      if (!business) {
        business = await findBusinessById(normalized.businessId);
      }
      
      if (business) {
        emergencyKeywords = business.fields?.[FIELDS.BUSINESS_EMERGENCY_KEYWORDS] 
          ? (typeof business.fields[FIELDS.BUSINESS_EMERGENCY_KEYWORDS] === 'string' 
              ? business.fields[FIELDS.BUSINESS_EMERGENCY_KEYWORDS].split(',').map(k => k.trim())
              : [])
          : [];
      }
    }
    
    // Step 3: Classify urgency
    const urgencyResult = classifyUrgency(normalized, emergencyKeywords);
    normalized.urgency = urgencyResult.urgency;
    normalized.emergencyReason = urgencyResult.reason;
    console.log('[DispatchEngine] Urgency classification:', urgencyResult);
    
    // Map urgency to emergencyLevel for Airtable (treat as STRING, normalize to uppercase: HIGH, MEDIUM, LOW)
    // NEVER write "High", "Medium", or "Low" - only uppercase
    // If value is invalid, will be skipped in airtable.js
    let emergencyLevel = normalized.emergencyLevel || urgencyResult.urgency || '';
    if (emergencyLevel) {
      emergencyLevel = String(emergencyLevel).trim().toUpperCase();
      // Valid uppercase values only
      const validLevels = ['HIGH', 'MEDIUM', 'LOW', 'EMERGENCY', 'NON-EMERGENCY', 'UNKNOWN'];
      if (!validLevels.includes(emergencyLevel)) {
        // Will be skipped in airtable.js if invalid
        console.warn('[DispatchEngine] Invalid Emergency Level value, will skip:', emergencyLevel);
        emergencyLevel = '';
      }
    }
    normalized.emergencyLevel = emergencyLevel;
    
    // Step 4: ALWAYS create Call record (even if business match failed)
    // Derive issueSummary from transcript if missing
    let issueSummary = normalized.issueSummary || normalized.summary || '';
    if (!issueSummary && normalized.transcript) {
      // Create short summary from transcript (first 500 chars)
      issueSummary = normalized.transcript.substring(0, 500);
    }
    
    const callRecordData = {
      callerPhone: normalized.callerPhone || normalized.twilioFromNumber || '',
      emergencyLevel: normalized.emergencyLevel || '',
      issueSummary: issueSummary || '',
      transcript: normalized.transcript || undefined,
      businessId: normalized.businessId || undefined,
      twilioToNumber: normalized.twilioToNumber || normalized.toNumber || undefined,
      callId: normalized.callId || undefined,
    };
    
    // Always create call record - never fail on this (Calls creation must always succeed)
    const callRecord = await upsertCall(callRecordData);
    const callRecordId = callRecord?.id;
    
    // Even if call record creation fails, continue dispatch (never abort)
    if (!callRecordId) {
      console.error('[DispatchEngine] Call record creation returned null ID, but continuing dispatch...');
      // Continue with null callRecordId - dispatch must proceed
    }
    
    // If business match failed, return early with NEEDS_REVIEW (still success:true)
    if (businessMatch.needsReview || !normalized.businessId) {
      if (callRecordId) {
        await updateCallStatus(callRecordId, 'NEEDS_REVIEW');
      }
      await sendInternalAlert(callRecordId, 'Business match failed', normalized);
      
      console.log('[Dispatch] COMPLETE - status: NEEDS_REVIEW (business match failed)');
      return {
        success: true,
        callId: callRecordId,
        status: 'NEEDS_REVIEW',
        reason: 'Business could not be determined',
      };
    }
    
    // Step 5: Select on-call person (only if business matched)
    const trade = business?.fields?.[FIELDS.BUSINESS_TRADE] || null;
    const onCallPerson = await selectOnCallPerson(normalized.businessId, trade);
    console.log('[DispatchEngine] On-call person selected:', onCallPerson);
    
    if (!onCallPerson.phone) {
      // No on-call person available - still return success (status = UNASSIGNED)
      if (callRecordId) {
        await updateCallStatus(callRecordId, 'UNASSIGNED');
      }
      await sendInternalAlert(callRecordId, 'No on-call person available', normalized);
      
      console.log('[Dispatch] COMPLETE - status: UNASSIGNED (no roster match)');
      return {
        success: true,
        callId: callRecordId,
        status: 'UNASSIGNED',
        reason: 'No on-call person available',
      };
    }
    
    // Step 6: Build dispatch packet
    const dispatchMessage = buildSMSMessage(normalized, callRecordId);
    console.log('[DispatchEngine] Dispatch message prepared');
    
    // Step 7: Send dispatch attempts (errors must NOT bubble up)
    let dispatchResult;
    try {
      dispatchResult = await dispatchWithRetry(
        normalized,
        onCallPerson,
        callRecordId,
        urgencyResult.urgency
      );
    } catch (error) {
      // DispatchService errors must NOT bubble up - treat as non-fatal
      console.error('[DispatchEngine] DispatchService error (non-fatal):', error.message);
      dispatchResult = {
        success: false,
        error: error.message,
      };
    }
    
    // Step 8: Email dispatch disabled until implemented
    const smsBlockedByA2P = dispatchResult?.channels?.sms?.errorCode === 30034;
    const sendEmailDispatch = 
      business?.fields?.['Email Dispatch Enabled'] || 
      urgencyResult.urgency === 'HIGH' ||
      !dispatchResult?.success ||
      smsBlockedByA2P;
    
    let emailResult = null;
    if (sendEmailDispatch) {
      console.warn('[DispatchEngine] Email dispatch skipped:', {
        callId: callRecordId,
        reason: emailDispatchDisabledReason,
        smsBlockedByA2P,
      });
      emailResult = {
        attempted: false,
        success: false,
        error: emailDispatchDisabledReason,
        method: 'EMAIL',
      };
    }
    
    // Determine overall dispatch success: true if at least one channel succeeded (email is enough)
    const smsSuccess = dispatchResult?.channels?.sms?.success || false;
    const emailSuccess = dispatchResult?.channels?.email?.success || false;
    const overallDispatchSuccess = smsSuccess || emailSuccess;
    
    const duration = Date.now() - startTime;
    console.log(`[DispatchEngine] ========== DISPATCH COMPLETE (${duration}ms) ==========`);
    
    // If roster match exists, status should remain DISPATCHING (even if SMS attempt had errors)
    // DispatchService errors must NOT change status from DISPATCHING if roster was matched
    const finalStatus = onCallPerson.phone ? 'DISPATCHING' : 'UNASSIGNED';
    console.log('[Dispatch] COMPLETE - status:', finalStatus);
    
    // Build channels object (ensure email result is included even if dispatchResult is null)
    const channels = {
      sms: dispatchResult?.channels?.sms || null,
      email: dispatchResult?.channels?.email || emailResult,
    };
    
    return {
      success: true,
      callId: callRecordId,
      status: finalStatus,
      onCallPerson: {
        name: onCallPerson.name,
        phone: onCallPerson.phone,
      },
      urgency: urgencyResult.urgency,
      nextRetryAt: dispatchResult?.nextRetryAt || null,
      dispatchSuccess: overallDispatchSuccess,
      channels: channels,
    };
    
  } catch (error) {
    console.error('[DispatchEngine] ========== DISPATCH ERROR ==========');
    console.error('[DispatchEngine] Error:', error.message);
    console.error('[DispatchEngine] Stack:', error.stack);
    
    // Try to create call record with error status (never throw)
    try {
      const normalizedError = normalizePayload(callData);
      const errorCallData = {
        callerPhone: normalizedError.callerPhone || normalizedError.twilioFromNumber || '',
        emergencyLevel: '',
        issueSummary: `ERROR: ${error.message}`,
        transcript: normalizedError.transcript || '',
        businessId: null,
        callId: normalizedError.callId,
      };
      const errorCall = await upsertCall(errorCallData);
      
      if (errorCall?.id) {
        await sendInternalAlert(errorCall.id, 'Dispatch error', { error: error.message, callData });
        console.log('[Dispatch] COMPLETE - status: NEEDS_REVIEW (error)');
        return {
          success: true,
          callId: errorCall.id,
          status: 'NEEDS_REVIEW',
          reason: `Error: ${error.message}`,
        };
      }
    } catch (createError) {
      console.error('[DispatchEngine] Failed to create error call record:', createError);
    }
    
    // Even if we can't create a record, return success (ALWAYS return success:true)
    console.log('[Dispatch] COMPLETE - status: NEEDS_REVIEW (error, no call record)');
    return {
      success: true,
      status: 'NEEDS_REVIEW',
      reason: `Error: ${error.message}`,
    };
  }
}

/**
 * Normalize inbound payload from various sources
 * Maps to Airtable field names: callerPhone, emergencyLevel, issueSummary, businessId, transcript
 */
function normalizePayload(payload) {
  // Handle Retell webhook format
  if (payload.call) {
    const call = payload.call;
    const vars = call.variables || payload.metadata || payload.custom_variables || {};
    
    return {
      callerPhone: vars.callback_number || vars.callback_phone || vars.callerPhone || call.from_number || call.fromNumber || '',
      emergencyLevel: vars.emergency_level || vars.emergencyLevel || vars.urgency || '',
      issueSummary: vars.issue_summary || vars.issue || vars.issueSummary || '',
      summary: vars.issue_summary || vars.issue || vars.issueSummary || '',
      transcript: call.transcript || payload.transcript || '',
      // Keep other fields for internal use (urgency, etc.)
      urgency: vars.emergency_level || vars.emergencyLevel || vars.urgency,
      twilioToNumber: call.to_number || call.toNumber || vars.twilio_to_number || '',
      toNumber: call.to_number || call.toNumber || vars.twilio_to_number || '',
      businessId: payload.businessId || null,
      callId: call.call_id || call.callId || payload.callId || null,
    };
  }
  
  // Handle Twilio status callback format
  if (payload.CallSid) {
    return {
      callerPhone: payload.From || '',
      emergencyLevel: payload.emergencyLevel || payload.urgency || '',
      issueSummary: payload.issueSummary || payload.summary || '',
      summary: payload.issueSummary || payload.summary || '',
      transcript: payload.TranscriptionText || payload.transcript || '',
      urgency: payload.emergencyLevel || payload.urgency,
      twilioToNumber: payload.To || '',
      toNumber: payload.To || '',
      businessId: payload.businessId || null,
      callId: payload.CallSid || payload.callId || null,
    };
  }
  
  // Handle direct API call format
  return {
    callerPhone: payload.callerPhone || payload.from || '',
    emergencyLevel: payload.emergencyLevel || payload.fields?.emergencyLevel || payload.urgency || '',
    issueSummary: payload.issueSummary || payload.summary || '',
    summary: payload.issueSummary || payload.summary || '',
    transcript: payload.transcript || '',
    urgency: payload.emergencyLevel || payload.fields?.emergencyLevel || payload.urgency,
    twilioToNumber: payload.twilioToNumber || payload.toNumber || '',
    toNumber: payload.twilioToNumber || payload.toNumber || '',
    businessId: payload.businessId || null,
    callId: payload.callId || null,
  };
}

/**
 * Send internal alert (placeholder)
 */
async function sendInternalAlert(callId, reason, data) {
  // TODO: Implement internal alerting (SMS to owner, email, etc.)
  console.log('[DispatchEngine] Internal alert:', {
    callId,
    reason,
    data: JSON.stringify(data, null, 2),
  });
  
  // Could send SMS to owner phone
  const ownerPhone = process.env.OWNER_PHONE_NUMBER;
  if (ownerPhone) {
    // Would use dispatchService.sendSMS here
    console.log(`[DispatchEngine] Would send alert SMS to ${ownerPhone}`);
  }
}

module.exports = {
  processDispatch,
  normalizePayload,
};
