"""
Call Flow Definitions for Afterhours Voice Agent

Defines the conversation flows for different call scenarios:
- Inbound call (lead calls in)
- Outbound call (we call lead)
- Missed call handling
- Demo request flow

Enhanced with:
- Missing data detection
- Clarifying questions
- Graceful failure handling
"""

from enum import Enum
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass
from datetime import datetime


class CallType(Enum):
    """Type of call being handled"""
    INBOUND = "inbound"  # Lead calls us
    OUTBOUND = "outbound"  # We call lead
    MISSED = "missed"  # Missed call, needs callback
    DEMO_REQUEST = "demo_request"  # Lead requested demo via form


class CallState(Enum):
    """Current state in the conversation flow"""
    GREETING = "greeting"
    BUSINESS_DISCOVERY = "business_discovery"
    OPERATIONS_ASSESSMENT = "operations_assessment"
    DECISION_MAKER_CONFIRMATION = "decision_maker_confirmation"
    TIMELINE_INTEREST = "timeline_interest"
    CLOSING = "closing"
    COMPLETED = "completed"
    TRANSFERRED = "transferred"
    OPTED_OUT = "opted_out"
    CLARIFYING = "clarifying"  # Asking clarifying question
    DATA_INCOMPLETE = "data_incomplete"  # Missing required data


@dataclass
class CallContext:
    """Context maintained throughout a call"""
    call_id: str
    call_type: CallType
    lead_id: Optional[str] = None
    business_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    current_state: CallState = CallState.GREETING
    collected_data: Dict[str, Any] = None
    conversation_history: List[Dict[str, str]] = None
    missing_fields: Set[str] = None
    clarification_count: int = 0
    max_clarifications: int = 2
    
    def __post_init__(self):
        if self.collected_data is None:
            self.collected_data = {}
        if self.conversation_history is None:
            self.conversation_history = []
        if self.missing_fields is None:
            self.missing_fields = set()
    
    def add_to_history(self, state: CallState, response: str, prompt: Optional[str] = None):
        """Add entry to conversation history with timestamp"""
        self.conversation_history.append({
            "state": state.value,
            "response": response,
            "prompt": prompt,
            "timestamp": datetime.now().isoformat()
        })


class CallFlow:
    """Base class for call flow definitions"""
    
    def __init__(self, call_type: CallType):
        self.call_type = call_type
        self.states = self._define_states()
        self.required_fields = self._define_required_fields()
    
    def _define_states(self) -> Dict[CallState, Dict[str, Any]]:
        """Define the states and transitions for this flow"""
        raise NotImplementedError
    
    def _define_required_fields(self) -> Dict[CallState, List[str]]:
        """Define required fields for each state"""
        return {}
    
    def get_next_prompt(self, state: CallState, context: CallContext) -> str:
        """Get the prompt/question for the current state"""
        raise NotImplementedError
    
    def process_response(self, state: CallState, response: str, context: CallContext) -> CallState:
        """Process user response and determine next state"""
        raise NotImplementedError
    
    def check_data_completeness(self, state: CallState, context: CallContext) -> tuple[bool, List[str]]:
        """
        Check if required data for current state is complete
        
        Returns:
            (is_complete, missing_fields)
        """
        required = self.required_fields.get(state, [])
        missing = []
        
        for field in required:
            if field not in context.collected_data or not context.collected_data[field]:
                missing.append(field)
        
        return len(missing) == 0, missing
    
    def get_clarifying_question(self, missing_fields: List[str], state: CallState) -> Optional[str]:
        """Generate clarifying question for missing fields"""
        if not missing_fields:
            return None
        
        # Map fields to clarifying questions
        clarification_map = {
            "business_description": "Could you tell me more about what your business does?",
            "industry": "What industry would you say you're in?",
            "manual_tasks": "What tasks are you doing manually right now?",
            "biggest_pain": "What's the biggest challenge you're facing?",
            "is_decision_maker": "Are you able to make decisions about operations and automation?",
            "timeline": "When would you consider making changes?",
            "email": "What's the best email address to reach you?",
            "phone": "What's the best phone number to reach you?"
        }
        
        # Return question for first missing field
        for field in missing_fields:
            if field in clarification_map:
                return clarification_map[field]
        
        return f"Could you provide more details about {missing_fields[0]}?"


class OutboundDiscoveryFlow(CallFlow):
    """
    Flow for outbound discovery calls (we call lead after form submission)
    
    Enhanced with:
    - Missing data detection
    - Clarifying questions
    - Graceful handling of incomplete information
    """
    
    def _define_states(self) -> Dict[CallState, Dict[str, Any]]:
        return {
            CallState.GREETING: {
                "prompt": "Hi {name}, this is {agent_name} from Afterhours. Thanks for your interest. I'd like to learn about your business so we can create a demo email you can review. Is now a good time for about 10 minutes?",
                "next_states": [CallState.BUSINESS_DISCOVERY, CallState.OPTED_OUT],
                "timeout": 30,
                "retry_on_timeout": True
            },
            CallState.BUSINESS_DISCOVERY: {
                "prompt": "Great. Let's start with your business. What does {business_name} do?",
                "fields_to_collect": ["business_description", "industry", "size", "customers"],
                "next_states": [CallState.OPERATIONS_ASSESSMENT],
                "timeout": 60,
                "retry_on_timeout": True
            },
            CallState.OPERATIONS_ASSESSMENT: {
                "prompt": "What parts of your business are still manual? What do you spend the most time on that you wish was automated?",
                "fields_to_collect": ["manual_tasks", "biggest_pain", "current_automation"],
                "next_states": [CallState.DECISION_MAKER_CONFIRMATION],
                "timeout": 90,
                "retry_on_timeout": True
            },
            CallState.DECISION_MAKER_CONFIRMATION: {
                "prompt": "Are you the decision-maker for operations and automation decisions? Is there anyone else who would need to be involved?",
                "fields_to_collect": ["is_decision_maker", "other_stakeholders"],
                "next_states": [CallState.TIMELINE_INTEREST],
                "timeout": 60,
                "retry_on_timeout": False
            },
            CallState.TIMELINE_INTEREST: {
                "prompt": "When would you consider making changes to your operations? What would need to be true for you to move forward?",
                "fields_to_collect": ["timeline", "conditions", "preferred_communication"],
                "next_states": [CallState.CLOSING],
                "timeout": 60,
                "retry_on_timeout": False
            },
            CallState.CLOSING: {
                "prompt": "Perfect. I'll generate a demo email based on what we discussed. We aim to send it within about 24 hours for your review. Does that work?",
                "fields_to_collect": ["confirmation"],
                "next_states": [CallState.COMPLETED],
                "timeout": 30,
                "retry_on_timeout": False
            },
            CallState.CLARIFYING: {
                "prompt": "{clarification_question}",
                "next_states": [],  # Will be determined dynamically
                "timeout": 45
            }
        }
    
    def _define_required_fields(self) -> Dict[CallState, List[str]]:
        """Define minimum required fields for each state"""
        return {
            CallState.BUSINESS_DISCOVERY: ["business_description"],
            CallState.OPERATIONS_ASSESSMENT: ["manual_tasks", "biggest_pain"],
            CallState.DECISION_MAKER_CONFIRMATION: ["is_decision_maker"],
            CallState.TIMELINE_INTEREST: ["timeline"]
        }
    
    def get_next_prompt(self, state: CallState, context: CallContext) -> str:
        """Get formatted prompt for current state"""
        state_def = self.states.get(state)
        if not state_def:
            return "I'm sorry, I didn't understand. Could you repeat that?"
        
        prompt_template = state_def["prompt"]
        
        # Handle clarifying state
        if state == CallState.CLARIFYING:
            clarification_question = self.get_clarifying_question(
                list(context.missing_fields),
                context.current_state
            )
            if clarification_question:
                return clarification_question
            # Fallback to previous state prompt
            state_def = self.states.get(context.current_state)
            prompt_template = state_def["prompt"] if state_def else prompt_template
        
        # Format with context data
        return prompt_template.format(
            name=context.contact_name or "there",
            agent_name="Sarah from Afterhours",
            business_name=context.business_name or "your business",
            clarification_question=self.get_clarifying_question(
                list(context.missing_fields),
                context.current_state
            ) or ""
        )
    
    def process_response(self, state: CallState, response: str, context: CallContext) -> CallState:
        """Process response and extract data, return next state"""
        state_def = self.states.get(state)
        if not state_def:
            return CallState.COMPLETED
        
        # Store response in conversation history
        context.add_to_history(state, response)
        
        # Extract data based on fields_to_collect
        fields = state_def.get("fields_to_collect", [])
        for field in fields:
            # In real implementation, use NLP to extract structured data
            # For MVP, store raw response
            if response.strip():
                context.collected_data[field] = response
                # Remove from missing fields if it was there
                context.missing_fields.discard(field)
        
        # If we're in clarifying state, check if we got the missing data
        if state == CallState.CLARIFYING:
            is_complete, missing = self.check_data_completeness(context.current_state, context)
            if is_complete:
                # Return to the state we were clarifying for
                return self._get_next_state_for(context.current_state)
            elif context.clarification_count >= context.max_clarifications:
                # Too many clarifications, move forward anyway
                return self._get_next_state_for(context.current_state)
            else:
                # Still missing data, ask again
                context.clarification_count += 1
                context.missing_fields = set(missing)
                return CallState.CLARIFYING
        
        # Check data completeness for current state
        is_complete, missing = self.check_data_completeness(state, context)
        
        if not is_complete and missing:
            # Missing required data - ask clarifying question
            context.missing_fields = set(missing)
            context.clarification_count = 1
            return CallState.CLARIFYING
        
        # Determine next state
        next_states = state_def.get("next_states", [])
        
        # Handle opt-out in greeting
        if state == CallState.GREETING:
            response_lower = response.lower().strip()

            # SAFE opt-out detection:
            # Only opt out on explicit phrases like "not now", "busy", "call later", "no thanks".
            # Avoid false positives like "no AC", "no heat", "no water".
            explicit_opt_out = any(phrase in response_lower for phrase in [
                "no thanks", "no thank you", "not now", "call later", "later", "busy", "stop calling", "don't call", "do not call"
            ])

            # If the whole response is basically "no" (short), treat as opt-out
            short_no = response_lower in {"no", "nah", "nope"}

            if explicit_opt_out or short_no:
                return CallState.OPTED_OUT

            # Positive confirmation to proceed
            if any(word in response_lower for word in ["yes", "sure", "okay", "ok", "fine", "yep", "yeah"]):
                return CallState.BUSINESS_DISCOVERY
        
        # Default: move to next state in sequence
        return self._get_next_state_for(state)
    
    def _get_next_state_for(self, current_state: CallState) -> CallState:
        """Get next state in sequence"""
        state_sequence = [
            CallState.GREETING,
            CallState.BUSINESS_DISCOVERY,
            CallState.OPERATIONS_ASSESSMENT,
            CallState.DECISION_MAKER_CONFIRMATION,
            CallState.TIMELINE_INTEREST,
            CallState.CLOSING,
            CallState.COMPLETED
        ]
        try:
            current_idx = state_sequence.index(current_state)
            if current_idx < len(state_sequence) - 1:
                return state_sequence[current_idx + 1]
        except ValueError:
            pass
        
        return CallState.COMPLETED


class InboundFlow(CallFlow):
    """
    Flow for inbound calls (lead calls us)
    Shorter, more direct flow focused on understanding their immediate need.
    """
    
    def _define_states(self) -> Dict[CallState, Dict[str, Any]]:
        return {
            CallState.GREETING: {
                "prompt": "Hi, thanks for calling Afterhours. How can I help you today?",
                "next_states": [CallState.BUSINESS_DISCOVERY],
                "timeout": 30
            },
            CallState.BUSINESS_DISCOVERY: {
                "prompt": "Tell me about your business and what you're looking to automate.",
                "fields_to_collect": ["business_description", "immediate_need"],
                "next_states": [CallState.CLOSING],
                "timeout": 120
            },
            CallState.CLOSING: {
                "prompt": "We'll follow up with a demo summary, typically within about 24 hours. What's the best email to reach you?",
                "fields_to_collect": ["email", "preferred_contact"],
                "next_states": [CallState.COMPLETED],
                "timeout": 60
            }
        }
    
    def _define_required_fields(self) -> Dict[CallState, List[str]]:
        return {
            CallState.BUSINESS_DISCOVERY: ["business_description"],
            CallState.CLOSING: ["email"]
        }
    
    def get_next_prompt(self, state: CallState, context: CallContext) -> str:
        state_def = self.states.get(state)
        return state_def["prompt"] if state_def else "How can I help?"
    
    def process_response(self, state: CallState, response: str, context: CallContext) -> CallState:
        state_def = self.states.get(state)
        if not state_def:
            return CallState.COMPLETED
        
        context.add_to_history(state, response)
        
        fields = state_def.get("fields_to_collect", [])
        for field in fields:
            if response.strip():
                context.collected_data[field] = response
                context.missing_fields.discard(field)
        
        # Check completeness
        is_complete, missing = self.check_data_completeness(state, context)
        if not is_complete and missing and state != CallState.CLOSING:
            context.missing_fields = set(missing)
            return CallState.CLARIFYING
        
        next_states = state_def.get("next_states", [])
        if next_states:
            state_sequence = [
                CallState.GREETING,
                CallState.BUSINESS_DISCOVERY,
                CallState.CLOSING,
                CallState.COMPLETED
            ]
            try:
                current_idx = state_sequence.index(state)
                if current_idx < len(state_sequence) - 1:
                    return state_sequence[current_idx + 1]
            except ValueError:
                pass
        
        return CallState.COMPLETED


class MissedCallFlow(CallFlow):
    """
    Flow for MISSED calls (after-hours receptionist style).
    Goal: capture triage info + preferred callback window fast.
    """

    def _define_states(self) -> Dict[CallState, Dict[str, Any]]:
        return {
            CallState.GREETING: {
                "prompt": "Thanks for calling. We’re currently closed, but I can take the details and notify the on-call team. What city are you in, and what’s going on?",
                "fields_to_collect": ["location", "issue"],
                "next_states": [CallState.OPERATIONS_ASSESSMENT],
                "timeout": 45,
                "retry_on_timeout": True
            },
            CallState.OPERATIONS_ASSESSMENT: {
                "prompt": "Got it. How urgent is this—no heat/AC, water leak, safety issue, or something that can wait until tomorrow?",
                "fields_to_collect": ["urgency"],
                "next_states": [CallState.TIMELINE_INTEREST],
                "timeout": 45,
                "retry_on_timeout": True
            },
            CallState.TIMELINE_INTEREST: {
                "prompt": "What’s the best time window tomorrow for a callback, and is text okay if we can’t reach you right away?",
                "fields_to_collect": ["callback_window", "text_ok"],
                "next_states": [CallState.CLOSING],
                "timeout": 45,
                "retry_on_timeout": True
            },
            CallState.CLOSING: {
                "prompt": "Perfect. I’m logging this now. I’ll pass that window to the on-call team for follow-up. If anything changes, just reply to the text or call again. What’s the best name to put on this?",
                "fields_to_collect": ["contact_name"],
                "next_states": [CallState.COMPLETED],
                "timeout": 45,
                "retry_on_timeout": False
            }
        }

    def _define_required_fields(self) -> Dict[CallState, List[str]]:
        return {
            CallState.GREETING: ["location", "issue"],
            CallState.OPERATIONS_ASSESSMENT: ["urgency"],
            CallState.TIMELINE_INTEREST: ["callback_window"],
            CallState.CLOSING: ["contact_name"]
        }

    def get_next_prompt(self, state: CallState, context: CallContext) -> str:
        state_def = self.states.get(state)
        return state_def["prompt"] if state_def else "Could you tell me a bit more?"

    def process_response(self, state: CallState, response: str, context: CallContext) -> CallState:
        state_def = self.states.get(state)
        if not state_def:
            return CallState.COMPLETED

        context.add_to_history(state, response)

        # Store raw response for each field in this state
        fields = state_def.get("fields_to_collect", [])
        for field in fields:
            if response.strip():
                context.collected_data[field] = response
                context.missing_fields.discard(field)

        # completeness check
        is_complete, missing = self.check_data_completeness(state, context)
        if not is_complete and missing:
            context.missing_fields = set(missing)
            context.clarification_count = min(context.clarification_count + 1, context.max_clarifications)
            return CallState.CLARIFYING

        # move through sequence
        sequence = [
            CallState.GREETING,
            CallState.OPERATIONS_ASSESSMENT,
            CallState.TIMELINE_INTEREST,
            CallState.CLOSING,
            CallState.COMPLETED
        ]
        try:
            i = sequence.index(state)
            return sequence[i + 1] if i < len(sequence) - 1 else CallState.COMPLETED
        except ValueError:
            return CallState.COMPLETED


def get_flow_for_call_type(call_type: CallType) -> CallFlow:
    """Factory function to get appropriate flow for call type"""
    flow_map = {
        CallType.OUTBOUND: OutboundDiscoveryFlow(CallType.OUTBOUND),
        CallType.INBOUND: InboundFlow(CallType.INBOUND),
        CallType.DEMO_REQUEST: OutboundDiscoveryFlow(CallType.DEMO_REQUEST),
        CallType.MISSED: MissedCallFlow(CallType.MISSED)
    }
    return flow_map.get(call_type, OutboundDiscoveryFlow(CallType.OUTBOUND))
