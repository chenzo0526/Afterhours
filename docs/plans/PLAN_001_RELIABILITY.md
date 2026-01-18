# PLAN_001_RELIABILITY.md

## Plan: Reliability Improvements - Message Send & Follow-up Verification

### Problem Statement

Two critical reliability issues have been identified:

1. **"Message didn't send"**: SMS dispatch may fail silently or appear to succeed but not actually deliver
2. **"Follow-up didn't fire"**: Retry sequence follow-ups may not execute due to in-memory scheduler being lost on server restart

These issues can result in:
- Techs not receiving dispatch notifications
- Customers not getting service during emergencies
- Lost revenue and customer trust

### Current State

**SMS Sending** (`lib/dispatchService.js`)
- Uses Twilio `client.messages.create()` 
- Returns `{success, sid, status}` but doesn't verify delivery
- Logs to Dispatch Events table (non-blocking, may fail silently)
- Handles A2P 30034 error but doesn't track delivery status over time

**Retry Scheduler** (`lib/retryScheduler.js`)
- **IN-MEMORY ONLY** - uses `setTimeout` and `activeRetries` Map
- Lost on server restart
- No persistence or recovery mechanism
- No verification that retries actually execute

**Dispatch Events Logging** (`lib/airtable.js`)
- `createDispatchEvent()` silently fails if table unavailable
- No verification that events are actually written
- No delivery status tracking from Twilio webhooks

### Desired State

1. **SMS Send Verification**
   - Track SMS delivery status via Twilio status callbacks
   - Verify Dispatch Events are written to Airtable
   - Alert if SMS fails after initial "success"
   - Retry SMS send if delivery fails

2. **Follow-up Reliability**
   - Persistent retry scheduler (survives server restart)
   - Verification that retries execute at scheduled times
   - Recovery mechanism for lost retry sequences
   - Manual trigger for missed follow-ups

3. **Monitoring & Alerting**
   - Health check endpoint includes dispatch health metrics
   - Log aggregation for failed sends
   - Alert on consecutive failures

### Success Criteria

- [ ] SMS delivery status tracked via Twilio status callbacks
- [ ] Dispatch Events verified written to Airtable (with retry on failure)
- [ ] Retry scheduler persists across server restarts
- [ ] Health check endpoint reports dispatch health metrics
- [ ] Test harness verifies SMS send and follow-up execution
- [ ] Manual recovery mechanism for lost retry sequences

### Implementation Steps

#### Step 1: Add Twilio Status Callback Handler
- **File**: `index.js`
- **Change**: Add `POST /webhooks/twilio/sms-status` endpoint to receive Twilio status callbacks
- **Verification**: 
  - Send test SMS
  - Verify callback received
  - Check Dispatch Events updated with delivery status

**Code Changes:**
```javascript
// In index.js, add after existing webhooks:
app.post('/webhooks/twilio/sms-status', async (req, res) => {
  const messageSid = req.body.MessageSid;
  const status = req.body.MessageStatus; // queued, sent, delivered, failed, undelivered
  const errorCode = req.body.ErrorCode;
  
  console.log('[Webhook] SMS status callback:', { messageSid, status, errorCode });
  
  // Find Dispatch Event by messageSid (store in Dispatch Events table)
  // Update delivery status
  // If failed, trigger retry or alert
  
  res.sendStatus(200);
});
```

#### Step 2: Store Message SID in Dispatch Events
- **File**: `lib/dispatchService.js`
- **Change**: Store Twilio message SID in Dispatch Events table for status callback lookup
- **Verification**: 
  - Send SMS
  - Check Dispatch Events table has `Message SID` field populated
  - Verify status callback can find event by SID

**Code Changes:**
```javascript
// In sendSMS(), after msg.sid received:
await createDispatchEvent({
  callId: callId,
  method: 'SMS',
  sentAt: new Date().toISOString(),
  deliveryStatus: msg.status || 'SENT',
  attemptNumber: attemptNumber,
  result: `SMS sent: ${msg.sid}`,
  messageSid: msg.sid, // NEW: Store for status callback lookup
});
```

#### Step 3: Verify Dispatch Events Written
- **File**: `lib/airtable.js`
- **Change**: Add verification that `createDispatchEvent()` actually wrote to Airtable
- **Verification**: 
  - Send test dispatch
  - Verify event appears in Airtable within 5 seconds
  - If not, retry write with exponential backoff

**Code Changes:**
```javascript
// In createDispatchEvent(), after record creation:
async function createDispatchEvent(eventData) {
  // ... existing code ...
  
  const record = await base(TABLES.DISPATCH_EVENTS).create(recordData);
  
  // NEW: Verify write succeeded
  if (record && record.id) {
    // Verify by reading back (optional, for critical events)
    try {
      const verify = await base(TABLES.DISPATCH_EVENTS).find(record.id);
      if (!verify) {
        console.error('[Airtable] Dispatch event write verification failed');
        // Retry write (exponential backoff)
      }
    } catch (verifyError) {
      console.error('[Airtable] Dispatch event verification error:', verifyError);
    }
  }
  
  return record;
}
```

#### Step 4: Add Health Metrics Endpoint
- **File**: `index.js`
- **Change**: Enhance `/health` endpoint with dispatch health metrics
- **Verification**: 
  - Call `/health`
  - Verify response includes dispatch metrics

**Code Changes:**
```javascript
app.get('/health', async (req, res) => {
  // Count active retry sequences
  const activeRetries = require('./lib/retryScheduler').getActiveRetryCount();
  
  // Count pending dispatches (Status = DISPATCHING, no recent events)
  const pendingDispatches = await getPendingDispatches(); // TODO: Implement
  
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
});
```

#### Step 5: Create Minimal Test Harness
- **File**: `scripts/test-reliability.js` (new file)
- **Change**: Create test script that verifies SMS send and follow-up execution
- **Verification**: 
  - Run test script
  - Verify SMS sent and status callback received
  - Verify follow-up executes at scheduled time

**Code:**
```javascript
// scripts/test-reliability.js
require('dotenv').config();
const { processDispatch } = require('../lib/dispatchEngine');

async function testSMSReliability() {
  console.log('Testing SMS reliability...');
  
  // Test 1: SMS send
  const testCallData = {
    callerPhone: '+19497968362',
    emergencyLevel: 'HIGH',
    issueSummary: 'Test reliability check',
    twilioToNumber: process.env.TWILIO_PHONE_NUMBER,
    callId: `test_${Date.now()}`,
  };
  
  const result = await processDispatch(testCallData);
  console.log('Dispatch result:', result);
  
  // Verify SMS sent
  if (result.channels?.sms?.success) {
    console.log('✅ SMS sent successfully');
    console.log('   SID:', result.channels.sms.sid);
  } else {
    console.error('❌ SMS send failed:', result.channels?.sms?.error);
  }
  
  // Test 2: Check Dispatch Events written
  // TODO: Query Airtable Dispatch Events table
  // Verify event exists with correct messageSid
  
  // Test 3: Wait for status callback
  // TODO: Poll for status callback or wait 30 seconds
  // Verify delivery status updated
  
  console.log('Test complete');
}

testSMSReliability().catch(console.error);
```

#### Step 6: Add Retry Sequence Recovery
- **File**: `lib/retryScheduler.js`
- **Change**: Add function to recover lost retry sequences from Airtable
- **Verification**: 
  - Create call with Status = DISPATCHING
  - Restart server
  - Run recovery function
  - Verify retry sequence restarted

**Code Changes:**
```javascript
// In retryScheduler.js, add:
async function recoverLostRetries() {
  // Query Airtable for calls with:
  // - Status = DISPATCHING
  // - Last Dispatch Event > 5 minutes ago
  // - No recent events
  
  const lostCalls = await findLostDispatches(); // TODO: Implement in airtable.js
  
  for (const call of lostCalls) {
    console.log('[RetryScheduler] Recovering lost retry for call:', call.id);
    // Restart retry sequence
    // TODO: Need to reconstruct callData and onCallContact from Airtable
  }
}

// Call on server startup
if (require.main === module) {
  recoverLostRetries();
}
```

### Testing

#### Test Case 1: SMS Send Verification
- **Setup**: 
  - Configure test phone number
  - Set up Twilio status callback webhook
- **Action**: 
  - Send test dispatch via `POST /api/dispatch/manual`
- **Expected**: 
  - SMS sent successfully
  - Dispatch Event created with `messageSid`
  - Status callback received within 30 seconds
  - Dispatch Event updated with delivery status
- **Verification**: 
  ```bash
  # Check Dispatch Events table
  # Verify messageSid exists
  # Verify delivery status = "delivered"
  ```

#### Test Case 2: Follow-up Execution
- **Setup**: 
  - Create call with Status = DISPATCHING
  - Note current time
- **Action**: 
  - Wait for retry timeout (T1 = 2 minutes for normal urgency)
- **Expected**: 
  - Follow-up SMS sent at T1
  - Dispatch Event created for attempt #2
- **Verification**: 
  ```bash
  # Check logs for "Retry attempt 2"
  # Check Dispatch Events for attempt #2
  # Verify SMS received
  ```

#### Test Case 3: Server Restart Recovery
- **Setup**: 
  - Create call with Status = DISPATCHING
  - Verify retry sequence active
- **Action**: 
  - Restart server
  - Run recovery function
- **Expected**: 
  - Retry sequence restarted
  - Follow-up SMS sent at next scheduled time
- **Verification**: 
  ```bash
  # Check logs for "Recovering lost retry"
  # Verify retry sequence active
  # Wait for follow-up SMS
  ```

#### Test Case 4: Dispatch Events Write Verification
- **Setup**: 
  - Send test dispatch
- **Action**: 
  - Monitor Airtable Dispatch Events table
- **Expected**: 
  - Event appears within 5 seconds
  - All fields populated correctly
- **Verification**: 
  ```bash
  # Query Airtable Dispatch Events
  # Verify event exists with correct callId, method, sentAt
  ```

### Rollout Plan

1. **Phase 1: SMS Status Callback** (Low risk)
   - Add status callback endpoint
   - Store messageSid in Dispatch Events
   - Deploy and monitor

2. **Phase 2: Write Verification** (Low risk)
   - Add verification to `createDispatchEvent()`
   - Deploy and monitor

3. **Phase 3: Health Metrics** (Low risk)
   - Enhance health endpoint
   - Deploy and monitor

4. **Phase 4: Test Harness** (No risk)
   - Create test script
   - Run in staging environment
   - Document results

5. **Phase 5: Retry Recovery** (Medium risk)
   - Add recovery function
   - Test in staging
   - Deploy with monitoring

### Risks & Mitigations

- **Risk**: Twilio status callback not received
  - **Mitigation**: Poll Twilio API for message status as fallback
  - **Mitigation**: Alert if status not received within 5 minutes

- **Risk**: Airtable write verification adds latency
  - **Mitigation**: Make verification async/non-blocking
  - **Mitigation**: Only verify critical events (first attempt)

- **Risk**: Recovery function restarts duplicate retries
  - **Mitigation**: Check if retry already active before restarting
  - **Mitigation**: Add idempotency check (last event timestamp)

- **Risk**: Test harness sends real SMS
  - **Mitigation**: Use test phone numbers
  - **Mitigation**: Add `TEST_MODE` flag to skip actual sends

### Dependencies

- Twilio status callback webhook URL configuration
- Airtable Dispatch Events table with `Message SID` field
- Server restart detection mechanism
- Monitoring/alerting system (optional)

### Notes

- **Current Limitation**: Retry scheduler is in-memory only. Full solution requires Bull/Agenda + Redis (future work).
- **Workaround**: Recovery function can restore retry sequences from Airtable on server restart.
- **Monitoring**: Health metrics endpoint provides visibility into system health without external monitoring tools.

### Verification Steps

After implementation, verify:

1. **SMS Send**
   ```bash
   # Send test dispatch
   curl -X POST http://localhost:3000/api/dispatch/manual \
     -H "Content-Type: application/json" \
     -d '{"callId": "test_123", "callData": {...}}'
   
   # Check Dispatch Events table
   # Verify messageSid exists
   # Wait 30 seconds
   # Check delivery status updated
   ```

2. **Follow-up Execution**
   ```bash
   # Create call with Status = DISPATCHING
   # Wait 2 minutes (T1 for normal urgency)
   # Check logs for "Retry attempt 2"
   # Verify SMS received
   ```

3. **Health Metrics**
   ```bash
   curl http://localhost:3000/health
   # Verify metrics.activeRetries and metrics.pendingDispatches
   ```

4. **Recovery**
   ```bash
   # Create call with Status = DISPATCHING
   # Restart server
   # Check logs for "Recovering lost retry"
   # Verify retry sequence restarted
   ```
