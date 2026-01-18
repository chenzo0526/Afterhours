# Twilio Debug Commands

Exact Twilio CLI commands for debugging your after-hours plumbing dispatcher integration.

## Prerequisites

Install Twilio CLI and authenticate:
```bash
# Install Twilio CLI (if not already installed)
brew install twilio/tap/twilio

# Or using npm
npm install -g twilio-cli

# Authenticate
twilio login
# Enter your Account SID and Auth Token when prompted
```

## List Recent Calls to Your Number

Get the last 10 calls to your Twilio phone number:

```bash
# List recent calls (default: last 20)
twilio api:core:calls:list --limit 10

# Filter by your phone number (use E.164 format)
twilio api:core:calls:list --to "+1234567890" --limit 10

# Filter by incoming calls only
twilio api:core:calls:list --to "+1234567890" --limit 10 | grep "inbound"

# Include more details (JSON output)
twilio api:core:calls:list --to "+1234567890" --limit 10 --properties sid,status,from,to,duration,start-time
```

**Expected Output**:
```
SID                                  Status    From              To                Duration
CA1234567890abcdef1234567890abcdef   completed +15551234567     +1234567890       00:01:23
CA2345678901bcdef1234567890abcdef    failed    +15559876543     +1234567890       00:00:05
```

## Fetch a Call by SID

Get detailed information about a specific call:

```bash
# Replace CA1234567890abcdef1234567890abcdef with actual Call SID
twilio api:core:calls:fetch --sid CA1234567890abcdef1234567890abcdef

# Get detailed JSON output
twilio api:core:calls:fetch --sid CA1234567890abcdef1234567890abcdef --properties sid,status,from,to,duration,start-time,price,price-unit,uri
```

**What to Look For**:
- `status`: Should be "completed", "no-answer", "busy", "failed", or "canceled"
- `duration`: How long the call lasted (in seconds)
- `price`: Cost of the call
- `uri`: Full API endpoint for this call

## View Incoming Number Voice URL/Configuration

Check what webhook URL your Twilio number is configured to use:

```bash
# List all your phone numbers
twilio api:core:incoming-phone-numbers:list

# Get details for a specific number (by phone number)
twilio api:core:incoming-phone-numbers:list --phone-number "+1234567890"

# Get full configuration including voice URL
twilio api:core:incoming-phone-numbers:list --phone-number "+1234567890" --properties sid,phone-number,voice-url,voice-method,status-callback,status-callback-method
```

**Expected Output**:
```
SID                                  Phone Number   Voice URL                                    Voice Method
PN1234567890abcdef1234567890abcdef  +1234567890    https://api.retellai.com/twilio/your-agent   POST
```

## Common Twilio CLI Aliases (Faster)

Create these aliases in your shell config (`~/.zshrc` or `~/.bashrc`):

```bash
# List recent calls
alias twilio-calls='twilio api:core:calls:list --limit 10'

# Get call details
alias twilio-call='twilio api:core:calls:fetch --sid'

# List phone numbers
alias twilio-numbers='twilio api:core:incoming-phone-numbers:list'

# Check number config
alias twilio-number-config='twilio api:core:incoming-phone-numbers:list --phone-number'
```

Then reload: `source ~/.zshrc`

Usage:
```bash
twilio-calls
twilio-call CA1234567890abcdef1234567890abcdef
twilio-number-config "+1234567890"
```

## View Call Logs/Recordings (If Enabled)

```bash
# List recordings for a call
twilio api:core:recordings:list --call-sid CA1234567890abcdef1234567890abcdef

# Download a recording (if available)
twilio api:core:recordings:fetch --sid RE1234567890abcdef1234567890abcdef
```

## Common "Application Error" Causes

If you see "Application Error" in Twilio call status, check these in order:

### 1. Voice URL Not Reachable
**Symptom**: Call fails immediately with "Application Error"
**Check**:
```bash
# Verify the voice URL is correct
twilio api:core:incoming-phone-numbers:list --phone-number "+1234567890" --properties voice-url

# Test the URL manually
curl -X POST https://your-voice-url.com/endpoint
# Should return TwiML (XML) response, not HTML or JSON error
```

**Fix**: 
- Ensure Retell webhook URL is correct (should be something like `https://api.retellai.com/twilio/[agent-id]`)
- Verify the URL accepts POST requests
- Check if URL requires authentication (Retell usually provides auth in the URL)

### 2. Invalid TwiML Response
**Symptom**: Call connects but fails after first prompt
**Check**:
- Voice URL must return valid TwiML XML
- Response should start with `<Response>` and end with `</Response>`
- Common TwiML elements: `<Say>`, `<Gather>`, `<Hangup>`, `<Dial>`

**Fix**:
- If using Retell directly, this should be handled automatically
- If using custom webhook, ensure your endpoint returns proper TwiML

### 3. HTTP Status Code Error
**Symptom**: Call fails with 500, 404, or other HTTP error
**Check**:
```bash
# Test the endpoint
curl -v -X POST https://your-voice-url.com/endpoint
# Look for HTTP status code in response
```

**Fix**:
- Retell endpoint should return 200 OK
- Check Retell dashboard for agent status
- Verify Retell agent is published and active

### 4. Timeout Issues
**Symptom**: Call connects but times out waiting for response
**Check**:
- Voice URL must respond within 5 seconds (Twilio timeout)
- Retell should respond quickly, but verify agent is not overloaded

**Fix**:
- Check Retell dashboard for latency issues
- Verify your server/webhook can respond quickly
- Consider using async responses if processing takes time

### 5. Authentication/Authorization Issues
**Symptom**: 401 or 403 errors
**Check**:
- Verify Retell webhook URL includes proper authentication token
- Check if Twilio credentials are correct

**Fix**:
- Regenerate Retell webhook URL if token expired
- Verify Twilio Auth Token is current

### 6. Account Credit/Payment Issues
**Symptom**: Calls fail with payment-related errors
**Check**:
```bash
# Check account balance
twilio api:core:accounts:fetch --sid $(twilio api:core:accounts:list --properties sid --no-header | head -n 1)
```

**Fix**:
- Add credits to Twilio account
- Verify payment method is active

## Quick Debugging Workflow

When a call fails, run these in order:

```bash
# 1. Check recent calls
twilio api:core:calls:list --limit 5

# 2. Get details on the failed call
twilio api:core:calls:fetch --sid [CALL_SID_FROM_STEP_1]

# 3. Verify number configuration
twilio api:core:incoming-phone-numbers:list --phone-number "+1234567890" --properties voice-url,voice-method

# 4. Test the voice URL
curl -v -X POST [VOICE_URL_FROM_STEP_3]

# 5. Check Retell dashboard
# Go to: https://dashboard.retellai.com → Your Agent → Calls → View failed call
```

## Integration-Specific Checks (Retell)

Since you're using Retell, also verify:

```bash
# Retell webhook URL format should be:
# https://api.retellai.com/twilio/[AGENT_ID]?api_key=[API_KEY]

# Check if your number points to Retell
twilio api:core:incoming-phone-numbers:list --phone-number "+1234567890" | grep retellai

# If not, you may need to update it in Retell dashboard
# Go to: Retell Dashboard → Your Agent → Phone Numbers → Update Configuration
```

## Getting Help

If issues persist:
1. Check Retell logs: Dashboard → Agent → Calls → View logs
2. Check Twilio logs: Twilio Console → Monitor → Logs → Errors
3. Compare working vs. failing call SIDs
4. Test with Twilio's test number first: `+15005550006` (Echo test)

