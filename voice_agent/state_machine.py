"""
State Machine / Flow Router for Voice Agent

Enhanced with:
- Better error handling
- Missing data detection
- Clarifying question support
- Async-ready structure
"""

from typing import Dict, Optional, Callable, Any
from enum import Enum
import json
import logging

from .call_flows import CallFlow, CallContext, CallState, CallType, get_flow_for_call_type
from .intent_detector import IntentDetector, Intent


logger = logging.getLogger(__name__)


class VoiceAgentStateMachine:
    """
    Main state machine for voice agent conversations
    
    Enhanced with:
    - Missing data detection
    - Clarifying questions
    - Better error handling
    """
    
    def __init__(self):
        self.intent_detector = IntentDetector()
        self.active_calls: Dict[str, CallContext] = {}
        self.flow_cache: Dict[CallType, CallFlow] = {}
    
    def start_call(self, call_id: str, call_type: CallType, initial_context: Optional[Dict] = None) -> CallContext:
        """
        Start a new call session
        
        Args:
            call_id: Unique identifier for this call
            call_type: Type of call (inbound/outbound/etc)
            initial_context: Optional initial data (lead_id, business_name, etc)
        
        Returns:
            CallContext for this call
        """
        # Get or create flow for this call type
        if call_type not in self.flow_cache:
            self.flow_cache[call_type] = get_flow_for_call_type(call_type)
        
        flow = self.flow_cache[call_type]
        
        # Create context
        context = CallContext(
            call_id=call_id,
            call_type=call_type,
            current_state=CallState.GREETING
        )
        
        # Populate initial context if provided
        if initial_context:
            for key, value in initial_context.items():
                if hasattr(context, key):
                    setattr(context, key, value)
        
        # Store active call
        self.active_calls[call_id] = context
        
        logger.info(f"Started call {call_id} of type {call_type.value}")
        
        return context
    
    def process_user_input(self, call_id: str, user_input: str) -> Dict[str, Any]:
        """
        Process user input and return next system response
        
        Enhanced with:
        - Missing data detection
        - Clarifying questions
        - Better error handling
        
        Args:
            call_id: Call identifier
            user_input: User's speech/text input
        
        Returns:
            Dict with:
            - prompt: Next question/prompt to speak
            - state: Current state
            - intent: Detected intent
            - should_transfer: Whether to transfer to human
            - should_end: Whether to end call
            - data_collected: Extracted data so far
            - missing_fields: Fields that still need to be collected
        """
        # Get call context
        context = self.active_calls.get(call_id)
        if not context:
            return {
                "error": "Call not found",
                "prompt": "I'm sorry, I couldn't find your call session. Please call back.",
                "should_end": True
            }
        
        # Get flow for this call
        flow = self.flow_cache.get(context.call_type)
        if not flow:
            flow = get_flow_for_call_type(context.call_type)
            self.flow_cache[context.call_type] = flow
        
        # Detect intent
        intent, confidence = self.intent_detector.detect(user_input)
        
        # Handle special intents
        if intent == Intent.OPT_OUT:
            # SAFETY: during MISSED calls, ignore false opt-outs like "no AC"
            if context.call_type == CallType.MISSED:
                text = user_input.lower()
                explicit_opt_out = any(phrase in text for phrase in [
                    "remove me", "unsubscribe", "stop calling", "do not call",
                    "don't call", "no thanks", "not interested"
                ])
                if not explicit_opt_out:
                    # treat as normal response, continue flow
                    intent = Intent.CONTINUE
                else:
                    context.current_state = CallState.OPTED_OUT
                    return {
                        "prompt": "No problem at all. I'll remove you from our list. Have a great day!",
                        "state": CallState.OPTED_OUT.value,
                        "intent": intent.value,
                        "should_end": True,
                        "data_collected": context.collected_data
                    }
            else:
                context.current_state = CallState.OPTED_OUT
                return {
                    "prompt": "No problem at all. I'll remove you from our list. Have a great day!",
                    "state": CallState.OPTED_OUT.value,
                    "intent": intent.value,
                    "should_end": True,
                    "data_collected": context.collected_data
                }
        
        if intent == Intent.TRANSFER:
            context.current_state = CallState.TRANSFERRED
            return {
                "prompt": "If a team member is available, I can request a transfer. Please hold.",
                "state": CallState.TRANSFERRED.value,
                "intent": intent.value,
                "should_transfer": True,
                "data_collected": context.collected_data
            }
        
        if intent == Intent.CLARIFICATION:
            # Repeat current prompt
            prompt = flow.get_next_prompt(context.current_state, context)
            return {
                "prompt": prompt,
                "state": context.current_state.value,
                "intent": intent.value,
                "should_end": False
            }
        
        # Extract entities from input
        entities = self.intent_detector.extract_entities(user_input)
        context.collected_data.update(entities)
        
        # Process response through flow (handles missing data and clarifying questions)
        next_state = flow.process_response(context.current_state, user_input, context)
        context.current_state = next_state
        
        # Get next prompt
        if next_state == CallState.COMPLETED:
            if context.call_type == CallType.MISSED:
                prompt = "Perfect — I’ve got this logged. We’ll pass that window to the on-call team for follow-up. If anything changes, just reply to the text or call again."
            else:
                prompt = "Perfect! I have everything I need. We aim to send a demo email within about 24 hours. Thanks for your time!"
            should_end = True
        elif next_state == CallState.OPTED_OUT:
            prompt = "No problem. Have a great day!"
            should_end = True
        elif next_state == CallState.CLARIFYING:
            # Get clarifying question
            prompt = flow.get_next_prompt(next_state, context)
            should_end = False
        else:
            prompt = flow.get_next_prompt(next_state, context)
            should_end = False
        
        return {
            "prompt": prompt,
            "state": next_state.value,
            "intent": intent.value,
            "should_end": should_end,
            "should_transfer": False,
            "data_collected": context.collected_data,
            "missing_fields": list(context.missing_fields),
            "conversation_history": context.conversation_history
        }
    
    def get_call_summary(self, call_id: str) -> Optional[Dict[str, Any]]:
        """Get summary of call for storage/processing"""
        context = self.active_calls.get(call_id)
        if not context:
            return None
        
        return {
            "call_id": call_id,
            "call_type": context.call_type.value,
            "lead_id": context.lead_id,
            "business_name": context.business_name,
            "contact_name": context.contact_name,
            "final_state": context.current_state.value,
            "data_collected": context.collected_data,
            "conversation_history": context.conversation_history,
            "data_completeness": self._calculate_completeness(context)
        }
    
    def _calculate_completeness(self, context: CallContext) -> Dict[str, Any]:
        """Calculate data completeness score"""
        flow = self.flow_cache.get(context.call_type)
        if not flow:
            return {"score": 0.0, "missing": []}
        
        total_required = 0
        collected = 0
        missing = []
        
        for state, required_fields in flow.required_fields.items():
            for field in required_fields:
                total_required += 1
                if field in context.collected_data and context.collected_data[field]:
                    collected += 1
                else:
                    missing.append(field)
        
        score = collected / total_required if total_required > 0 else 0.0
        
        return {
            "score": round(score, 2),
            "collected": collected,
            "total_required": total_required,
            "missing": missing
        }
    
    def end_call(self, call_id: str) -> Optional[Dict[str, Any]]:
        """End call and return summary"""
        summary = self.get_call_summary(call_id)
        if call_id in self.active_calls:
            del self.active_calls[call_id]
        return summary


# Integration adapters for different voice platforms

class TwilioAdapter:
    """Adapter for Twilio Voice API integration"""
    
    def __init__(self, state_machine: VoiceAgentStateMachine):
        self.state_machine = state_machine
    
    def handle_incoming_call(self, call_sid: str, from_number: str, to_number: str) -> Dict:
        """Handle incoming Twilio call"""
        call_id = call_sid
        context = self.state_machine.start_call(
            call_id=call_id,
            call_type=CallType.INBOUND,
            initial_context={"contact_phone": from_number}
        )
        
        flow = get_flow_for_call_type(CallType.INBOUND)
        initial_prompt = flow.get_next_prompt(CallState.GREETING, context)
        
        return {
            "call_id": call_id,
            "prompt": initial_prompt,
            "action": "speak",
            "gather": True  # Collect user input
        }
    
    def handle_user_input(self, call_sid: str, speech_result: str) -> Dict:
        """Handle user speech input from Twilio"""
        result = self.state_machine.process_user_input(call_sid, speech_result)
        
        response = {
            "prompt": result["prompt"],
            "action": "speak"
        }
        
        if result.get("should_end"):
            response["action"] = "hangup"
        elif result.get("should_transfer"):
            response["action"] = "transfer"
            response["transfer_to"] = "+1234567890"  # Would be configured
        
        if not result.get("should_end"):
            response["gather"] = True  # Continue collecting input
        
        return response


class VAPIAdapter:
    """Adapter for VAPI (Voice API) integration"""
    
    def __init__(self, state_machine: VoiceAgentStateMachine):
        self.state_machine = state_machine
    
    def create_call_config(self, call_id: str, call_type: CallType, initial_context: Dict) -> Dict:
        """Create VAPI call configuration"""
        context = self.state_machine.start_call(call_id, call_type, initial_context)
        flow = get_flow_for_call_type(call_type)
        initial_prompt = flow.get_next_prompt(CallState.GREETING, context)
        
        return {
            "phone_number_id": "vapi_phone_id",  # Would be configured
            "assistant_id": "afterhours_assistant",  # Would be configured
            "assistant_overrides": {
                "first_message": initial_prompt,
                "model": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful assistant for Afterhours, helping businesses understand automation opportunities. Be respectful, concise, and gatekeeper-safe."
                        }
                    ]
                }
            }
        }
    
    def handle_webhook(self, event: Dict) -> Dict:
        """Handle VAPI webhook events"""
        event_type = event.get("type")
        call_id = event.get("call", {}).get("id")
        
        if event_type == "function-call":
            # Handle function calls from AI
            function_name = event.get("functionCall", {}).get("name")
            # Process and return result
            return {"result": "processed"}
        
        return {"status": "ok"}
