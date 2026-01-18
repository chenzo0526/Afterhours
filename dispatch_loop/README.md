# Afterhours AI Dispatch Loop

High-level dispatch system that automatically routes after-hours calls to on-call technicians with retry logic and acknowledgment handling.

## Overview

The dispatch loop processes completed voice calls, matches them to businesses, classifies urgency, selects on-call technicians, and dispatches via SMS/Call with intelligent retry logic. Email dispatch is disabled until a real provider is integrated.

## Architecture

```
Webhook Trigger (Retell/Twilio)
    ↓
Dispatch Engine
    ├─→ Normalize Payload
    ├─→ Match Business
    ├─→ Classify Urgency
    ├─→ Create Call Record (Airtable)
    ├─→ Select On-Call Person
    ├─→ Build Dispatch Packet
    └─→ Dispatch Service (SMS/Call)
            ↓
        Retry Scheduler
            ├─→ Attempt 1: SMS to Primary
            ├─→ Attempt 2: Follow-up SMS
            ├─→ Attempt 3: Voice Call
            ├─→ Attempt 4: SMS to Backup
            └─→ Cutoff: Alert Owner
```

## Features

- ✅ **Multi-trigger support**: Retell webhooks, Twilio callbacks, manual dispatch
- ✅ **Business matching**: Twilio DID, IVR selection, city/zip coverage
- ✅ **Urgency classification**: Emergency keyword detection, agent-captured levels
- ✅ **On-call selection**: Schedule-based, trade-matching, priority-based
- ✅ **Retry logic**: Configurable timings for normal and high-urgency calls
- ✅ **Acknowledgment handling**: IVR presses (SMS/link acks disabled until mapping/token validation)
- ✅ **Airtable integration**: Full CRUD operations for Calls, Businesses, Roster, Events
- ✅ **Dispatch packet builder**: Standardized SMS messages
- ✅ **State machine**: Call status tracking (NEW → ROUTED → DISPATCHING → DISPATCHED_CONFIRMED)

## Setup

### 1. Install Dependencies

```bash
cd dispatch_loop
npm install
```

### 2. Environment Variables

Create a `.env` file:

```bash
# Required: Airtable
AIRTABLE_ACCESS_TOKEN=pat...
AIRTABLE_BASE_ID=app...

# Required: Twilio (for SMS/Call dispatch)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Optional
OWNER_PHONE_NUMBER=+1...
OWNER_EMAIL=owner@example.com # Email dispatch disabled until provider integration
BASE_URL=http://localhost:3000
PORT=3000
```

**Required Environment Variables:**
- `AIRTABLE_ACCESS_TOKEN` - Airtable Personal Access Token (get from https://airtable.com/create/tokens)
- `AIRTABLE_BASE_ID` - Airtable Base ID (from URL: https://airtable.com/appXXXXXXXXXXXXXX)
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Twilio phone number for sending SMS/calls

### 3. Airtable Base Setup

Ensure your Airtable base has the required tables:
- **Businesses** (with Twilio Numbers, Trade, Emergency Keywords)
- **On-Call Roster** (with Business link, Phone, Priority, Availability Status, Schedule)
- **Calls** (with all call fields, Status, Assigned To)
- **Dispatch Events** (with Call link, Contact, Method, Acknowledged)

Run the Airtable schema creator:
```bash
cd ../tools/airtable
AIRTABLE_ACCESS_TOKEN=pat... node create_afterhours_base.js
```

### 4. Start Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Webhooks

- `POST /webhooks/retell/call-ended` - Primary trigger from Retell
- `POST /webhooks/twilio/status-callback` - Fallback trigger from Twilio
- `POST /webhooks/twilio/sms` - SMS acknowledgment handler
- `POST /webhooks/twilio/ack-call` - IVR acknowledgment handler

### API

- `POST /api/dispatch/manual` - Manual dispatch trigger
- `GET /api/dispatch/status/:callId` - Get dispatch status
- `GET /api/ack/:callId/:token` - Secure link acknowledgment (disabled)

### Health

- `GET /health` - Health check

## Dispatch Flow

### Step 1: Normalize Payload
Extracts and normalizes data from Retell/Twilio webhook formats.

### Step 2: Business Matching

**How Business Matching Works:**

The dispatch system uses schema-adaptive business matching that works with your existing Airtable setup:

1. **Twilio DID Match** (Primary):
   - Matches `twilioToNumber` or `toNumber` from payload against Businesses table
   - Looks for "Twilio DID" field (case-insensitive - matches "Twilio DID", "Twilio Did", etc.)
   - Normalizes phone numbers for matching (handles +1, spaces, dashes)
   - Uses JavaScript filtering (no filterByFormula) for reliability

2. **Single Business Auto-Select** (Fallback):
   - If Businesses table has exactly ONE record, automatically selects it
   - Useful for single-business setups or testing

3. **IVR Selection** (If provided):
   - Uses `businessId` from payload if provided

4. **NEEDS_REVIEW** (If no match):
   - If no business match found, dispatch continues with `businessId = null`
   - Call record is still created in Airtable (Business field left blank)
   - Returns `success: true` with `status: "NEEDS_REVIEW"`
   - Internal alert is sent (logged to console)

**Important:** Business matching failures never cause dispatch to fail. The system always creates a Calls record and returns success, even if business cannot be determined.

### Step 3: Urgency Classification
- Uses agent-captured `emergencyLevel` if present
- Falls back to keyword matching (transcript, issueSummary)
- Checks business-specific emergency keywords
- Returns: `LOW`, `MEDIUM`, or `HIGH` with confidence

### Step 4: Create Call Record
Upserts to Airtable Calls table with all captured data.

### Step 5: Select On-Call Person
- Queries On-Call Roster for business
- Filters by trade match, availability status, schedule window
- Selects lowest priority (1 = primary)
- Falls back to Owner/Manager if no roster entries

### Step 6: Build Dispatch Packet
Creates standardized message with:
- Urgency indicator
- Caller name, phone, address
- Issue summary
- Emergency reason (if applicable)
- Preferred contact method
- Airtable link

### Step 7: Dispatch with Retry
**Normal Urgency:**
- T1 (2m): SMS follow-up to Primary
- T2 (5m): Voice call to Primary
- T3 (8m): SMS to Backup #1
- T4 (11m): Call Backup #1
- T5 (14m): SMS to Backup #2
- Cutoff: 20 minutes or 6 attempts

**High Urgency:**
- T1 (1m): SMS follow-up
- T2 (3m): Voice call
- T3 (5m): SMS to Backup
- Cutoff: 12 minutes or 6 attempts

### Step 8: Acknowledgment
ACK accepted if:
- SMS reply contains: "Y", "YES", "ON IT", "TAKING", "CLAIM"
- Tech clicks secure ACK link
- Presses 1 on call IVR

When ACK received:
- Call.status = "DISPATCHED_CONFIRMED"
- Call.assignedTo = Tech
- Retry sequence stops
- Optional: Send confirmation to caller

## Retry Logic

The retry scheduler handles:
- Time-based retries (T1, T2, T3, etc.)
- Escalation to backup contacts
- Cutoff handling (time or attempt limit)
- Acknowledgment detection and retry cancellation

**Note**: Current implementation uses in-memory scheduling. For production, use a job queue (Bull, Agenda, etc.) with Redis/database persistence.

## Acknowledgment Handling

### SMS Acknowledgment
Tech replies with ACK keyword → `handleSMSAcknowledgment()`

### Call IVR Acknowledgment
Tech presses 1 → `handleCallAcknowledgment()`

### Link Acknowledgment
Tech clicks secure link → `handleLinkAcknowledgment()`

All acknowledgments:
- Update Call.status to "DISPATCHED_CONFIRMED"
- Log DispatchEvent with acknowledged=true
- Stop retry sequence

## Call Status States

- `NEW` - Call record created, not yet processed
- `ROUTED` - Business matched, ready for dispatch
- `DISPATCHING` - Dispatch attempts in progress
- `DISPATCHED_CONFIRMED` - Tech acknowledged
- `DISPATCHED_NO_ACK` - Cutoff reached, no acknowledgment
- `NEEDS_REVIEW` - Business match failed or error
- `UNASSIGNED` - No on-call person available
- `CLOSED` - Call resolved/completed

## Data Schema

### Required Fields

**Calls:**
- `callerPhone` OR `twilioFromNumber` (required)
- `issueSummary` OR `transcript` (required)
- `businessId` OR `twilioToNumber` (for business matching)

**Businesses:**
- `name` (required)
- `Primary Phone` (for fallback dispatch)

**On-Call Roster:**
- `Business` (link, required)
- `Phone` (required)
- `Availability Status` (required)
- `Priority` (for selection order)

## Error Handling

- **Missing required fields**: Creates Call with NEEDS_REVIEW status, sends internal alert
- **Business match failure**: Creates Call with NEEDS_REVIEW, alerts owner
- **No on-call person**: Sets status to UNASSIGNED, alerts owner
- **Dispatch failures**: Logs to DispatchEvents, continues retry sequence
- **Cutoff reached**: Sets status to DISPATCHED_NO_ACK, alerts owner

## Production Considerations

1. **Job Queue**: Replace in-memory retry scheduler with Bull/Agenda
2. **Email Service**: Integrate SendGrid/AWS SES for email dispatch
3. **Token Validation**: Implement secure token generation for link acknowledgments
4. **Call Lookup**: Implement contact phone → callId mapping for SMS acknowledgments
5. **Monitoring**: Add logging/monitoring (Sentry, DataDog, etc.)
6. **Rate Limiting**: Add rate limiting to webhook endpoints
7. **Webhook Verification**: Verify Retell/Twilio webhook signatures

## Testing

### Smoke Test

Run the smoke test to verify the system is working:

```bash
# Start server in one terminal
npm start

# In another terminal, run smoke test
npm run smoke
```

The smoke test:
1. Checks `/health` endpoint
2. Posts a sample dispatch payload to `/api/dispatch/manual`
3. Verifies response is `success: true`
4. Prints the JSON response

**Expected Output:**
```
🧪 Running smoke tests...

1. Testing /health endpoint...
   ✅ Health check passed

2. Testing /api/dispatch/manual endpoint...
   Response: {
     "success": true,
     "result": {
       "success": true,
       "callId": "recXXXXXXXXXXXXXX",
       "status": "NEEDS_REVIEW" or "DISPATCHING",
       ...
     }
   }
   ✅ Dispatch endpoint passed

✅ All smoke tests passed!
```

### Test Retell Webhook

```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "call_id": "test_123",
      "from_number": "+15551234567",
      "to_number": "+15559876543",
      "variables": {
        "customer_name": "John Doe",
        "issue": "No water",
        "service_address": "123 Main St, City, ST 12345",
        "callback_number": "+15551234567"
      }
    }
  }'
```

### Test Manual Dispatch

```bash
curl -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+15551234567",
      "callerName": "John Doe",
      "issueSummary": "No water",
      "addressLine1": "123 Main St",
      "city": "City",
      "state": "ST",
      "zip": "12345",
      "twilioToNumber": "+15559876543"
    }
  }'
```

## Troubleshooting

### "AIRTABLE_ACCESS_TOKEN not configured"
Set `AIRTABLE_ACCESS_TOKEN` in `.env` file.

### "Business match failed"
- Check that Businesses table has Twilio Numbers field populated
- Verify `twilioToNumber` in call data matches a business number

### "No on-call person available"
- Check On-Call Roster has entries for the business
- Verify Availability Status is not "OFF", "VACATION", or "DO_NOT_DISTURB"
- Check schedule windows (Start Time, End Time) include current time

### SMS not sending
- Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` are set
- Check Twilio account has sufficient balance
- Verify phone number format (+1XXXXXXXXXX)

## License

ISC
