# SMS Webhook Fix - Execution Summary

## A) Files Changed

1. **dispatch_loop/index.js** - Enhanced with logging and error handling
2. **dispatch_loop/test-webhook.sh** - Created test script

---

## B) Code Added/Changed

### 1. Enhanced Debug Endpoint (`POST /debug/send-test-sms`)
```javascript
app.post('/debug/send-test-sms', async (req, res) => {
  console.log('[DEBUG SMS] Route hit');
  
  const ownerPhone = process.env.OWNER_PHONE_NUMBER;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  
  console.log('[DEBUG SMS] OWNER_PHONE_NUMBER:', maskPhone(ownerPhone));
  console.log('[DEBUG SMS] TWILIO_PHONE_NUMBER:', maskPhone(twilioPhone));
  
  try {
    const msg = await client.messages.create({
      from: twilioPhone,
      to: ownerPhone,
      body: '✅ DEBUG: dispatch_loop SMS pipeline is working'
    });
    console.log('[DEBUG SMS] DEBUG SMS SENT - SID:', msg.sid);
    res.json({ ok: true, sid: msg.sid });
  } catch (e) {
    console.error('[DEBUG SMS] FAILED - code:', e.code);
    console.error('[DEBUG SMS] FAILED - message:', e.message);
    console.error('[DEBUG SMS] FAILED - status:', e.status);
    console.error('[DEBUG SMS] FAILED - full error:', JSON.stringify(e, null, 2));
    res.status(500).json({ error: e.message, code: e.code, status: e.status });
  }
});
```

### 2. Enhanced Retell Webhook (`POST /webhooks/retell/call-ended`)
```javascript
app.post('/webhooks/retell/call-ended', async (req, res) => {
  console.log('[RETELL] ========== CALL-ENDED WEBHOOK HIT ==========');
  console.log('[RETELL] req.body keys:', Object.keys(req.body || {}));
  
  // Return 200 immediately
  res.sendStatus(200);
  
  // Process SMS async
  (async () => {
    try {
      const body = req.body || {};
      
      // Extract vars from multiple sources
      let vars = {};
      let varSource = 'none';
      
      if (body.call?.variables) {
        vars = body.call.variables;
        varSource = 'call.variables';
      } else if (body.metadata) {
        vars = body.metadata;
        varSource = 'metadata';
      } else if (body.custom_variables) {
        vars = body.custom_variables;
        varSource = 'custom_variables';
      } else if (body.variables) {
        vars = body.variables;
        varSource = 'variables';
      }
      
      console.log('[RETELL] vars extracted from:', varSource);
      console.log('[RETELL] vars keys:', Object.keys(vars));
      console.log('[RETELL] vars content:', JSON.stringify(vars, null, 2));
      
      const ownerPhone = process.env.OWNER_PHONE_NUMBER;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      
      console.log('[RETELL] TWILIO CREATE PARAMS:');
      console.log('[RETELL]   from:', maskPhone(twilioPhone));
      console.log('[RETELL]   to:', maskPhone(ownerPhone));
      
      if (!ownerPhone || !twilioPhone) {
        console.error('[RETELL] MISSING ENV VARS - OWNER:', !!ownerPhone, 'TWILIO:', !!twilioPhone);
        return;
      }
      
      const message = `📞 After-hours call
Name: ${vars.customer_name || 'Unknown'}
Issue: ${vars.issue_type || vars.issue || 'Unclear'}
Address: ${vars.service_address || 'Unclear'}
Callback: ${vars.callback_number || 'Unknown'}`;
      
      console.log('[RETELL] Attempting SMS send...');
      
      try {
        const msg = await client.messages.create({
          from: twilioPhone,
          to: ownerPhone,
          body: message
        });
        
        console.log('[RETELL] ========== SMS SENT SUCCESSFULLY ==========');
        console.log('[RETELL] SID:', msg.sid);
        console.log('[RETELL] Status:', msg.status);
      } catch (twilioErr) {
        console.error('[RETELL] ========== TWILIO SMS FAILED ==========');
        console.error('[RETELL] code:', twilioErr?.code);
        console.error('[RETELL] message:', twilioErr?.message);
        console.error('[RETELL] status:', twilioErr?.status);
        console.error('[RETELL] moreInfo:', twilioErr?.moreInfo);
        console.error('[RETELL] full error:', JSON.stringify(twilioErr, null, 2));
      }
    } catch (err) {
      console.error('[RETELL] ========== WEBHOOK PROCESSING ERROR ==========');
      console.error('[RETELL] error:', err.message);
      console.error('[RETELL] stack:', err.stack);
    }
  })();
});
```

### 3. Helper Function (moved to top)
```javascript
// Helper: Mask phone number (show last 2 digits)
function maskPhone(phone) {
  if (!phone) return 'NOT SET';
  const str = String(phone);
  if (str.length <= 2) return str;
  return '***' + str.slice(-2);
}
```

---

## C) Exact Terminal Commands

### 1. Install Dependencies (if needed)
```bash
cd ~/Project_Vault/Afterhours/dispatch_loop
npm install
```

### 2. Start Server
```bash
cd ~/Project_Vault/Afterhours/dispatch_loop
node index.js
```

You should see:
```
Dispatch loop running on port 3000
```

### 3. Test Debug Endpoint (in another terminal)
```bash
curl -X POST http://localhost:3000/debug/send-test-sms
```

### 4. Test Retell Webhook Locally
```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "call_id": "test_123",
      "variables": {
        "customer_name": "John Doe",
        "issue_type": "Burst pipe",
        "service_address": "123 Main St",
        "callback_number": "+15551234567"
      }
    }
  }'
```

### 5. Alternative: Run Test Script
```bash
cd ~/Project_Vault/Afterhours/dispatch_loop
./test-webhook.sh
```

---

## D) Expected Terminal Output on Success

### When Debug Endpoint is Hit:
```
[DEBUG SMS] Route hit
[DEBUG SMS] OWNER_PHONE_NUMBER: ***90
[DEBUG SMS] TWILIO_PHONE_NUMBER: ***67
[DEBUG SMS] DEBUG SMS SENT - SID: SM1234567890abcdef
```

**Response:**
```json
{"ok":true,"sid":"SM1234567890abcdef"}
```

### When Retell Webhook is Hit:
```
[RETELL] ========== CALL-ENDED WEBHOOK HIT ==========
[RETELL] req.body keys: [ 'call' ]
[RETELL] vars extracted from: call.variables
[RETELL] vars keys: [ 'customer_name', 'issue_type', 'service_address', 'callback_number' ]
[RETELL] vars content: {
  "customer_name": "John Doe",
  "issue_type": "Burst pipe",
  "service_address": "123 Main St",
  "callback_number": "+15551234567"
}
[RETELL] TWILIO CREATE PARAMS:
[RETELL]   from: ***67
[RETELL]   to: ***90
[RETELL] Attempting SMS send...
[RETELL] ========== SMS SENT SUCCESSFULLY ==========
[RETELL] SID: SM1234567890abcdef
[RETELL] Status: queued
```

**Response:**
```
200 OK
```

### If Twilio Fails:
```
[RETELL] ========== TWILIO SMS FAILED ==========
[RETELL] code: 21211
[RETELL] message: Invalid 'To' Phone Number
[RETELL] status: 400
[RETELL] moreInfo: https://www.twilio.com/docs/errors/21211
[RETELL] full error: {
  "code": 21211,
  "message": "Invalid 'To' Phone Number",
  "status": 400,
  ...
}
```

---

## Key Features

✅ **Debug endpoint** - Tests SMS independently  
✅ **Loud logging** - Every step is logged with clear prefixes  
✅ **Unconditional SMS** - Always attempts to send (unless env vars missing)  
✅ **Fast response** - Returns 200 immediately, processes async  
✅ **Robust var extraction** - Checks 4 different locations  
✅ **Error handling** - Full Twilio error details logged  
✅ **Phone masking** - Shows last 2 digits for security  

---

## Troubleshooting

If SMS doesn't send:
1. Check console logs for `[RETELL]` or `[DEBUG SMS]` prefixes
2. Verify `OWNER_PHONE_NUMBER` and `TWILIO_PHONE_NUMBER` are set in `.env`
3. Check Twilio error codes in logs
4. Test debug endpoint first to isolate issue
5. Verify Twilio credentials are correct

