# Test cURL Commands for Local Testing

## Test Retell Webhook Endpoint Locally

### Basic Test (with metadata)
```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_call_123",
    "from_number": "+15551234567",
    "to_number": "+15559876543",
    "direction": "inbound",
    "end_reason": "completed",
    "transcript": "Customer name is John Doe. Address is 123 Main St. Issue is leaky faucet.",
    "metadata": {
      "customer_name": "John Doe",
      "callback_number": "+15551234567",
      "service_address": "123 Main St, Anytown, ST 12345",
      "issue_type": "Leaky faucet",
      "urgency": "High",
      "access_notes": "Side door unlocked, ring doorbell"
    }
  }'
```

### Minimal Test (call_id only - will use "Unclear" for missing fields)
```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_call_minimal_456"
  }'
```

### Test with custom_variables (alternative metadata format)
```bash
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_call_custom_789",
    "from_number": "+15559876543",
    "custom_variables": {
      "customer_name": "Jane Smith",
      "callback_number": "+15559876543",
      "service_address": "456 Oak Ave, City, ST 54321",
      "issue_type": "Burst pipe",
      "urgency": "Emergency",
      "access_notes": "Back gate, code 1234"
    }
  }'
```

## Test Twilio SMS Webhook (Simulate Owner Reply)

### Owner replies "YES" (Dispatch)
```bash
curl -X POST http://localhost:3000/webhooks/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551111111&Body=YES&MessageSid=SM1234567890"
```

### Owner replies "TOMORROW" (Schedule)
```bash
curl -X POST http://localhost:3000/webhooks/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551111111&Body=TOMORROW&MessageSid=SM1234567891"
```

### Owner replies "CALL" (Request call)
```bash
curl -X POST http://localhost:3000/webhooks/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551111111&Body=CALL&MessageSid=SM1234567892"
```

### Owner replies "CALL NOW"
```bash
curl -X POST http://localhost:3000/webhooks/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551111111&Body=CALL%20NOW&MessageSid=SM1234567893"
```

### Owner replies "CALL LATER 14:30"
```bash
curl -X POST http://localhost:3000/webhooks/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551111111&Body=CALL%20LATER%2014:30&MessageSid=SM1234567894"
```

## Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-08T18:00:00.000Z"}
```

## Quick Test Sequence

1. Start server: `npm run dev` (in dispatch_loop directory)
2. Test health: `curl http://localhost:3000/health`
3. Test Retell webhook (basic): Use first curl command above
4. Check owner received SMS (if env vars configured)
5. Test owner reply (YES): Use first Twilio SMS curl command above
6. Check plumber received SMS (if env vars configured)

