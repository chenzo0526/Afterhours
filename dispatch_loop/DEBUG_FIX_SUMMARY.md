# SMS Debugging Fix - Summary

## Code Changes Summary

### 1. Added Comprehensive Logging
- `[RETELL] call-ended received` - Entry point log
- `[RETELL] body keys:` - Shows all keys in request body
- `[RETELL] vars extracted from:` - Shows which source was used (call.variables, metadata, etc.)
- `[RETELL] vars keys:` - Shows keys found in vars
- `[RETELL] vars content:` - Full JSON dump of extracted variables
- `[RETELL] OWNER_PHONE_NUMBER:` - Masked phone number (last 2 digits)
- `[RETELL] TWILIO_PHONE_NUMBER:` - Masked phone number (last 2 digits)
- `[RETELL] Attempting to send SMS...` - Before SMS attempt
- `[RETELL] SMS sent successfully` - Success confirmation
- `[TWILIO] send failed` - Error header
- `[TWILIO] status/code/message/moreInfo` - Detailed error info

### 2. Fixed Variable Extraction
- Uses nullish coalescing (`??`) to check sources in order:
  1. `body.call?.variables`
  2. `body.metadata`
  3. `body.custom_variables`
  4. `body.variables`
  5. `{}` (empty object fallback)
- Supports both snake_case and camelCase naming:
  - `customer_name` / `customerName`
  - `service_address` / `serviceAddress`
  - `callback_number` / `callbackNumber`
  - `issue_type` / `issueType` / `issue`
  - `access_notes` / `accessNotes` / `access`

### 3. SMS Always Sends
- SMS is sent even if all variables are missing (shows "Unclear" for missing fields)
- Format: `📞 New after-hours call received. Name: X | Issue: Y | Address: Z | Callback: N | Urgency: U | Access: A`
- Only fails if `OWNER_PHONE_NUMBER` or `TWILIO_PHONE_NUMBER` are missing

### 4. Enhanced Error Handling
- Twilio errors are caught and logged with full details
- Webhook always returns 200 (errors logged but don't fail the response)
- All errors include status, code, message, and moreInfo

### 5. New Debug Endpoint
- `POST /debug/send-test-sms` - Tests SMS sending independently
- Returns JSON with success/failure status
- Includes same logging as main handler

---

## Code Diff

### Key Changes in `/webhooks/retell/call-ended`:

**Before:**
- Complex nested variable extraction
- Limited logging
- Could fail silently

**After:**
- Simple nullish coalescing chain for variable extraction
- Extensive `[RETELL]` and `[TWILIO]` prefixed logging
- Always attempts SMS send (unless env vars missing)
- Phone numbers masked in logs (last 2 digits shown)
- Clear error logging with all Twilio error details

### New Helper Functions:
- `maskPhone()` - Masks phone numbers for logging (shows last 2 digits)
- Updated `extractVar()` - Supports snake_case and camelCase with case-insensitive fallback

### New Endpoint:
- `POST /debug/send-test-sms` - Standalone SMS test endpoint

---

## Terminal Commands

### 1. Stop Current Server
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or if running in terminal, use Ctrl+C
```

### 2. Navigate and Start Server
```bash
cd ~/Project_Vault/Afterhours/dispatch_loop
node index.js
```

You should see:
```
Dispatch loop running on port 3000
```

### 3. Test Debug Endpoint (a)
```bash
curl -X POST http://localhost:3000/debug/send-test-sms
```

**Expected Response:**
```json
{"success":true,"sid":"SM..."}
```

**Expected Console Output:**
```
[DEBUG] send-test-sms endpoint hit
[DEBUG] OWNER_PHONE_NUMBER: ***90
[DEBUG] TWILIO_PHONE_NUMBER: ***67
[DEBUG] SMS sent successfully. SID: SM...
```

### 4. Test Retell Webhook Locally (b)
```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "call_id": "test_call_12345",
      "from_number": "+15551234567",
      "variables": {
        "customer_name": "John Smith",
        "service_address": "123 Main Street",
        "service_unit": "Apt 4B",
        "callback_number": "+15559876543",
        "issue_type": "Burst pipe in kitchen",
        "urgency": "High",
        "access_notes": "Side door unlocked, code 1234"
      }
    }
  }'
```

**Expected Response:**
```
200 OK
```

**Expected Console Output:**
```
[RETELL] call-ended received
[RETELL] body keys: [ 'call' ]
[RETELL] vars extracted from: call.variables
[RETELL] vars keys: [ 'customer_name', 'service_address', 'service_unit', 'callback_number', 'issue_type', 'urgency', 'access_notes' ]
[RETELL] vars content: {
  "customer_name": "John Smith",
  "service_address": "123 Main Street",
  "service_unit": "Apt 4B",
  "callback_number": "+15559876543",
  "issue_type": "Burst pipe in kitchen",
  "urgency": "High",
  "access_notes": "Side door unlocked, code 1234"
}
[RETELL] OWNER_PHONE_NUMBER: ***90
[RETELL] TWILIO_PHONE_NUMBER: ***67
[RETELL] Attempting to send SMS to ***90...
[RETELL] SMS sent successfully. SID: SM..., CallID: test_call_12345
```

### 5. Test via ngrok (c)
First, get your ngrok URL:
```bash
# In another terminal, if ngrok is running:
curl http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep https | cut -d'"' -f4

# Or check ngrok web interface at http://localhost:4040
```

Then test:
```bash
curl -X POST https://YOUR-NGROK-ID.ngrok-free.dev/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "call_id": "test_call_67890",
      "from_number": "+15551111111",
      "variables": {
        "customerName": "Jane Doe",
        "serviceAddress": "456 Oak Avenue",
        "apartment": "Unit 5",
        "callbackNumber": "this number",
        "issue": "No hot water",
        "urgency": "Medium",
        "accessNotes": "Ring doorbell twice"
      }
    }
  }'
```

**Expected:** Same console output as local test, SMS should arrive.

---

## Troubleshooting Checklist

### If SMS Not Received:

1. **Check Console Logs:**
   - Look for `[RETELL] call-ended received` - confirms webhook was hit
   - Check `[RETELL] vars extracted from:` - confirms variables were found
   - Check `[RETELL] OWNER_PHONE_NUMBER:` - confirms phone number is set
   - Check `[RETELL] Attempting to send SMS...` - confirms send attempt started

2. **Check for Errors:**
   - Look for `[TWILIO] send failed` - indicates Twilio error
   - Check `[TWILIO] status/code/message` - shows specific error details
   - Look for `OWNER_PHONE_NUMBER not configured` - env var missing

3. **Verify Environment Variables:**
   ```bash
   cd ~/Project_Vault/Afterhours/dispatch_loop
   cat .env | grep -E "(OWNER_PHONE|TWILIO)"
   ```

4. **Test Debug Endpoint First:**
   ```bash
   curl -X POST http://localhost:3000/debug/send-test-sms
   ```
   If this works, SMS sending is functional. If not, check Twilio credentials.

5. **Check ngrok Status:**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```
   Verify ngrok is running and forwarding to port 3000.

---

## Expected Log Flow

### Successful SMS Send:
```
[RETELL] call-ended received
[RETELL] body keys: [ 'call' ]
[RETELL] vars extracted from: call.variables
[RETELL] vars keys: [ 'customer_name', ... ]
[RETELL] vars content: { ... }
[RETELL] OWNER_PHONE_NUMBER: ***90
[RETELL] TWILIO_PHONE_NUMBER: ***67
[RETELL] Attempting to send SMS to ***90...
[RETELL] SMS sent successfully. SID: SM1234567890, CallID: test_call_12345
```

### Failed SMS Send (Twilio Error):
```
[RETELL] call-ended received
[RETELL] body keys: [ 'call' ]
[RETELL] vars extracted from: call.variables
[RETELL] vars keys: [ 'customer_name', ... ]
[RETELL] vars content: { ... }
[RETELL] OWNER_PHONE_NUMBER: ***90
[RETELL] TWILIO_PHONE_NUMBER: ***67
[RETELL] Attempting to send SMS to ***90...
[TWILIO] send failed
[TWILIO] status: 400
[TWILIO] code: 21211
[TWILIO] message: Invalid 'To' Phone Number
[TWILIO] moreInfo: https://www.twilio.com/docs/errors/21211
```

### Missing Environment Variable:
```
[RETELL] call-ended received
[RETELL] body keys: [ 'call' ]
[RETELL] vars extracted from: call.variables
[RETELL] vars keys: [ 'customer_name', ... ]
[RETELL] vars content: { ... }
[RETELL] OWNER_PHONE_NUMBER: NOT SET
[RETELL] OWNER_PHONE_NUMBER not configured - SMS NOT SENT
```

---

## Next Steps

1. Restart server with new code
2. Test debug endpoint first to verify SMS works
3. Test Retell webhook locally
4. Test via ngrok to simulate real Retell webhook
5. Check console logs to see exactly what's happening
6. If SMS still doesn't arrive, check Twilio error logs for specific error codes

