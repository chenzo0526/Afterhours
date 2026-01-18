# Afterhours Architecture Reference

## System Overview

Afterhours is a Node.js/Express application that orchestrates automated dispatch of after-hours service calls. It integrates with Retell (AI voice agent), Twilio (SMS/voice), and Airtable (data storage).

## Architecture Diagram

```
┌─────────────┐
│   Retell    │  AI Voice Agent (handles incoming calls)
│   Agent     │
└──────┬──────┘
       │ POST /webhooks/retell/call-ended
       │ {call: {call_id, from_number, to_number, transcript, variables}}
       ▼
┌─────────────────────────────────────────────────────────┐
│              Dispatch Loop Server                        │
│              (Express.js on port 3000)                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  index.js                                        │  │
│  │  - Webhook entrypoints                           │  │
│  │  - Health check                                   │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  lib/dispatchEngine.js                           │  │
│  │  - processDispatch() - Main orchestration        │  │
│  │  - normalizePayload() - Format conversion        │  │
│  └──────┬───────────────────────┬───────────────────┘  │
│         │                       │                        │
│         ▼                       ▼                        │
│  ┌──────────────┐      ┌──────────────────┐            │
│  │ business     │      │ urgency          │            │
│  │ Matcher      │      │ Classifier       │            │
│  └──────┬───────┘      └────────┬─────────┘            │
│         │                       │                        │
│         ▼                       ▼                        │
│  ┌──────────────────────────────────────────┐          │
│  │  lib/airtable.js                         │          │
│  │  - upsertCall() - Create call record     │          │
│  │  - getOnCallRoster() - Query roster       │          │
│  └──────┬───────────────────────────────────┘          │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐          │
│  │  lib/onCallSelector.js                  │          │
│  │  - selectOnCallPerson()                 │          │
│  └──────┬───────────────────────────────────┘          │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐          │
│  │  lib/dispatchPacket.js                   │          │
│  │  - buildSMSMessage()                     │          │
│  │  - buildEmailSubject/Body()              │          │
│  └──────┬───────────────────────────────────┘          │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐          │
│  │  lib/dispatchService.js                  │          │
│  │  - dispatchWithRetry()                   │          │
│  │  - sendSMS() - Twilio SMS                │          │
│  │  - sendEmail() - PLACEHOLDER             │          │
│  │  - sendVoiceCall() - Twilio Voice        │          │
│  └──────┬───────────────────────────────────┘          │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐          │
│  │  lib/retryScheduler.js                  │          │
│  │  - scheduleRetrySequence()               │          │
│  │  - IN-MEMORY ONLY (setTimeout)           │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Twilio    │    │  Airtable   │    │  Airtable   │
│   SMS/Voice │    │   Calls     │    │  Dispatch   │
│             │    │   Table     │    │   Events    │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       │ POST /webhooks/twilio/sms (ACK)
       │ POST /webhooks/twilio/ack-call (ACK)
       ▼
┌──────────────────────────────────────────┐
│  lib/acknowledgmentHandler.js            │
│  - handleSMSAcknowledgment()             │
│  - handleCallAcknowledgment()            │
│  - handleLinkAcknowledgment()            │
└──────────────────────────────────────────┘
```

## Component Details

### 1. Entry Layer (`index.js`)

**Express Server**
- Port: 3000 (configurable via `PORT` env var)
- Middleware: `body-parser` for JSON/URL-encoded payloads
- Health check: `GET /health` returns `{status: 'ok', timestamp, service, version}`

**Webhook Endpoints**
- `POST /webhooks/retell/call-ended`
  - Primary trigger for dispatch
  - Returns 200 immediately (non-blocking)
  - Processes dispatch asynchronously
  - Payload: Retell webhook format

- `POST /webhooks/twilio/status-callback`
  - Fallback trigger when call completes
  - Only processes if `CallStatus === 'completed'`
  - Payload: Twilio status callback format

- `POST /api/dispatch/manual`
  - Manual dispatch from dashboard
  - Requires `{callId, callData}` in body
  - Returns dispatch result synchronously

- `POST /webhooks/twilio/sms`
  - SMS acknowledgment handler
  - Receives SMS replies with ACK keywords
  - **GAP**: Cannot map phone → callId (needs lookup table)

- `POST /webhooks/twilio/ack-call`
  - IVR acknowledgment handler
  - TwiML response: "Press 1 to accept"
  - Updates call status to `DISPATCHED_CONFIRMED`

- `GET /api/ack/:callId/:token`
  - Link acknowledgment endpoint
  - **DISABLED**: Token validation not implemented; endpoint returns 410

### 2. Orchestration Layer (`lib/dispatchEngine.js`)

**processDispatch(callData)**
- Main entry point for dispatch logic
- Always returns `{success: true}` (never throws)
- Flow:
  1. Normalize payload (Retell/Twilio/API formats)
  2. Match business (Twilio DID → Businesses table)
  3. Classify urgency (keywords + agent data)
  4. Create Call record (Airtable) - always succeeds
  5. Select on-call person (roster query)
  6. Build dispatch packet (SMS message)
  7. Dispatch with retry (SMS attempt #1)
  8. Email dispatch disabled until a provider is integrated
  9. Return status: `DISPATCHING` or `UNASSIGNED`

**normalizePayload(payload)**
- Handles 3 input formats:
  - Retell: `{call: {call_id, from_number, to_number, transcript, variables}}`
  - Twilio: `{CallSid, From, To, TranscriptionText, ...}`
  - API: `{callerPhone, emergencyLevel, issueSummary, transcript, ...}`
- Maps to internal format: `{callerPhone, emergencyLevel, issueSummary, transcript, twilioToNumber, callId}`

### 3. Business Logic Layer

**lib/businessMatcher.js**
- `matchBusiness(callData)`
- Priority order:
  1. Twilio DID match (`twilioToNumber` → Businesses."Twilio DID")
  2. Single business auto-select (if exactly 1 business exists)
  3. IVR selection (if `businessId` provided in call data)
  4. Mark as `NEEDS_REVIEW` if no match
- Returns: `{businessId, business, matchMethod, confidence, needsReview}`

**lib/urgencyClassifier.js**
- `classifyUrgency(callData, businessEmergencyKeywords)`
- Priority order:
  1. Agent-captured `emergencyLevel` (HIGH/MEDIUM/LOW)
  2. Business-specific emergency keywords
  3. High-urgency regex patterns
  4. Emergency keyword matching
  5. Default: MEDIUM
- Returns: `{urgency: 'HIGH'|'MEDIUM'|'LOW', confidence, reason}`

**lib/onCallSelector.js**
- `selectOnCallPerson(businessId, trade, now)`
- Queries On-Call Roster filtered by:
  - Business ID (link field)
  - Trade type (optional)
  - Availability Status = "AVAILABLE"
  - Active = true
  - Schedule windows (if provided)
- Sorts by Priority (ascending, 1 = highest)
- Returns: `{contactId, phone, name, role, priority}`

### 4. Data Layer (`lib/airtable.js`)

**Schema-Adaptive Design**
- Detects available fields at runtime
- Only writes to fields that exist in table
- Caches field detection per table
- Never throws - returns `null` or `{id: null, error}` on failure

**Key Functions**
- `upsertCall(callData)` - Creates Call record (always succeeds, may return `{id: null}`)
- `getOnCallRoster(businessId, trade, now)` - Queries roster (filters in JS, max 50 records)
- `createDispatchEvent(eventData)` - Logs dispatch attempts (silently skips if table unavailable)
- `updateCallStatus(callId, status, assignedTo)` - Updates call status (only if field exists)
- `findBusinessByTwilioNumber(twilioToNumber)` - Matches business by DID (normalizes phone formats)

**Phone Number Normalization**
- `normalizePhoneNumber(phone)` - Strips +1, spaces, dashes → digits only
- `toE164(phone)` - Converts to E.164 format (+1XXXXXXXXXX)
- Handles: `(949) 796-8362`, `949-796-8362`, `+19497968362`, etc.

### 5. Dispatch Layer (`lib/dispatchService.js`)

**sendSMS(to, message, callId, attemptNumber)**
- Uses Twilio `client.messages.create()`
- Handles A2P 30034 error (SMS blocked) - returns `{errorCode: 30034}`
- Logs to Dispatch Events table (non-blocking)
- Returns: `{success, sid, status, errorCode, error}`

**sendEmail(to, subject, body, callId, attemptNumber)**
- **CURRENT STATUS: DISABLED**
- Logs: `[DispatchService] Email dispatch blocked: {to, callId, reason}`
- Returns `{success: false, attempted: false}` and does not send
- TODO: Integrate SendGrid/AWS SES before enabling

**sendVoiceCall(to, callId, attemptNumber)**
- Uses Twilio `client.calls.create()`
- TwiML URL: `${BASE_URL}/webhooks/twilio/ack-call?callId=${callId}`
- Logs to Dispatch Events table
- Returns: `{success, sid, status}`

**dispatchWithRetry(callData, onCallContact, callRecordId, urgency)**
- Sends SMS attempt #1 immediately
- Returns: `{success, acknowledged, attemptNumber, nextRetryAt, channels: {sms, email}}`
- **Note**: Retry sequence is handled by `retryScheduler.js` (separate module)

### 6. Retry Layer (`lib/retryScheduler.js`)

**CURRENT STATUS: IN-MEMORY ONLY (not persistent)**

**scheduleRetrySequence(callId, callData, primaryContact, urgency)**
- Creates retry sequence object
- Stores in `activeRetries` Map (in-memory)
- Schedules first retry via `setTimeout`
- **Problem**: Lost on server restart

**Retry Timings**
- Normal urgency:
  - T1: +2 minutes (SMS follow-up)
  - T2: +5 minutes (Voice call)
  - T3: +8 minutes (SMS to Backup #1)
  - T4: +11 minutes (Call Backup #1)
  - T5: +14 minutes (SMS to Backup #2)
  - Cutoff: 20 minutes or 6 attempts
- High urgency:
  - T1: +1 minute (SMS follow-up)
  - T2: +3 minutes (Voice call)
  - T3: +5 minutes (SMS to Backup)
  - Cutoff: 12 minutes or 6 attempts

**markAcknowledged(callId)**
- Marks sequence as acknowledged
- Removes from `activeRetries` Map
- Stops retry sequence

**TODO**: Replace with Bull/Agenda job queue with Redis persistence

### 7. Acknowledgment Layer (`lib/acknowledgmentHandler.js`)

**handleSMSAcknowledgment(callId, contactId, message)**
- Checks if message contains ACK keywords: `['Y', 'YES', 'ON IT', 'TAKING', 'CLAIM', 'ACCEPT', 'OK', 'GOT IT']`
- Updates call status to `DISPATCHED_CONFIRMED`
- Logs acknowledgment event
- **GAP**: Cannot map phone number → callId (needs Redis/DB lookup)

**handleCallAcknowledgment(callId, contactId)**
- Updates call status to `DISPATCHED_CONFIRMED`
- Logs acknowledgment event
- Returns TwiML: "Thank you. You have accepted the dispatch."

**handleLinkAcknowledgment(callId, contactId)**
- Updates call status to `DISPATCHED_CONFIRMED`
- Logs acknowledgment event
- **GAP**: Token validation not implemented

## Data Flow

### Successful Dispatch Flow

```
1. Retell call ends
   ↓
2. POST /webhooks/retell/call-ended
   ↓
3. dispatchEngine.processDispatch()
   ├─ normalizePayload() → {callerPhone, emergencyLevel, issueSummary, ...}
   ├─ matchBusiness() → {businessId, business}
   ├─ classifyUrgency() → {urgency: 'HIGH'}
   ├─ upsertCall() → {id: 'recXXX'}
   ├─ selectOnCallPerson() → {phone: '+19497968362', name: 'John'}
   ├─ buildSMSMessage() → "🚨 EMERGENCY - After-Hours Call..."
   ├─ dispatchWithRetry() → sendSMS() → {success: true, sid: 'SM...'}
   └─ sendEmail() → {success: true} (placeholder)
   ↓
4. Return {success: true, status: 'DISPATCHING', channels: {sms: {...}, email: {...}}}
   ↓
5. retryScheduler.scheduleRetrySequence() → setTimeout(T1)
   ↓
6. Tech replies "YES" → POST /webhooks/twilio/sms
   ↓
7. handleSMSAcknowledgment() → updateCallStatus('DISPATCHED_CONFIRMED')
   ↓
8. markAcknowledged() → Stop retry sequence
```

### Failed Dispatch Flow

```
1. Retell call ends
   ↓
2. dispatchEngine.processDispatch()
   ├─ matchBusiness() → {needsReview: true} (no match)
   └─ upsertCall() → {id: 'recXXX'}
   ↓
3. Return {success: true, status: 'NEEDS_REVIEW'}
   ↓
4. sendInternalAlert() → Logs to console (TODO: SMS to owner)
```

## Error Handling Philosophy

**Never Abort Dispatch**
- All errors are caught and logged
- Dispatch always returns `{success: true}` (even on errors)
- Call record creation never throws (returns `{id: null}` on failure)
- Dispatch event logging never throws (silently skips if table unavailable)
- Status updates never throw (skips if field doesn't exist)

**Non-Blocking Operations**
- Webhook handlers return 200 immediately
- Dispatch processing happens asynchronously
- Airtable operations are non-blocking (errors logged, not thrown)

## Environment Variables

```bash
# Airtable
AIRTABLE_ACCESS_TOKEN=patXXX
AIRTABLE_BASE_ID=appXXX

# Twilio
TWILIO_ACCOUNT_SID=ACXXX
TWILIO_AUTH_TOKEN=XXX
TWILIO_PHONE_NUMBER=+19497968362

# Server
PORT=3000
BASE_URL=https://your-server.com

# Optional
OWNER_PHONE_NUMBER=+19497968362
OWNER_EMAIL=owner@example.com
```

## Dependencies

```json
{
  "airtable": "^0.12.2",
  "body-parser": "^2.2.2",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "twilio": "^5.11.2"
}
```

## Known Limitations

1. **Email Sending**: Placeholder only - does not send emails
2. **Retry Scheduler**: In-memory only - lost on server restart
3. **SMS Acknowledgment**: Cannot map phone → callId (needs lookup table)
4. **Link Acknowledgment**: Token validation not implemented
5. **Webhook Verification**: No signature verification
6. **Job Queue**: No persistent job queue for retries

## Future Architecture Improvements

1. **Job Queue**: Replace `setTimeout` with Bull/Agenda + Redis
2. **Email Service**: Integrate SendGrid/AWS SES
3. **Lookup Table**: Redis/DB for phone → callId mapping
4. **Webhook Security**: Add signature verification
5. **Monitoring**: Add Sentry/DataDog for error tracking
6. **Rate Limiting**: Add rate limiting to webhook endpoints
