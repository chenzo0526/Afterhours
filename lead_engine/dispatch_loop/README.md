# Dispatch Loop - MVP Automation

MVP automation loop for Retell call completion: receives call end webhooks, sends SMS to business owner, and routes owner replies (YES/TOMORROW/CALL).

## Quick Start

### 1. Install Dependencies

```bash
cd lead_engine/dispatch_loop
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1234567890)
- `OWNER_PHONE_NUMBER` - Business owner's phone number (receives SMS summaries)
- `ON_CALL_PLUMBER_NUMBER` - On-call plumber's phone number (receives dispatch SMS)

### 3. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3000 (or the port specified in `PORT` env var).

### 4. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-07T23:00:00.000Z"}
```

## Webhook Setup

### Retell Webhook Configuration

1. Log in to your Retell dashboard
2. Navigate to your agent settings
3. Find "Webhooks" or "Call End Webhook" configuration
4. Set the webhook URL to: `https://your-domain.com/webhooks/retell/call-ended`
   - For local testing, use ngrok: `ngrok http 3000`
   - Use the ngrok HTTPS URL: `https://your-ngrok-id.ngrok.io/webhooks/retell/call-ended`

5. Configure webhook to trigger on call completion/end events

**Expected Retell Webhook Payload:**
The endpoint expects a JSON payload with the following structure (common Retell fields):
```json
{
  "call_id": "abc123",
  "from_number": "+1234567890",
  "to_number": "+0987654321",
  "direction": "inbound",
  "end_reason": "completed",
  "transcript": "...",
  "metadata": {
    "customer_name": "John Doe",
    "callback_number": "+1234567890",
    "service_address": "123 Main St",
    "issue_type": "Leaky faucet",
    "urgency": "High",
    "access_notes": "Side door unlocked"
  }
}
```

### Twilio SMS Webhook Configuration

1. Log in to your Twilio Console
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Click on your Twilio phone number
4. Scroll to "Messaging" section
5. Under "A MESSAGE COMES IN", set the webhook URL to: `https://your-domain.com/webhooks/twilio/sms`
   - For local testing: `https://your-ngrok-id.ngrok.io/webhooks/twilio/sms`
6. Select "HTTP POST" as the method
7. Save the configuration

## How It Works

### Flow Overview

1. **Call Ends** → Retell sends webhook to `/webhooks/retell/call-ended`
2. **SMS to Owner** → System extracts call data and sends SMS to business owner
3. **Owner Replies** → Owner sends SMS reply (YES/TOMORROW/CALL)
4. **Routing** → System processes reply:
   - **YES**: SMS plumber with call details
   - **TOMORROW**: Create follow-up entry, SMS confirmation
   - **CALL**: Ask for timing (NOW/LATER), store schedule, SMS confirmation

### Owner SMS Format

When a call ends, the owner receives:
```
New after-hours call.
Name: {CustomerName}
Phone: {CallbackNumber}
Address: {ServiceAddress}
Issue: {IssueType}
Urgency: {Urgency}
Access: {AccessNotes}
Reply: YES / TOMORROW / CALL
CallID: {CallId}
```

### Reply Parsing

The system accepts these variations:

**YES (Dispatch):**
- YES
- Y
- DISPATCH

**TOMORROW (Schedule):**
- TOMORROW
- TMR
- LATER

**CALL (Schedule Call):**
- CALL
- CONNECT
- CALL NOW
- CALL LATER HH:MM (e.g., CALL LATER 14:30)

### Database Schema

The system uses SQLite with three tables:

- **calls**: Stores call records from Retell webhooks
- **owner_replies**: Stores owner SMS replies and parsing results
- **follow_ups**: Stores scheduled follow-ups (tomorrow/call later)

Database file: `dispatch.db` (created automatically in the same directory)

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-07T23:00:00.000Z"
}
```

### POST /webhooks/retell/call-ended
Receives Retell webhook when a call ends.

**Request Body:** Retell webhook JSON payload

**Response:**
```json
{
  "success": true,
  "call_id": "abc123",
  "sms_sid": "SM1234567890"
}
```

### POST /webhooks/twilio/sms
Receives Twilio SMS webhook when owner replies.

**Request Body:** Twilio SMS webhook form data

**Response:** TwiML XML (empty response, handles via async SMS)

## Local Testing with ngrok

1. Start the server:
```bash
npm run dev
```

2. In another terminal, start ngrok:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)

4. Configure webhooks:
   - Retell: `https://abc123.ngrok.io/webhooks/retell/call-ended`
   - Twilio: `https://abc123.ngrok.io/webhooks/twilio/sms`

5. Test with curl commands (see below)

## Testing with cURL

### Test Retell Webhook Endpoint

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

Expected response:
```json
{
  "success": true,
  "call_id": "test_call_123",
  "sms_sid": "SM..."
}
```

### Test Twilio SMS Webhook (Simulate Owner Reply)

```bash
curl -X POST http://localhost:3000/webhooks/twilio/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551111111&Body=YES&MessageSid=SM1234567890"
```

## Safety Features

- **Missing Fields**: If call data fields are missing, displays "Unclear" instead of guessing
- **No Claims**: Never claims someone is dispatched. Only notifies via SMS.
- **Error Handling**: Graceful error handling with console logging
- **Status Tracking**: All operations tracked in database with status fields

## Troubleshooting

### SMS Not Sending
- Verify Twilio credentials are correct in `.env`
- Check Twilio account has sufficient credits
- Verify phone numbers are in E.164 format (+1234567890)

### Webhook Not Receiving
- Ensure server is running and accessible
- For local testing, use ngrok and verify HTTPS URL is set in Retell/Twilio
- Check server logs for incoming requests

### Database Errors
- Ensure write permissions in the directory
- Check `dispatch.db` file is not locked by another process

## Next Steps

- Add authentication/verification for webhooks
- Implement actual follow-up scheduling logic
- Add retry logic for failed SMS
- Add admin dashboard to view calls and replies
- Implement call logging and analytics

