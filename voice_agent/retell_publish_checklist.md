# Retell Publish Checklist

Step-by-step guide to publish your after-hours plumbing intake agent in Retell.

## Prerequisites

- Retell account created and logged in
- Twilio account with phone number purchased
- Agent prompt ready (see `agent_prompt.md`)

## Step 1: Create Agent

1. Go to Retell dashboard: https://dashboard.retellai.com
2. Click **"+ Create Agent"** or **"Create New Agent"**
3. Choose **"Voice Agent"** or **"Conversational AI Agent"**
4. Give it a name: "After-Hours Plumbing Intake"

## Step 2: Configure Agent Settings

### Basic Settings
- **Agent Name**: After-Hours Plumbing Intake
- **Language**: English (US)
- **Voice**: Choose a professional, calm voice (e.g., "Bella" or "Nova" for female, "Josh" for male)
- **Speaking Rate**: Normal or slightly slower for clarity

### Advanced Settings
- **Enable Interruptions**: YES (allows caller to interrupt)
- **End Call Silence Timeout**: 3-5 seconds (hangs up if no response)
- **Max Call Duration**: 10 minutes (reasonable for intake calls)

## Step 3: Paste Agent Prompt

1. Navigate to **"Prompt"** or **"System Prompt"** section
2. Open `agent_prompt.md` from your local files
3. Copy the entire contents (excluding the markdown headers if Retell doesn't accept markdown)
4. Paste into the prompt field
5. **Save** the prompt

### Prompt Tips
- Retell may strip markdown formatting—that's okay, the plain text instructions work
- Make sure the safety rules section is clearly visible in the prompt
- The prompt should be 2000-4000 characters (Retell limits vary)

## Step 4: Configure Inbound Settings

### Phone Number Setup
1. Go to **"Phone Numbers"** or **"Inbound"** section
2. Click **"Connect Phone Number"** or **"Add Number"**
3. Choose **"Twilio"** as provider
4. Enter your Twilio credentials:
   - Account SID
   - Auth Token
   - Phone number (E.164 format: +1234567890)

### Webhook URL (If Using Custom Endpoint)
- Leave blank if using Retell's built-in handling
- If you have a custom webhook, enter: `https://your-endpoint.com/retell-webhook`

## Step 5: Test the Agent

1. Click **"Test Call"** or **"Try It Now"** button in Retell dashboard
2. Use your phone number to call the agent
3. Test scenarios:
   - ✅ Active leak (urgent)
   - ✅ Toilet clog (non-urgent)
   - ✅ Gas smell (should hard stop)
   - ✅ Burst pipe (emergency)

### What to Check During Test
- [ ] Agent greets caller properly
- [ ] Safety rules trigger correctly (gas smell → 911 redirect)
- [ ] Agent collects: name, address, callback number, issue, urgency
- [ ] Agent never says "technician dispatched" (only "I'll notify")
- [ ] Agent speaks clearly and doesn't ramble
- [ ] Agent handles interruptions gracefully

## Step 6: Publish Agent

1. After testing, click **"Publish"** or **"Go Live"** button
2. Confirm the phone number is correct
3. Confirm the agent settings are saved
4. Click **"Confirm Publish"** or **"Activate"**

## Step 7: Verify Publish Status

1. Check **"Agent Status"** shows **"Active"** or **"Published"**
2. Verify phone number shows as **"Connected"** and **"Active"**
3. Check dashboard shows **"Live"** badge on your agent

## Step 8: Test Live Agent

1. Call your Twilio number from another phone
2. Verify the call connects to Retell
3. Verify the agent answers and follows the prompt
4. Test a complete call end-to-end

### What to Verify
- [ ] Call connects successfully
- [ ] Agent answers within 2-3 seconds
- [ ] Agent follows conversation flow
- [ ] Information is collected correctly
- [ ] Call ends naturally after completion

## Step 9: Monitor First Calls

1. Go to **"Calls"** or **"Analytics"** section in Retell dashboard
2. Review call logs and transcripts
3. Check for any errors or unexpected behavior
4. Listen to call recordings if available

### Common Issues to Watch For
- Agent not answering → Check phone number configuration
- Agent rambling → Review prompt, may need to add "be concise" emphasis
- Safety rules not triggering → Ensure prompt clearly states safety rules first
- Calls dropping → Check Twilio configuration and network

## Step 10: Connect to Lead Processing (Optional)

If you have a webhook endpoint for lead processing:
1. Go to **"Webhooks"** or **"Integrations"** section
2. Add webhook URL for call completion events
3. Configure webhook to receive:
   - Call transcripts
   - Collected data (name, address, callback, issue, urgency)
   - Call metadata (duration, timestamp, etc.)

## Troubleshooting

### Agent Not Answering Calls
- Check phone number is correct and active in Retell
- Verify Twilio credentials are correct
- Check Twilio number's Voice URL points to Retell endpoint
- Test Twilio number directly first

### Agent Not Following Prompt
- Review prompt in Retell dashboard (may have been truncated)
- Check if markdown formatting broke the prompt
- Add explicit instructions at the top of prompt
- Test with shorter prompt first

### Safety Rules Not Working
- Ensure safety rules are at the top of the prompt
- Make the instructions more explicit: "IF CALLER MENTIONS GAS SMELL, IMMEDIATELY..."
- Test with gas smell scenario multiple times
- Consider adding this as a separate intent handler if Retell supports it

### Calls Dropping Mid-Conversation
- Check Retell call duration limits
- Verify Twilio account has credits
- Check network connectivity
- Review Retell logs for errors

## Next Steps After Publishing

1. Document the Retell Agent ID for future reference
2. Set up monitoring/alerts for failed calls
3. Create a backup agent configuration (export settings)
4. Test weekly to ensure agent is working
5. Update prompt based on real call feedback

