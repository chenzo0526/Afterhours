# Environment Variables & Webhook Endpoints Analysis

## Section 1: Environment Variables

### PORT
- Controls the server port number (defaults to 3000 if not set)

### TWILIO_ACCOUNT_SID
- Twilio Account SID for API authentication

### TWILIO_AUTH_TOKEN
- Twilio Auth Token for API authentication

### TWILIO_PHONE_NUMBER
- Twilio phone number used as the "from" number for all outgoing SMS messages

### OWNER_PHONE_NUMBER
- Business owner's phone number that receives SMS summaries when calls end

### ON_CALL_PLUMBER_NUMBER
- On-call plumber's phone number that receives dispatch SMS when owner replies "YES"

---

## Section 2: Required Variables by Function

### Sending SMS to Business Owner
- **TWILIO_ACCOUNT_SID** (required)
- **TWILIO_AUTH_TOKEN** (required)
- **TWILIO_PHONE_NUMBER** (required)
- **OWNER_PHONE_NUMBER** (required - server returns 500 error if missing)

### Receiving Owner Replies (YES / CALL / TOMORROW)
- **TWILIO_ACCOUNT_SID** (required - for sending confirmation SMS)
- **TWILIO_AUTH_TOKEN** (required - for sending confirmation SMS)
- **TWILIO_PHONE_NUMBER** (required - for sending confirmation SMS)
- Note: The webhook endpoint itself doesn't require env vars, but processing replies requires Twilio credentials to send confirmation messages

### Triggering Plumber Notification
- **TWILIO_ACCOUNT_SID** (required)
- **TWILIO_AUTH_TOKEN** (required)
- **TWILIO_PHONE_NUMBER** (required)
- **ON_CALL_PLUMBER_NUMBER** (required - server sends error SMS to owner if missing)

---

## Section 3: Webhook Endpoints

### Retell Call-Ended Events
- **Path:** `POST /webhooks/retell/call-ended`
- **Content-Type:** `application/json`
- **Expected Payload:** JSON with `call_id`, `metadata` (or `custom_variables`), and optional `transcript`

### Twilio Inbound SMS
- **Path:** `POST /webhooks/twilio/sms`
- **Content-Type:** `application/x-www-form-urlencoded`
- **Expected Payload:** Twilio webhook form data with `From`, `Body`, and `MessageSid` fields

### Health Check
- **Path:** `GET /health`
- **Response:** JSON with `status: "ok"` and `timestamp`

