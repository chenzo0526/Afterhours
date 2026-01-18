# Dispatch Loop Implementation Summary

This document summarizes the implementation of the Afterhours AI Dispatch Loop based on the high-level behavior spec.

## ✅ Implementation Status

### Core Components

1. **✅ Airtable Integration** (`lib/airtable.js`)
   - Full CRUD operations for Businesses, On-Call Roster, Calls, Dispatch Events
   - Business lookup by Twilio DID
   - On-call roster queries with schedule/availability filtering
   - Dispatch event logging

2. **✅ Business Matching** (`lib/businessMatcher.js`)
   - Priority 1: Twilio DID → Businesses.twilioNumbers
   - Priority 2: IVR selection (if provided)
   - Priority 3: City/Zip coverage (placeholder for future)
   - Priority 4: Mark as NEEDS_REVIEW

3. **✅ Urgency Classification** (`lib/urgencyClassifier.js`)
   - Agent-captured emergencyLevel (priority)
   - Keyword matching (transcript, issueSummary)
   - Business-specific emergency keywords
   - Returns: LOW, MEDIUM, HIGH with confidence

4. **✅ On-Call Selection** (`lib/onCallSelector.js`)
   - Queries roster by business, trade, availability
   - Filters by schedule windows (start/end time)
   - Selects by priority (lowest = primary)
   - Fallback to owner/manager

5. **✅ Dispatch Packet Builder** (`lib/dispatchPacket.js`)
   - Standardized SMS message
   - HTML email with full details
   - Includes urgency indicator, caller info, issue, Airtable link

6. **✅ Dispatch Service** (`lib/dispatchService.js`)
   - SMS dispatch via Twilio
   - Voice call dispatch (IVR for acknowledgment)
   - Email dispatch (placeholder - ready for SendGrid/SES)
   - Acknowledgment keyword detection

7. **✅ Retry Scheduler** (`lib/retryScheduler.js`)
   - Normal urgency: 2m, 5m, 8m, 11m, 14m (cutoff 20m)
   - High urgency: 1m, 3m, 5m (cutoff 12m)
   - Escalation to backup contacts
   - Cutoff handling

8. **✅ Acknowledgment Handler** (`lib/acknowledgmentHandler.js`)
   - SMS acknowledgment (keywords: Y, YES, ON IT, TAKING, CLAIM)
   - Call IVR acknowledgment (press 1)
   - Link acknowledgment (secure token)
   - Updates call status to DISPATCHED_CONFIRMED

9. **✅ Dispatch Engine** (`lib/dispatchEngine.js`)
   - Orchestrates entire dispatch flow
   - Normalizes payloads from multiple sources
   - Error handling and fallbacks
   - State machine transitions

10. **✅ Webhook Handlers** (`index.js`)
    - Retell call-ended webhook (primary trigger)
    - Twilio status callback (fallback trigger)
    - Manual dispatch API
    - SMS acknowledgment webhook
    - Call IVR acknowledgment webhook
    - Link acknowledgment endpoint

## Data Flow

```
1. Webhook Trigger
   ↓
2. Normalize Payload (Retell/Twilio format)
   ↓
3. Match Business (Twilio DID → Businesses)
   ↓
4. Classify Urgency (keywords + agent data)
   ↓
5. Create Call Record (Airtable)
   ↓
6. Select On-Call Person (roster query)
   ↓
7. Build Dispatch Packet (SMS/Email)
   ↓
8. Dispatch with Retry
   ├─→ Attempt 1: SMS to Primary
   ├─→ Attempt 2: Follow-up SMS (T1)
   ├─→ Attempt 3: Voice Call (T2)
   ├─→ Attempt 4: SMS to Backup (T3)
   ├─→ Attempt 5: Call Backup (T4)
   └─→ Cutoff: Alert Owner
   ↓
9. Acknowledgment Received
   ├─→ Update Call.status = DISPATCHED_CONFIRMED
   ├─→ Stop Retry Sequence
   └─→ Log DispatchEvent
```

## Call Status States

- `NEW` - Call record created
- `ROUTED` - Business matched
- `DISPATCHING` - Retry sequence active
- `DISPATCHED_CONFIRMED` - Tech acknowledged
- `DISPATCHED_NO_ACK` - Cutoff reached
- `NEEDS_REVIEW` - Business match failed / error
- `UNASSIGNED` - No on-call person available
- `CLOSED` - Call resolved

## Retry Timings

### Normal Urgency
- T1: +2 minutes (SMS follow-up)
- T2: +5 minutes (Voice call)
- T3: +8 minutes (SMS to Backup #1)
- T4: +11 minutes (Call Backup #1)
- T5: +14 minutes (SMS to Backup #2)
- Cutoff: 20 minutes or 6 attempts

### High Urgency
- T1: +1 minute (SMS follow-up)
- T2: +3 minutes (Voice call)
- T3: +5 minutes (SMS to Backup)
- Cutoff: 12 minutes or 6 attempts

## Acknowledgment Methods

1. **SMS Reply**: Tech replies with "Y", "YES", "ON IT", "TAKING", "CLAIM"
2. **IVR Press**: Tech presses 1 during acknowledgment call
3. **Secure Link**: Tech clicks acknowledgment link in SMS

## Required Airtable Fields

### Businesses
- Business Name
- Trade (PLUMBING, HVAC, ELECTRICAL, etc.)
- Twilio Numbers (comma-separated)
- Primary Phone
- Emergency Keywords (comma-separated)
- Afterhours Active (checkbox)

### On-Call Roster
- Business (link)
- Name
- Phone
- Role (Owner, Tech, Dispatcher)
- Trade (or "ALL")
- Priority (1 = primary)
- Availability Status (AVAILABLE, OFF, VACATION, DO_NOT_DISTURB)
- Start Time (HH:MM)
- End Time (HH:MM)
- Active (checkbox)

### Calls
- Retell Call ID
- Twilio Call SID
- Twilio To Number
- Twilio From Number
- Caller Name
- Caller Phone
- Issue Summary
- Urgency (LOW, MEDIUM, HIGH)
- Address fields (Line 1, City, State, Zip)
- Transcript
- Status (NEW, ROUTED, DISPATCHING, etc.)
- Assigned To (link to On-Call Roster)

### Dispatch Events
- Call (link)
- Contact (link)
- Method (SMS, CALL, EMAIL)
- Sent At
- Delivery Status
- Acknowledged (checkbox)
- Attempt Number
- Result
- Error

## Production Considerations

### Current Limitations

1. **In-Memory Retry Scheduler**: Uses setTimeout (not persistent)
   - **Solution**: Use Bull/Agenda with Redis

2. **Email Service**: Placeholder only
   - **Solution**: Integrate SendGrid/AWS SES

3. **Token Validation**: Link acknowledgment tokens not implemented
   - **Solution**: Generate/validate JWT tokens

4. **Call Lookup**: SMS acknowledgment can't map phone → callId
   - **Solution**: Store pending dispatches in Redis/database

5. **Webhook Verification**: No signature verification
   - **Solution**: Verify Retell/Twilio webhook signatures

### Recommended Enhancements

1. **Job Queue**: Replace retry scheduler with Bull/Agenda
2. **Monitoring**: Add Sentry/DataDog for error tracking
3. **Rate Limiting**: Add rate limiting to webhook endpoints
4. **Webhook Verification**: Verify webhook signatures
5. **Caller Confirmation**: Implement SMS to caller when tech acknowledges
6. **Analytics**: Track dispatch success rates, acknowledgment times
7. **Multi-Location**: Enhance city/zip coverage matching
8. **Round-Robin**: Implement round-robin selection for multiple primary techs

## Testing

See `README.md` for test commands and examples.

## Deployment

1. Set environment variables
2. Ensure Airtable base is configured
3. Configure Twilio webhooks to point to your server
4. Configure Retell webhooks to point to `/webhooks/retell/call-ended`
5. Start server: `npm start`

## Support

For issues or questions, check:
- `README.md` for setup and troubleshooting
- Airtable schema in `tools/airtable/airtable_schema_output.json`
- Webhook logs in server console
