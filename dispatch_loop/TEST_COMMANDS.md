# Dispatch Loop Test Commands

Test commands for the Afterhours Dispatch Loop.

## Prerequisites

1. Set environment variables:
   ```bash
   export AIRTABLE_ACCESS_TOKEN=your_token_here
   export AIRTABLE_BASE_ID=appMJsHP71wkLODeW
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Test A: Minimal call-ended payload

**Expected:** Call record created, business match may fail → NEEDS_REVIEW

```bash
curl -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+15551234567",
      "issueSummary": "Test call - minimal payload",
      "emergencyLevel": "Medium"
    }
  }'
```

**Expected Console Output:**
```
[API] ========== MANUAL DISPATCH ==========
[DispatchEngine] ========== STARTING DISPATCH ==========
[DispatchEngine] Call data: ...
[DispatchEngine] Normalized payload: ...
[DispatchEngine] Business match: { needsReview: true, ... }
[DispatchEngine] Call record created: recXXXXXXXXXXXXXX
[DispatchEngine] ========== DISPATCH COMPLETE (...ms) ==========
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "success": false,
    "callId": "recXXXXXXXXXXXXXX",
    "status": "NEEDS_REVIEW",
    "reason": "Business could not be determined"
  }
}
```

## Test B: Payload with twilioToNumber (should match business)

**Expected:** Business matched by Twilio DID, call record created with business linked, dispatch continues

```bash
curl -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+15551234567",
      "twilioToNumber": "+15559876543",
      "issueSummary": "Test call - should match business by Twilio DID",
      "emergencyLevel": "High"
    }
  }'
```

**Expected Console Output:**
```
[API] ========== MANUAL DISPATCH ==========
[DispatchEngine] ========== STARTING DISPATCH ==========
[DispatchEngine] Call data: ...
[DispatchEngine] Normalized payload: ...
[DispatchEngine] Business match: { businessId: "recXXXXX", matchMethod: "TWILIO_DID", ... }
[DispatchEngine] Urgency classification: ...
[DispatchEngine] Call record created: recXXXXXXXXXXXXXX
[DispatchEngine] On-call person selected: ...
[DispatchEngine] ========== DISPATCH COMPLETE (...ms) ==========
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "callId": "recXXXXXXXXXXXXXX",
    "status": "DISPATCHING",
    "onCallPerson": {
      "name": "...",
      "phone": "..."
    },
    "urgency": "HIGH"
  }
}
```

**Verify in Airtable:**
- Calls table should have a new record with:
  - Caller Phone: "+15551234567"
  - Emergency Level: "High"
  - Issue Summary: "Test call - should match business by Twilio DID"
  - Business: [Linked to matched business]

## Test C: Payload that triggers NEEDS_REVIEW (no business match, multiple businesses)

**Expected:** Business match fails, call record created without business, returns NEEDS_REVIEW

```bash
curl -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+15559999999",
      "twilioToNumber": "+15555555555",
      "issueSummary": "Test call - no business match",
      "emergencyLevel": "Low"
    }
  }'
```

**Expected Console Output:**
```
[API] ========== MANUAL DISPATCH ==========
[DispatchEngine] ========== STARTING DISPATCH ==========
[DispatchEngine] Call data: ...
[DispatchEngine] Normalized payload: ...
[DispatchEngine] Business match: { needsReview: true, matchMethod: "NONE", ... }
[DispatchEngine] Call record created: recXXXXXXXXXXXXXX
[DispatchEngine] Internal alert: ...
[DispatchEngine] ========== DISPATCH COMPLETE (...ms) ==========
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "success": false,
    "callId": "recXXXXXXXXXXXXXX",
    "status": "NEEDS_REVIEW",
    "reason": "Business could not be determined"
  }
}
```

**Verify in Airtable:**
- Calls table should have a new record with:
  - Caller Phone: "+15559999999"
  - Emergency Level: "Low"
  - Issue Summary: "Test call - no business match"
  - Business: [blank/empty]

## Special Case: Single Business Auto-Select

If your Airtable Businesses table has exactly ONE business, it will automatically be selected regardless of Twilio DID match:

```bash
curl -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+15551234567",
      "issueSummary": "Test call - single business auto-select",
      "emergencyLevel": "Medium"
    }
  }'
```

**Expected:** Business automatically matched (matchMethod: "SINGLE_BUSINESS"), dispatch proceeds normally.

## Troubleshooting

### Field Detection Issues

If you see "UNKNOWN_FIELD_NAME" errors:
1. Check console output for detected fields on startup
2. Ensure Airtable base ID is correct
3. Ensure access token has read/write permissions

### Business Matching Issues

If business matching always fails:
1. Check Businesses table has "Twilio DID" field (case-insensitive match)
2. Verify Twilio DID format matches (with/without +1, spaces, etc.)
3. Check console for business match details

### Call Record Creation Issues

If call records aren't created:
1. Verify Calls table has: Caller Phone, Emergency Level, Issue Summary, Business
2. Check console for field detection output
3. Ensure all required fields are provided in payload

## Test D: A2P 30034 Error Handling (SMS Blocked, Email Fallback)

**Expected:** SMS fails with A2P 30034 error, email dispatch runs as fallback, overall dispatchSuccess = true if email succeeds

### Simulating A2P 30034 Error

To test this scenario, you can temporarily modify the Twilio client to throw a 30034 error, or use a test phone number that triggers A2P blocking. In production, this error occurs when:
- Sending SMS to a number that requires A2P registration
- Twilio account doesn't have A2P 10DLC campaign approved

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+19496774418",
      "twilioToNumber": "+19497968362",
      "issueSummary": "Test call - A2P 30034 fallback test",
      "emergencyLevel": "HIGH"
    }
  }'
```

**Expected Console Output:**
```
[DispatchService] Attempt 1: SMS to ... (+19496774418)
[DispatchService] SMS blocked by A2P (30034) — falling back to email-only
[DispatchEngine] Email send failed (non-fatal): ... (if email service not configured)
OR
[DispatchService] Email dispatch (attempt 1): { to: "...", subject: "...", callId: "..." }
```

**Expected Response (if email succeeds):**
```json
{
  "success": true,
  "result": {
    "success": true,
    "callId": "recXXXXXXXXXXXXXX",
    "status": "DISPATCHING",
    "dispatchSuccess": true,
    "channels": {
      "sms": {
        "attempted": true,
        "success": false,
        "errorCode": 30034,
        "error": "Message blocked due to A2P 30034"
      },
      "email": {
        "attempted": true,
        "success": true,
        "method": "EMAIL"
      }
    },
    "onCallPerson": {
      "name": "...",
      "phone": "+19496774418"
    }
  }
}
```

**Expected Response (if email also fails):**
```json
{
  "success": true,
  "result": {
    "success": true,
    "callId": "recXXXXXXXXXXXXXX",
    "status": "DISPATCHING",
    "dispatchSuccess": false,
    "channels": {
      "sms": {
        "attempted": true,
        "success": false,
        "errorCode": 30034,
        "error": "Message blocked due to A2P 30034"
      },
      "email": {
        "attempted": true,
        "success": false,
        "error": "Email service not configured"
      }
    }
  }
}
```

**Key Behaviors:**
- API always returns `success: true` (request succeeded)
- `dispatchSuccess: true` only if at least one channel (SMS or email) succeeded
- Email dispatch runs automatically when SMS fails with 30034
- Status remains `DISPATCHING` if roster was matched (even if all channels failed)
- No crashes or exceptions - all errors are handled gracefully
