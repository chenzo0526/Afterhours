# Afterhours Voice Agent MVP

Core voice agent system for discovery calls and lead qualification.

## Architecture

The voice agent system consists of:

1. **Call Flows** (`call_flows.py`) - Defines conversation flows for different call types
   - Enhanced with missing data detection
   - Clarifying questions when data is incomplete
   - Graceful failure handling
2. **Intent Detection** (`intent_detector.py`) - Detects user intent from speech/text
3. **State Machine** (`state_machine.py`) - Manages conversation state and routing
   - Enhanced with data completeness checking
   - Clarifying question support
4. **Async Support** (`async_support.py`) - Async/await wrappers for webhook handlers
5. **Integration Adapters** - Ready for Twilio/VAPI/Voiceflow integration
6. **Tests** (`tests/`) - Unit tests for all components

## How a Call Traverses the System

### Outbound Discovery Call Flow

```
1. System initiates call
   └─> start_call(call_id, CallType.OUTBOUND, initial_context)
       └─> Creates CallContext
       └─> Loads OutboundDiscoveryFlow
       └─> Sets initial state: GREETING

2. Agent speaks greeting
   └─> flow.get_next_prompt(GREETING, context)
       └─> Returns: "Hi John, this is Sarah from Afterhours..."

3. User responds
   └─> process_user_input(call_id, "Yes, now is fine")
       └─> intent_detector.detect("Yes, now is fine")
           └─> Returns: Intent.AFFIRMATIVE
       └─> flow.process_response(GREETING, response, context)
           └─> Extracts data
           └─> Transitions to: BUSINESS_DISCOVERY
       └─> flow.get_next_prompt(BUSINESS_DISCOVERY, context)
           └─> Returns: "Great. Let's start with your business..."

4. Conversation continues through states:
   GREETING → BUSINESS_DISCOVERY → OPERATIONS_ASSESSMENT → 
   DECISION_MAKER_CONFIRMATION → TIMELINE_INTEREST → CLOSING → COMPLETED

5. Call ends
   └─> end_call(call_id)
       └─> Returns call summary with all collected data
```

### State Transitions

Each state has:
- A prompt/question to ask
- Fields to collect from responses
- Next possible states
- Timeout handling

The state machine handles:
- Intent detection (opt-out, transfer requests, etc.)
- Entity extraction (emails, phone numbers, industry keywords)
- Context management (maintains conversation history)
- Flow routing (different flows for different call types)

## Integration Points

### Twilio Integration

```python
from voice_agent.state_machine import VoiceAgentStateMachine, TwilioAdapter

sm = VoiceAgentStateMachine()
adapter = TwilioAdapter(sm)

# In Twilio webhook handler:
def handle_twilio_call(request):
    call_sid = request.form['CallSid']
    from_number = request.form['From']
    to_number = request.form['To']
    
    response = adapter.handle_incoming_call(call_sid, from_number, to_number)
    
    # Return TwiML response
    return f"""
    <Response>
        <Say>{response['prompt']}</Say>
        <Gather input="speech" action="/handle-input" />
    </Response>
    """
```

### VAPI Integration

```python
from voice_agent.state_machine import VoiceAgentStateMachine, VAPIAdapter

sm = VoiceAgentStateMachine()
adapter = VAPIAdapter(sm)

# Create call configuration
config = adapter.create_call_config(
    call_id="call_123",
    call_type=CallType.OUTBOUND,
    initial_context={"lead_id": "LEAD_001"}
)

# Use config to create VAPI call
```

### Voiceflow Integration

The state machine can be adapted to Voiceflow by:
1. Exporting flow definitions as JSON
2. Mapping states to Voiceflow nodes
3. Using webhooks for state transitions

## Extension Points

### Adding New Call Flows

1. Create new flow class inheriting from `CallFlow`
2. Implement `_define_states()` method
3. Implement `get_next_prompt()` and `process_response()`
4. Register in `get_flow_for_call_type()`

### Enhancing Intent Detection

Replace `IntentDetector` with:
- OpenAI GPT-4 for better NLP
- Custom trained models
- Hybrid approach (rules + ML)

### Adding Entity Extraction

Enhance `extract_entities()` with:
- Named Entity Recognition (NER)
- Custom entity models
- External APIs (Clearbit, etc.)

## Running the MVP

```bash
# Install dependencies
pip install -r requirements.txt

# Run example
python voice_agent/main.py

# Run tests
python -m pytest voice_agent/tests/
# Or
cd voice_agent && python -m unittest discover tests
```

## New Features (Enhanced Version)

### Missing Data Detection
The system now detects when required data is missing and asks clarifying questions:
- Checks data completeness after each response
- Asks targeted clarifying questions for missing fields
- Limits clarification attempts to avoid loops

### Async Support
Async wrappers for webhook handlers:
```python
from voice_agent.async_support import AsyncVoiceAgent

async_agent = AsyncVoiceAgent()

# In async webhook handler
result = await async_agent.process_user_input_async(call_id, user_input)
```

### Enhanced Error Handling
- Graceful handling of incomplete data
- Better error messages
- Data completeness scoring

## Example Call Transcripts

### Outbound Discovery Call (Successful)

**Agent:** Hi John, this is Sarah from Afterhours. Thanks for your interest. I'd like to learn about your business so we can create a demo email you can review. Is now a good time for about 10 minutes?

**User:** Yes, now is fine.

**Agent:** Great. Let's start with your business. What does Smith Legal Services do?

**User:** We're a small law firm, just me and two paralegals. We handle estate planning and probate cases.

**Agent:** What parts of your business are still manual? What do you spend the most time on that you wish was automated?

**User:** We handle client intake manually, lots of email back and forth. Also follow-ups and billing.

**Agent:** Are you the decision-maker for operations and automation decisions? Is there anyone else who would need to be involved?

**User:** Yes, I'm the owner and decision maker.

**Agent:** When would you consider making changes to your operations? What would need to be true for you to move forward?

**User:** Probably next quarter, we're pretty busy right now.

**Agent:** Perfect. I'll generate a demo email based on what we discussed. We aim to send it within about 24 hours for your review. Does that work?

**User:** Yes, that works.

**Agent:** Perfect! I have everything I need. We aim to send a demo email within about 24 hours. Thanks for your time!

### Inbound Call (Lead Calls Us)

**Agent:** Hi, thanks for calling Afterhours. How can I help you today?

**User:** I'm looking for help automating my business operations.

**Agent:** Tell me about your business and what you're looking to automate.

**User:** We're a healthcare clinic with about 10 employees. We spend too much time on appointment scheduling and patient follow-ups.

**Agent:** We'll follow up with a demo summary, typically within about 24 hours. What's the best email to reach you?

**User:** jane@healthclinic.com

**Agent:** Perfect! I have everything I need. We aim to send a demo email within about 24 hours. Thanks for your time!

### Missed Call Handling

When a call is missed, the system can:
1. Leave voicemail with callback information
2. Send SMS with link to schedule callback
3. Queue for retry at better time
4. Send email follow-up instead

## Data Output Format

After a call completes, the system outputs:

```json
{
  "call_id": "call_12345",
  "call_type": "outbound",
  "lead_id": "LEAD_001",
  "business_name": "Smith Legal Services",
  "contact_name": "John Smith",
  "final_state": "completed",
  "data_collected": {
    "business_description": "...",
    "industry": "legal",
    "manual_tasks": "...",
    "is_decision_maker": true,
    "timeline": "next_quarter"
  },
  "conversation_history": [...]
}
```

This data is then used to:
1. Generate demo emails
2. Create queue entries in Google Sheets
3. Score lead quality
4. Personalize follow-up communications

## Next Steps

1. **Integrate with Twilio/VAPI** - Connect to real voice infrastructure
2. **Add NLP** - Replace rule-based intent detection with GPT-4
3. **Add transcription** - Store full conversation transcripts
4. **Add analytics** - Track call quality, completion rates, etc.
5. **Add retry logic** - Handle missed calls, voicemails, etc.

