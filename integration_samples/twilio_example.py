"""
Twilio Integration Example

Shows how to integrate Afterhours voice agent with Twilio Voice API.

Setup:
1. Install: pip install twilio
2. Get Twilio account SID and auth token from https://www.twilio.com/console
3. Get a Twilio phone number
4. Set up webhook URL (use ngrok for local testing)
"""

from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client

# Placeholder credentials - replace with actual values
TWILIO_ACCOUNT_SID = "YOUR_ACCOUNT_SID_HERE"
TWILIO_AUTH_TOKEN = "YOUR_AUTH_TOKEN_HERE"
TWILIO_PHONE_NUMBER = "+1234567890"  # Your Twilio number

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Import voice agent
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from voice_agent.state_machine import VoiceAgentStateMachine, TwilioAdapter
from voice_agent.call_flows import CallType

app = Flask(__name__)

# Initialize voice agent
sm = VoiceAgentStateMachine()
adapter = TwilioAdapter(sm)


@app.route("/twilio/incoming", methods=["POST"])
def handle_incoming_call():
    """Handle incoming Twilio call"""
    call_sid = request.form.get("CallSid")
    from_number = request.form.get("From")
    to_number = request.form.get("To")
    
    # Start call in voice agent
    response_data = adapter.handle_incoming_call(call_sid, from_number, to_number)
    
    # Generate TwiML response
    resp = VoiceResponse()
    resp.say(response_data["prompt"], voice="alice")
    
    if response_data.get("gather"):
        gather = Gather(
            input="speech",
            action="/twilio/gather",
            speech_timeout=5,
            timeout=10
        )
        resp.append(gather)
    
    return str(resp)


@app.route("/twilio/gather", methods=["POST"])
def handle_gather():
    """Handle user speech input"""
    call_sid = request.form.get("CallSid")
    speech_result = request.form.get("SpeechResult", "")
    
    # Process input through voice agent
    result = adapter.handle_user_input(call_sid, speech_result)
    
    # Generate TwiML response
    resp = VoiceResponse()
    
    if result.get("action") == "hangup":
        resp.say(result["prompt"], voice="alice")
        resp.hangup()
    elif result.get("action") == "transfer":
        resp.say(result["prompt"], voice="alice")
        dial = resp.dial()
        dial.number("+1234567890")  # Transfer to human
    else:
        resp.say(result["prompt"], voice="alice")
        if result.get("gather"):
            gather = Gather(
                input="speech",
                action="/twilio/gather",
                speech_timeout=5,
                timeout=10
            )
            resp.append(gather)
    
    return str(resp)


@app.route("/twilio/status", methods=["POST"])
def handle_status():
    """Handle call status updates"""
    call_sid = request.form.get("CallSid")
    call_status = request.form.get("CallStatus")
    
    # Log status or update database
    print(f"Call {call_sid} status: {call_status}")
    
    # If call ended, get summary
    if call_status == "completed":
        summary = sm.get_call_summary(call_sid)
        if summary:
            # Store summary in database or Google Sheet
            print(f"Call summary: {summary}")
            sm.end_call(call_sid)
    
    return "", 200


def make_outbound_call(to_number: str, lead_data: dict):
    """
    Make outbound call to lead
    
    Args:
        to_number: Phone number to call (E.164 format)
        lead_data: Lead information (business_name, contact_name, etc.)
    """
    # Create call
    call = client.calls.create(
        to=to_number,
        from_=TWILIO_PHONE_NUMBER,
        url="https://your-domain.com/twilio/incoming",  # Webhook URL
        status_callback="https://your-domain.com/twilio/status",
        status_callback_event=["completed", "answered", "no-answer"]
    )
    
    print(f"Call initiated: {call.sid}")
    return call.sid


if __name__ == "__main__":
    print("Twilio Integration Example")
    print("\nTo use:")
    print("1. Replace placeholder credentials above")
    print("2. Set up webhook URL (use ngrok for local: ngrok http 5000)")
    print("3. Configure Twilio phone number webhook to point to /twilio/incoming")
    print("4. Run: flask run")
    print("\nFor production:")
    print("- Use environment variables for credentials")
    print("- Set up proper error handling")
    print("- Add authentication to webhook endpoints")
    print("- Store call summaries in database")

