# Afterhours Product Requirements Document

## Overview

Afterhours is an automated dispatch system for after-hours service calls. When a customer calls after business hours, the system automatically routes the call to an AI agent (Retell), captures call details, and dispatches the call to on-call technicians via SMS, voice calls, and email.

## System Components

### 1. Call Reception (External)
- **Retell AI Agent**: Handles incoming calls, captures customer information, and classifies urgency
- **Twilio**: Provides phone numbers and call routing infrastructure
- **Webhook Integration**: Retell sends call-ended webhooks to dispatch loop

### 2. Dispatch Loop (`dispatch_loop/`)

#### Entry Points
- **Primary**: `POST /webhooks/retell/call-ended` - Triggered when Retell call ends
- **Fallback**: `POST /webhooks/twilio/status-callback` - Triggered when Twilio call completes
- **Manual**: `POST /api/dispatch/manual` - Manual dispatch trigger from dashboard

#### Core Flow (`lib/dispatchEngine.js`)

1. **Payload Normalization**
   - Accepts Retell webhook format: `{call: {call_id, from_number, to_number, transcript, variables}}`
   - Accepts Twilio status callback format: `{CallSid, From, To, TranscriptionText}`
   - Accepts direct API format: `{callerPhone, emergencyLevel, issueSummary, transcript}`
   - Maps to internal format: `{callerPhone, emergencyLevel, issueSummary, transcript, twilioToNumber, callId}`

2. **Business Matching** (`lib/businessMatcher.js`)
   - Priority 1: Match by Twilio DID (`twilioToNumber` → Businesses."Twilio DID" field)
   - Priority 2: If exactly 1 business exists, auto-select
   - Priority 3: IVR selection (if provided in call data)
   - Priority 4: Mark as `NEEDS_REVIEW` if no match

3. **Urgency Classification** (`lib/urgencyClassifier.js`)
   - Priority 1: Use agent-captured `emergencyLevel` if present (HIGH/MEDIUM/LOW)
   - Priority 2: Check transcript/keywords against:
     - Business-specific emergency keywords (from Businesses."Emergency Keywords")
     - High-urgency patterns (regex): `/(no (water|heat|air)|burst pipe|flood|sewage|gas leak|spark|fire)/i`
     - Emergency keywords: `['no water', 'water leak', 'burst pipe', 'flooding', 'sewage backup', 'gas smell', 'no heat', 'frozen pipe', ...]`
   - Returns: `{urgency: 'HIGH'|'MEDIUM'|'LOW', confidence, reason}`

4. **Call Record Creation** (`lib/airtable.js`)
   - Always creates Call record in Airtable (even if business match failed)
   - Fields written: `Caller Phone`, `Emergency Level`, `Issue Summary`, `Business` (link), `Transcript`, `Twilio To Number`
   - Schema-adaptive: Only writes to fields that exist in Calls table
   - Never throws - returns `{id, isNew, record}` or `{id: null, error}`

5. **On-Call Selection** (`lib/onCallSelector.js`)
   - Queries On-Call Roster table filtered by:
     - Business ID (link field)
     - Trade type (optional)
     - Availability Status = "AVAILABLE"
     - Active = true
     - Schedule windows (Start Time / End Time) - if provided
   - Sorts by Priority (ascending, 1 = highest priority)
   - Returns first match: `{contactId, phone, name, role, priority}`

6. **Dispatch Packet Building** (`lib/dispatchPacket.js`)
   - SMS message format:
     ```
     🚨 EMERGENCY - After-Hours Call
     
     👤 Name: [callerName]
     📞 Phone: [callerPhone]
     📍 Address: [address]
     
     🔧 Issue: [issueSummary]
     ⚠️ Reason: [emergencyReason] (if HIGH urgency)
     
     📋 Full details: [Airtable link]
     
     🚨 ACTION REQUIRED: Please contact customer immediately.
     ```
   - Email subject: `🚨 EMERGENCY - [callerName] ([city]) - After-Hours Call`
   - Email body: HTML formatted with full call details

7. **Dispatch Execution** (`lib/dispatchService.js`)
   - **SMS Dispatch** (`sendSMS()`):
     - Uses Twilio `client.messages.create()`
     - Handles A2P 30034 error (SMS blocked) - falls back to email
     - Logs to Dispatch Events table (non-blocking)
     - Returns: `{success, sid, status, errorCode, error}`
   
   - **Email Dispatch** (`sendEmail()`):
     - **CURRENT STATUS: PLACEHOLDER ONLY**
     - Logs to console, does not actually send email
     - Returns `{success: true}` but no email is sent
     - TODO: Integrate SendGrid/AWS SES
   
   - **Voice Call Dispatch** (`sendVoiceCall()`):
     - Uses Twilio `client.calls.create()`
     - TwiML URL: `/webhooks/twilio/ack-call?callId=[callId]`
     - Prompts tech: "Press 1 to accept, or hang up to decline"
     - Logs to Dispatch Events table

8. **Retry Sequence** (`lib/retryScheduler.js`)
   - **CURRENT STATUS: IN-MEMORY ONLY (not persistent)**
   - Uses `setTimeout` - lost on server restart
   - Tracks active retries in `activeRetries` Map
   - **Normal Urgency**:
     - T1: +2 minutes (SMS follow-up)
     - T2: +5 minutes (Voice call)
     - T3: +8 minutes (SMS to Backup #1)
     - T4: +11 minutes (Call Backup #1)
     - T5: +14 minutes (SMS to Backup #2)
     - Cutoff: 20 minutes or 6 attempts
   - **High Urgency**:
     - T1: +1 minute (SMS follow-up)
     - T2: +3 minutes (Voice call)
     - T3: +5 minutes (SMS to Backup)
     - Cutoff: 12 minutes or 6 attempts
   - TODO: Replace with Bull/Agenda job queue with Redis persistence

9. **Acknowledgment Handling** (`lib/acknowledgmentHandler.js`)
   - **SMS ACK**: Tech replies with keywords: `['Y', 'YES', 'ON IT', 'TAKING', 'CLAIM', 'ACCEPT', 'OK', 'GOT IT']`
     - Webhook: `POST /webhooks/twilio/sms`
     - **CURRENT GAP**: Cannot map phone number → callId (needs Redis/DB lookup)
   - **Call IVR ACK**: Tech presses 1 during acknowledgment call
     - Webhook: `POST /webhooks/twilio/ack-call`
     - Updates call status to `DISPATCHED_CONFIRMED`
   - **Link ACK**: Tech clicks secure link in SMS
     - Endpoint: `GET /api/ack/:callId/:token`
     - **CURRENT GAP**: Token validation not implemented

10. **Status Updates**
    - Call status transitions:
      - `NEW` → Call record created
      - `ROUTED` → Business matched (not explicitly set, but implied)
      - `DISPATCHING` → Retry sequence active
      - `DISPATCHED_CONFIRMED` → Tech acknowledged
      - `DISPATCHED_NO_ACK` → Cutoff reached, no acknowledgment
      - `NEEDS_REVIEW` → Business match failed / error
      - `UNASSIGNED` → No on-call person available

### 3. Data Storage (Airtable)

#### Tables

**Businesses**
- `Business Name` (text)
- `Trade` (single select: PLUMBING, HVAC, ELECTRICAL, etc.)
- `Twilio DID` (text, comma-separated) - Used for business matching
- `Primary Phone` (phone)
- `Emergency Keywords` (text, comma-separated) - Business-specific urgency keywords
- `Afterhours Active` (checkbox)
- `Owner Email` (email) - Used for email dispatch fallback
- `Email Dispatch Enabled` (checkbox) - Whether to send email dispatches

**On-Call Roster**
- `Business` (link to Businesses)
- `Name` (text)
- `Phone` (phone) - E.164 format preferred
- `Role` (single select: Owner, Tech, Dispatcher)
- `Trade` (single select or "ALL")
- `Priority` (number, 1 = highest priority)
- `Availability Status` (single select: AVAILABLE, OFF, VACATION, DO_NOT_DISTURB)
- `Start Time` (time, HH:MM) - Schedule window start
- `End Time` (time, HH:MM) - Schedule window end
- `Active` (checkbox)

**Calls**
- `Caller Phone` (phone) - Required
- `Emergency Level` (single select: HIGH, MEDIUM, LOW) - Uppercase only
- `Issue Summary` (long text) - Required
- `Business` (link to Businesses) - Optional
- `Transcript` (long text) - Optional
- `Twilio To Number` (phone) - Optional
- `Status` (single select: NEW, ROUTED, DISPATCHING, DISPATCHED_CONFIRMED, DISPATCHED_NO_ACK, NEEDS_REVIEW, UNASSIGNED, CLOSED)
- `Assigned To` (link to On-Call Roster) - Optional

**Dispatch Events**
- `Call` (link to Calls)
- `Contact` (link to On-Call Roster)
- `Method` (single select: SMS, CALL, EMAIL)
- `Sent At` (date/time)
- `Delivery Status` (single select: SENT, FAILED, BLOCKED_A2P_30034, CUTOFF)
- `Acknowledged` (checkbox)
- `Attempt Number` (number)
- `Result` (text)
- `Error` (text)

## Current Limitations

1. **Email Sending**: Placeholder only - does not actually send emails
2. **Retry Scheduler**: In-memory only - lost on server restart
3. **SMS Acknowledgment**: Cannot map phone number → callId (needs Redis/DB lookup)
4. **Link Acknowledgment**: Token validation not implemented
5. **Webhook Verification**: No signature verification for Retell/Twilio webhooks
6. **Job Queue**: No persistent job queue (Bull/Agenda) for retries

## Success Criteria

- ✅ Call record created in Airtable for every incoming call
- ✅ Business matched by Twilio DID (or marked NEEDS_REVIEW)
- ✅ Urgency classified (HIGH/MEDIUM/LOW)
- ✅ On-call person selected from roster
- ✅ SMS dispatched to primary on-call person
- ⚠️ Email dispatched (placeholder - not functional)
- ⚠️ Retry sequence executed (in-memory only - not persistent)
- ⚠️ Acknowledgment received and call status updated (partial - SMS ACK mapping missing)

## Future Enhancements

1. Integrate email service (SendGrid/AWS SES)
2. Replace in-memory retry scheduler with Bull/Agenda + Redis
3. Implement phone → callId lookup for SMS acknowledgments
4. Implement token validation for link acknowledgments
5. Add webhook signature verification
6. Add monitoring/alerting (Sentry/DataDog)
7. Add rate limiting to webhook endpoints
8. Implement caller confirmation SMS when tech acknowledges
