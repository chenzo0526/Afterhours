"""
Unit tests for Call Flows
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from voice_agent.call_flows import (
    OutboundDiscoveryFlow,
    InboundFlow,
    CallContext,
    CallState,
    CallType,
    get_flow_for_call_type
)


class TestCallFlows(unittest.TestCase):
    """Test cases for Call Flows"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.outbound_flow = OutboundDiscoveryFlow(CallType.OUTBOUND)
        self.inbound_flow = InboundFlow(CallType.INBOUND)
    
    def test_outbound_flow_states(self):
        """Test outbound flow state definitions"""
        states = self.outbound_flow.states
        
        self.assertIn(CallState.GREETING, states)
        self.assertIn(CallState.BUSINESS_DISCOVERY, states)
        self.assertIn(CallState.OPERATIONS_ASSESSMENT, states)
        self.assertIn(CallState.CLOSING, states)
    
    def test_get_next_prompt(self):
        """Test getting next prompt"""
        context = CallContext(
            call_id="test",
            call_type=CallType.OUTBOUND,
            contact_name="John",
            business_name="Test Co"
        )
        
        prompt = self.outbound_flow.get_next_prompt(CallState.GREETING, context)
        
        self.assertIsInstance(prompt, str)
        self.assertIn("John", prompt)
        self.assertIn("Afterhours", prompt)
    
    def test_process_response_greeting_affirmative(self):
        """Test processing affirmative response in greeting"""
        context = CallContext("test", CallType.OUTBOUND)
        
        next_state = self.outbound_flow.process_response(
            CallState.GREETING,
            "yes, now is fine",
            context
        )
        
        self.assertEqual(next_state, CallState.BUSINESS_DISCOVERY)
        self.assertIn("confirmation", context.collected_data)
    
    def test_process_response_greeting_opt_out(self):
        """Test processing opt-out in greeting"""
        context = CallContext("test", CallType.OUTBOUND)
        
        next_state = self.outbound_flow.process_response(
            CallState.GREETING,
            "no, not now",
            context
        )
        
        self.assertEqual(next_state, CallState.OPTED_OUT)
    
    def test_process_response_state_transition(self):
        """Test state transitions"""
        context = CallContext("test", CallType.OUTBOUND)
        
        # Move through states
        state = CallState.GREETING
        state = self.outbound_flow.process_response(state, "yes", context)
        self.assertEqual(state, CallState.BUSINESS_DISCOVERY)
        
        state = self.outbound_flow.process_response(
            state,
            "We're a law firm",
            context
        )
        self.assertEqual(state, CallState.OPERATIONS_ASSESSMENT)
    
    def test_data_collection(self):
        """Test data collection during conversation"""
        context = CallContext("test", CallType.OUTBOUND)
        
        self.outbound_flow.process_response(
            CallState.BUSINESS_DISCOVERY,
            "We're a small law firm handling estate planning",
            context
        )
        
        self.assertIn("business_description", context.collected_data)
        self.assertIn("industry", context.collected_data)
    
    def test_check_data_completeness(self):
        """Test data completeness checking"""
        context = CallContext("test", CallType.OUTBOUND)
        
        # Check empty state
        is_complete, missing = self.outbound_flow.check_data_completeness(
            CallState.BUSINESS_DISCOVERY,
            context
        )
        
        self.assertFalse(is_complete)
        self.assertIn("business_description", missing)
        
        # Add required data
        context.collected_data["business_description"] = "We're a law firm"
        
        is_complete, missing = self.outbound_flow.check_data_completeness(
            CallState.BUSINESS_DISCOVERY,
            context
        )
        
        self.assertTrue(is_complete)
        self.assertEqual(len(missing), 0)
    
    def test_clarifying_question(self):
        """Test generating clarifying questions"""
        question = self.outbound_flow.get_clarifying_question(
            ["business_description"],
            CallState.BUSINESS_DISCOVERY
        )
        
        self.assertIsNotNone(question)
        self.assertIsInstance(question, str)
        self.assertGreater(len(question), 0)
    
    def test_inbound_flow(self):
        """Test inbound flow"""
        context = CallContext("test", CallType.INBOUND)
        
        prompt = self.inbound_flow.get_next_prompt(CallState.GREETING, context)
        self.assertIn("Afterhours", prompt)
        
        next_state = self.inbound_flow.process_response(
            CallState.GREETING,
            "I'm looking for automation help",
            context
        )
        
        self.assertEqual(next_state, CallState.BUSINESS_DISCOVERY)
    
    def test_get_flow_for_call_type(self):
        """Test flow factory function"""
        outbound = get_flow_for_call_type(CallType.OUTBOUND)
        self.assertIsInstance(outbound, OutboundDiscoveryFlow)
        
        inbound = get_flow_for_call_type(CallType.INBOUND)
        self.assertIsInstance(inbound, InboundFlow)


if __name__ == '__main__':
    unittest.main()

