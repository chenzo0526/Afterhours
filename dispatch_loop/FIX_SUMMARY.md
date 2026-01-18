# Retell Webhook Fix Summary

## Changes Made

### Updated Handler: `/webhooks/retell/call-ended`

**Key Improvements:**
1. ✅ Returns 200 immediately (processes async after response)
2. ✅ Extracts variables from multiple locations:
   - `req.body.call.variables`
   - `req.body.call.custom_variables`
   - `req.body.custom_variables`
   - `req.body.metadata`
   - `req.body` (top-level keys)
3. ✅ Robust field extraction with fallbacks:
   - `customer_name` (with CustomerName, name, customer fallbacks)
   - `service_address` (with ServiceAddress, address fallbacks)
   - `service_unit` (supports apartment, unit, apt variations)
   - `callback_number` (with fallback to call.from_number if "this number")
   - `issue_type` or `issue`
   - `urgency`
   - `access_notes`
4. ✅ Extensive logging:
   - Logs all body keys
   - Logs extracted variables (JSON)
   - Logs owner phone number
   - Detailed Twilio error logging
5. ✅ Proper SMS format matching requirements
6. ✅ Twilio SMS endpoint unchanged

---

## Code Changes

### Added Helper Functions:
- `extractVar()` - Extracts variables with case-insensitive matching and fallbacks
- `safeField()` - Returns "Unclear" for missing/null values

### Updated Handler:
- Returns 200 immediately
- Processes SMS sending asynchronously after response
- Extracts from 5 possible variable locations
- Builds proper SMS summary format
- Comprehensive error logging

---

## Restart Commands

### Stop Current Server
```bash
# Find and kill the running process
lsof -ti:3000 | xargs kill -9

# Or if using PM2/nodemon, stop it with Ctrl+C
```

### Start Server
```bash
cd /Users/vincenzoricco/Project_Vault/Afterhours/dispatch_loop
node index.js
```

### Or with nodemon (if installed):
```bash
cd /Users/vincenzoricco/Project_Vault/Afterhours/dispatch_loop
npx nodemon index.js
```

### Verify Server is Running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-08T..."}
```

---

## Test cURL Command

### Test with `call.variables` structure (Retell format):

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

### Test with `call.custom_variables`:

```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "call_id": "test_call_67890",
      "from_number": "+15551111111",
      "custom_variables": {
        "customer_name": "Jane Doe",
        "service_address": "456 Oak Avenue",
        "apartment": "Unit 5",
        "callback_number": "this number",
        "issue": "No hot water",
        "urgency": "Medium",
        "access_notes": "Ring doorbell twice"
      }
    }
  }'
```

### Test with top-level `custom_variables`:

```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_call_top_level",
    "from_number": "+15552222222",
    "custom_variables": {
      "customer_name": "Bob Johnson",
      "ServiceAddress": "789 Pine Road",
      "unit": "Suite 200",
      "callback_number": "+15553333333",
      "issue_type": "Clogged drain",
      "Urgency": "Low",
      "access_notes": "Front door, no code needed"
    }
  }'
```

---

## Expected Console Output

When the webhook is hit, you should see:

```
RETELL WEBHOOK BODY KEYS: [ 'call' ]
RETELL VARS: {
  "customer_name": "John Smith",
  "service_address": "123 Main Street",
  "service_unit": "Apt 4B",
  "callback_number": "+15559876543",
  "issue_type": "Burst pipe in kitchen",
  "urgency": "High",
  "access_notes": "Side door unlocked, code 1234"
}
SMS TO OWNER: +1234567890
SMS sent successfully. SID: SM..., CallID: test_call_12345
```

If there's an error:
```
TWILIO ERROR: [error message] [error code] [more info]
Full Twilio error: [full error object]
```

---

## Troubleshooting

1. **No SMS received:**
   - Check console logs for "RETELL WEBHOOK BODY KEYS" to see what Retell is sending
   - Check "RETELL VARS" to see what variables were extracted
   - Check "SMS TO OWNER" to verify phone number is set
   - Check for "TWILIO ERROR" messages

2. **Variables not extracted:**
   - Review the "RETELL VARS" log to see what was found
   - Check if Retell is using a different structure than expected
   - The handler checks 5 different locations, so it should catch most formats

3. **Server not responding:**
   - Verify server is running: `curl http://localhost:3000/health`
   - Check if port 3000 is in use: `lsof -i :3000`
   - Verify .env file has all required variables

