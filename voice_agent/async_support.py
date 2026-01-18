"""
Async support for Voice Agent

Provides async/await compatible wrappers for voice agent operations.
Useful for Twilio webhooks, VAPI integrations, and other async contexts.
"""

import asyncio
from typing import Dict, Optional, Any, Callable
from voice_agent.state_machine import VoiceAgentStateMachine
from voice_agent.call_flows import CallType, CallContext, CallState


class AsyncVoiceAgent:
    """
    Async wrapper for VoiceAgentStateMachine
    
    Allows non-blocking call processing for webhook handlers and API integrations.
    """
    
    def __init__(self, state_machine: Optional[VoiceAgentStateMachine] = None):
        self.state_machine = state_machine or VoiceAgentStateMachine()
        self.executor = None  # Would be ThreadPoolExecutor in production
    
    async def start_call_async(
        self,
        call_id: str,
        call_type: CallType,
        initial_context: Optional[Dict] = None
    ) -> CallContext:
        """
        Start a new call session asynchronously
        
        Args:
            call_id: Unique identifier for this call
            call_type: Type of call (inbound/outbound/etc)
            initial_context: Optional initial data
        
        Returns:
            CallContext for this call
        """
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.state_machine.start_call,
            call_id,
            call_type,
            initial_context
        )
    
    async def process_user_input_async(
        self,
        call_id: str,
        user_input: str
    ) -> Dict[str, Any]:
        """
        Process user input asynchronously
        
        Args:
            call_id: Call identifier
            user_input: User's speech/text input
        
        Returns:
            Dict with prompt, state, intent, etc.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.state_machine.process_user_input,
            call_id,
            user_input
        )
    
    async def get_call_summary_async(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get call summary asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.state_machine.get_call_summary,
            call_id
        )
    
    async def end_call_async(self, call_id: str) -> Optional[Dict[str, Any]]:
        """End call and return summary asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.state_machine.end_call,
            call_id
        )


# Example async webhook handler for Twilio
async def handle_twilio_webhook_async(
    call_sid: str,
    speech_result: str,
    from_number: str,
    async_agent: AsyncVoiceAgent
) -> Dict[str, Any]:
    """
    Example async webhook handler for Twilio
    
    Usage in FastAPI/Flask async endpoint:
    
    @app.post("/twilio/webhook")
    async def twilio_webhook(request: Request):
        form = await request.form()
        call_sid = form.get("CallSid")
        speech_result = form.get("SpeechResult", "")
        from_number = form.get("From")
        
        result = await handle_twilio_webhook_async(
            call_sid, speech_result, from_number, async_agent
        )
        
        return generate_twiml_response(result)
    """
    # Check if call exists, if not start it
    summary = await async_agent.get_call_summary_async(call_sid)
    
    if not summary:
        # New call - start it
        await async_agent.start_call_async(
            call_sid,
            CallType.INBOUND,
            {"contact_phone": from_number}
        )
    
    # Process input
    result = await async_agent.process_user_input_async(call_sid, speech_result)
    
    return result


def generate_twiml_response(result: Dict[str, Any]) -> str:
    """
    Generate TwiML XML response for Twilio
    
    Args:
        result: Result from process_user_input_async
    
    Returns:
        TwiML XML string
    """
    prompt = result.get("prompt", "Thank you for calling.")
    should_end = result.get("should_end", False)
    should_transfer = result.get("should_transfer", False)
    
    twiml_parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<Response>']
    
    if should_transfer:
        twiml_parts.append(
            '<Dial>'
            '<Number>+1234567890</Number>'  # Would be configured
            '</Dial>'
        )
    elif should_end:
        twiml_parts.append(f'<Say voice="alice">{prompt}</Say>')
        twiml_parts.append('<Hangup/>')
    else:
        twiml_parts.append(f'<Say voice="alice">{prompt}</Say>')
        twiml_parts.append(
            '<Gather input="speech" action="/twilio/webhook" '
            'speechTimeout="5" timeout="10"/>'
        )
    
    twiml_parts.append('</Response>')
    
    return '\n'.join(twiml_parts)


# Example async integration with OpenAI (for future NLP enhancement)
async def enhance_with_openai_async(
    user_input: str,
    context: CallContext,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Enhance intent detection and entity extraction with OpenAI
    
    This is a placeholder showing how to integrate GPT-4 for better NLP.
    Replace with actual OpenAI API calls when ready.
    
    Args:
        user_input: User's speech/text input
        context: Current call context
        api_key: OpenAI API key (would come from config)
    
    Returns:
        Dict with enhanced intent and entities
    """
    # Placeholder - would use openai.AsyncOpenAI in production
    # import openai
    # client = openai.AsyncOpenAI(api_key=api_key)
    # response = await client.chat.completions.create(...)
    
    return {
        "intent": "continue",
        "confidence": 0.8,
        "entities": {},
        "sentiment": "neutral"
    }

