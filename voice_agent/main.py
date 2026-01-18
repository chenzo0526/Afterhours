"""
Main entry point for Voice Agent system

Example usage and integration points
"""

from voice_agent.state_machine import VoiceAgentStateMachine, TwilioAdapter, VAPIAdapter
from voice_agent.call_flows import CallType, CallState


def example_outbound_call():
    """Example: Simulate an outbound discovery call"""
    
    # Initialize state machine
    sm = VoiceAgentStateMachine()
    
    # Start call
    call_id = "call_12345"
    context = sm.start_call(
        call_id=call_id,
        call_type=CallType.OUTBOUND,
        initial_context={
            "lead_id": "LEAD_001",
            "business_name": "Smith Legal Services",
            "contact_name": "John Smith",
            "contact_phone": "+15551234567"
        }
    )
    
    # Get initial prompt
    flow = sm.flow_cache[CallType.OUTBOUND]
    print(f"Agent: {flow.get_next_prompt(CallState.GREETING, context)}")
    
    # Simulate conversation
    responses = [
        "Yes, now is fine",
        "We're a small law firm, just me and two paralegals",
        "We handle client intake manually, lots of email back and forth",
        "Yes, I'm the owner and decision maker",
        "Probably next quarter, we're pretty busy right now",
        "Yes, that works"
    ]
    
    for response in responses:
        print(f"\nUser: {response}")
        result = sm.process_user_input(call_id, response)
        print(f"Agent: {result['prompt']}")
        
        if result.get("should_end"):
            break
    
    # Get call summary
    summary = sm.get_call_summary(call_id)
    print(f"\n=== Call Summary ===")
    print(f"Final State: {summary['final_state']}")
    print(f"Data Collected: {summary['data_collected']}")
    
    # End call
    sm.end_call(call_id)


def example_twilio_integration():
    """Example: How to integrate with Twilio"""
    
    sm = VoiceAgentStateMachine()
    adapter = TwilioAdapter(sm)
    
    # Incoming call handler (would be called by Twilio webhook)
    def handle_twilio_call(call_sid, from_number, to_number):
        return adapter.handle_incoming_call(call_sid, from_number, to_number)
    
    # User input handler (would be called by Twilio webhook)
    def handle_twilio_input(call_sid, speech_result):
        return adapter.handle_user_input(call_sid, speech_result)
    
    return handle_twilio_call, handle_twilio_input


if __name__ == "__main__":
    print("=== Afterhours Voice Agent MVP ===\n")
    print("Running example outbound call simulation...\n")
    example_outbound_call()

