# Dispatch Loop Runbook

## Overview

This runbook provides operational procedures for the Afterhours Dispatch Loop system. It covers monitoring, troubleshooting, manual interventions, and common failure scenarios.

## System Status

### Health Check

```bash
curl https://your-server.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Afterhours Dispatch Loop",
  "version": "2.0.0"
}
```

### Service Endpoints

- **Health**: `GET /health`
- **Primary Webhook**: `POST /webhooks/retell/call-ended`
- **Fallback Webhook**: `POST /webhooks/twilio/status-callback`
- **Manual Dispatch**: `POST /api/dispatch/manual`
- **SMS Acknowledgment**: `POST /webhooks/twilio/sms`
- **Call Acknowledgment**: `POST /webhooks/twilio/ack-call`
- **Link Acknowledgment**: `GET /api/ack/:callId/:token` (disabled)
- **Dispatch Status**: `GET /api/dispatch/status/:callId`

## Monitoring

### Key Metrics to Monitor

1. **Webhook Receipt Rate**
   - Monitor logs for `[Webhook] ========== RETELL CALL-ENDED ==========`
   - Expected: 1 webhook per call

2. **Dispatch Success Rate**
   - Monitor logs for `[DispatchEngine] ========== DISPATCH COMPLETE ==========`
   - Check `status` field: `DISPATCHING` (success) vs `UNASSIGNED`/`NEEDS_REVIEW` (failure)

3. **SMS Send Success**
   - Monitor logs for `[DispatchService] SMS sent: [sid]`
   - Watch for A2P 30034 errors: `[DispatchService] SMS blocked by A2P (30034)`

4. **Airtable Write Success**
   - Monitor logs for `[Calls] record created: {id, businessId, callerPhone}`
   - Watch for errors: `[Airtable] Error creating call record`

5. **Retry Sequence Activity**
   - Monitor logs for `[RetryScheduler] Retry attempt [N]`
   - **Note**: Retry scheduler is in-memory only - lost on server restart

### Log Patterns

**Successful Dispatch**
```
[Webhook] ========== RETELL CALL-ENDED ==========
[DispatchEngine] ========== STARTING DISPATCH ==========
[BusinessMatch] matched via TWILIO_DID businessId: recXXX
[DispatchEngine] Urgency classification: {urgency: 'HIGH', confidence: 'HIGH'}
[Calls] record created: {id: 'recYYY', businessId: 'recXXX', callerPhone: '+19497968362'}
[Roster] selected: {id: 'recZZZ', name: 'John', phone: '+19497968363', priority: 1}
[DispatchService] Attempt 1: SMS to John (+19497968363)
[DispatchService] SMS sent: SM...
[DispatchEngine] ========== DISPATCH COMPLETE (1234ms) ==========
[Dispatch] COMPLETE - status: DISPATCHING
```

**Failed Business Match**
```
[BusinessMatch] no match found, needsReview: true
[Calls] record created: {id: 'recYYY', businessId: null, callerPhone: '+19497968362'}
[Dispatch] COMPLETE - status: NEEDS_REVIEW (business match failed)
```

**SMS Blocked (A2P 30034)**
```
[DispatchService] SMS blocked by A2P (30034) — no email fallback available
[DispatchEngine] Email dispatch skipped: {callId, reason, smsBlockedByA2P}
```

## Troubleshooting

### Issue: "Message didn't send"

**Symptoms**
- Call record created in Airtable
- Status = `DISPATCHING`
- No SMS received by tech
- No Dispatch Event logged

**Diagnosis Steps**

1. **Check SMS send logs**
   ```bash
   grep "SMS sent" server.log
   grep "SMS send failed" server.log
   ```

2. **Check Twilio error codes**
   - A2P 30034: SMS blocked (A2P 10DLC not approved)
   - Other errors: Check Twilio dashboard for delivery status

3. **Check Dispatch Events table**
   - Query Airtable Dispatch Events table for callId
   - Look for `Delivery Status = FAILED` or `BLOCKED_A2P_30034`

4. **Verify Twilio credentials**
   ```bash
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   echo $TWILIO_PHONE_NUMBER
   ```

**Resolution**

- **A2P 30034**: Wait for A2P 10DLC approval. Email fallback is disabled; manual dispatch required.
- **Other Twilio errors**: Check Twilio dashboard, verify phone number format (E.164)
- **No logs**: Check if webhook was received, verify server is running

### Issue: "Follow-up didn't fire"

**Symptoms**
- Initial SMS sent successfully
- Tech didn't acknowledge
- No follow-up SMS/voice call after retry timeout

**Diagnosis Steps**

1. **Check retry scheduler state**
   ```bash
   grep "RetryScheduler" server.log
   grep "scheduleRetrySequence" server.log
   ```
   - **Note**: Retry scheduler is in-memory only - lost on server restart

2. **Check if server restarted**
   ```bash
   # Check server uptime
   ps aux | grep "node index.js"
   # Check logs for restart
   grep "Listening on port" server.log | tail -1
   ```

3. **Check acknowledgment status**
   - Query Airtable Calls table: `Status = DISPATCHED_CONFIRMED`?
   - If yes, retry sequence was stopped (expected)

**Resolution**

- **Server restarted**: Retry sequence lost (in-memory). Manual dispatch required.
- **Acknowledged**: Retry sequence stopped (expected behavior)
- **No retry scheduled**: Bug in retry scheduler - manual dispatch required

**Manual Retry**
```bash
curl -X POST https://your-server.com/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "recXXX",
    "callData": {
      "callerPhone": "+19497968362",
      "emergencyLevel": "HIGH",
      "issueSummary": "Water leak",
      "twilioToNumber": "+19497968361"
    }
  }'
```

### Issue: "Call record not created"

**Symptoms**
- Webhook received
- No Call record in Airtable
- Status unknown

**Diagnosis Steps**

1. **Check Airtable connection**
   ```bash
   echo $AIRTABLE_ACCESS_TOKEN
   echo $AIRTABLE_BASE_ID
   ```

2. **Check Airtable logs**
   ```bash
   grep "Error creating call record" server.log
   grep "UNKNOWN_FIELD_NAME" server.log
   ```

3. **Check field detection**
   ```bash
   grep "Detected.*table fields" server.log
   ```

**Resolution**

- **Missing fields**: Verify Airtable schema matches expected fields
- **Invalid Emergency Level**: Check that value is uppercase (HIGH/MEDIUM/LOW)
- **Airtable API error**: Check API token, rate limits, base ID

### Issue: "Business match failed"

**Symptoms**
- Call record created with `Status = NEEDS_REVIEW`
- `Business` field is empty
- No dispatch sent

**Diagnosis Steps**

1. **Check Twilio DID match**
   ```bash
   grep "BusinessMatch" server.log | tail -5
   ```

2. **Verify Businesses table**
   - Check Airtable Businesses table
   - Verify "Twilio DID" field contains correct phone number
   - Check phone number format (E.164: +1XXXXXXXXXX)

3. **Check business count**
   - If multiple businesses exist, Twilio DID match is required
   - If single business exists, should auto-select

**Resolution**

- **Twilio DID mismatch**: Update Businesses."Twilio DID" field with correct number
- **Phone format**: Normalize to E.164 format (+1XXXXXXXXXX)
- **Multiple businesses**: Ensure "Twilio DID" field is populated for each business

### Issue: "No on-call person selected"

**Symptoms**
- Call record created
- Business matched
- Status = `UNASSIGNED`
- No dispatch sent

**Diagnosis Steps**

1. **Check roster query**
   ```bash
   grep "Roster" server.log | tail -10
   ```

2. **Verify On-Call Roster table**
   - Check Airtable On-Call Roster table
   - Verify `Business` link field points to correct business
   - Check `Availability Status = AVAILABLE`
   - Check `Active = true`
   - Verify `Priority` field (1 = highest priority)

3. **Check schedule windows**
   - If `Start Time` / `End Time` provided, verify current time is within window

**Resolution**

- **No roster entries**: Add entries to On-Call Roster table
- **Availability Status**: Set to "AVAILABLE"
- **Active**: Set to true
- **Priority**: Set to 1 for primary on-call person
- **Schedule windows**: Adjust Start/End Time if needed

## Manual Interventions

### Manual Dispatch

Trigger dispatch for an existing call:

```bash
curl -X POST https://your-server.com/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "recXXX",
    "callData": {
      "callerPhone": "+19497968362",
      "emergencyLevel": "HIGH",
      "issueSummary": "Water leak in basement",
      "transcript": "Customer called about water leak...",
      "twilioToNumber": "+19497968361",
      "callId": "retell_123456"
    }
  }'
```

### Check Dispatch Status

```bash
curl https://your-server.com/api/dispatch/status/recXXX
```

Expected response:
```json
{
  "callId": "recXXX",
  "status": "DISPATCHING",
  "message": "Status lookup not yet implemented"
}
```

**Note**: Status lookup is not fully implemented - check Airtable directly.

### Update Call Status Manually

1. Open Airtable Calls table
2. Find call record by `Caller Phone` or `Call ID`
3. Update `Status` field:
   - `DISPATCHING` - Retry sequence active
   - `DISPATCHED_CONFIRMED` - Tech acknowledged
   - `DISPATCHED_NO_ACK` - Cutoff reached
   - `NEEDS_REVIEW` - Business match failed / error
   - `UNASSIGNED` - No on-call person available

## Common Failure Scenarios

### Scenario 1: A2P 30034 Error (SMS Blocked)

**What happens:**
- SMS send fails with error code 30034
- System falls back to email dispatch (if configured)
- Dispatch Event logged with `Delivery Status = BLOCKED_A2P_30034`

**Resolution:**
- Wait for A2P 10DLC campaign approval
- Verify Twilio number is attached to Messaging Service
- Use email dispatch as fallback

### Scenario 2: Server Restart During Retry Sequence

**What happens:**
- Retry sequence is in-memory only
- Server restart loses all active retry sequences
- Follow-up SMS/voice calls never sent

**Resolution:**
- Manual dispatch required for affected calls
- Check Airtable for calls with `Status = DISPATCHING` but no recent Dispatch Events
- Future: Replace with persistent job queue (Bull/Agenda + Redis)

### Scenario 3: Email Dispatch Disabled

**What happens:**
- Email dispatch is disabled until a real provider is integrated
- Logs show: `[DispatchService] Email dispatch blocked: {to, callId, reason}`
- Returns `{success: false, attempted: false}` for email channel

**Resolution:**
- Treat email as unavailable; do not rely on it for critical alerts
- Use SMS or voice call dispatch instead
- Future: Integrate SendGrid/AWS SES before enabling

### Scenario 4: SMS Acknowledgment Not Processed

**What happens:**
- Tech replies "YES" to SMS
- Webhook received: `POST /webhooks/twilio/sms`
- Acknowledgment not processed (cannot map phone → callId)

**Resolution:**
- SMS acknowledgment mapping not implemented
- Manual acknowledgment: Update Airtable Call status to `DISPATCHED_CONFIRMED`
- Future: Implement phone → callId lookup table (Redis/DB)

## Operational Checklist

### Daily Checks

- [ ] Health check returns 200
- [ ] Webhook logs show incoming calls
- [ ] Airtable Calls table has new records
- [ ] No excessive error logs

### Weekly Checks

- [ ] Review `NEEDS_REVIEW` calls in Airtable
- [ ] Review `UNASSIGNED` calls (no roster match)
- [ ] Check Dispatch Events for failed sends
- [ ] Verify Twilio account status (A2P 10DLC approval)

### Monthly Checks

- [ ] Review dispatch success rate
- [ ] Check for stuck `DISPATCHING` calls (no recent events)
- [ ] Verify On-Call Roster is up to date
- [ ] Review Businesses table for Twilio DID accuracy

## Emergency Procedures

### System Down

1. Check server status: `curl https://your-server.com/health`
2. Check server logs for errors
3. Restart server if needed
4. **Important**: Retry sequences are lost on restart - manual dispatch required

### Airtable Connection Lost

1. Check `AIRTABLE_ACCESS_TOKEN` and `AIRTABLE_BASE_ID`
2. Verify Airtable API is accessible
3. Check rate limits (5 requests/second)
4. System will continue to attempt writes (non-blocking)

### Twilio Account Issues

1. Check Twilio dashboard for account status
2. Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
3. Check phone number status
4. Verify A2P 10DLC campaign approval

## Support Contacts

- **Twilio Support**: https://support.twilio.com
- **Airtable Support**: https://support.airtable.com
- **Retell Support**: Check Retell dashboard

## Related Documentation

- [AFTERHOURS_PRD.md](../prd/AFTERHOURS_PRD.md) - Product requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DISPATCH_SPEC.md](../../dispatch_loop/DISPATCH_SPEC.md) - Dispatch specification
