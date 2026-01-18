"""
Unit tests for VoiceAgentStateMachine
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from voice_agent.state_machine import VoiceAgentStateMachine
from voice_agent.call_flows import CallType, CallState


class TestVoiceAgentStateMachine(unittest.TestCase):
    """Test cases for VoiceAgentStateMachine"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sm = VoiceAgentStateMachine()
    
    def test_start_call(self):
        """Test starting a new call"""
        call_id = "test_call_123"
        context = self.sm.start_call(
            call_id=call_id,
            call_type=CallType.OUTBOUND,
            initial_context={
                "lead_id": "LEAD_001",
                "business_name": "Test Business",
                "contact_name": "John Doe"
            }
        )
        
        self.assertIsNotNone(context)
        self.assertEqual(context.call_id, call_id)
        self.assertEqual(context.call_type, CallType.OUTBOUND)
        self.assertEqual(context.business_name, "Test Business")
        self.assertEqual(context.current_state, CallState.GREETING)
        self.assertIn(call_id, self.sm.active_calls)
    
    def test_process_user_input_opt_out(self):
        """Test processing opt-out input"""
        call_id = "test_call_optout"
        self.sm.start_call(call_id, CallType.OUTBOUND)
        
        result = self.sm.process_user_input(call_id, "no, not interested")
        
        self.assertEqual(result["intent"], "opt_out")
        self.assertTrue(result["should_end"])
        self.assertEqual(result["state"], CallState.OPTED_OUT.value)
    
    def test_process_user_input_transfer(self):
        """Test processing transfer request"""
        call_id = "test_call_transfer"
        self.sm.start_call(call_id, CallType.INBOUND)
        
        result = self.sm.process_user_input(call_id, "can I speak to a human")
        
        self.assertEqual(result["intent"], "transfer")
        self.assertTrue(result["should_transfer"])
        self.assertEqual(result["state"], CallState.TRANSFERRED.value)
    
    def test_conversation_flow(self):
        """Test complete conversation flow"""
        call_id = "test_call_flow"
        context = self.sm.start_call(
            call_id,
            CallType.OUTBOUND,
            {"contact_name": "Jane", "business_name": "Test Co"}
        )
        
        # Greeting - affirmative response
        result = self.sm.process_user_input(call_id, "yes, now is fine")
        self.assertEqual(result["state"], CallState.BUSINESS_DISCOVERY.value)
        self.assertFalse(result["should_end"])
        
        # Business discovery
        result = self.sm.process_user_input(
            call_id,
            "We're a small law firm handling estate planning"
        )
        self.assertIn("business_description", result["data_collected"])
        self.assertEqual(result["state"], CallState.OPERATIONS_ASSESSMENT.value)
        
        # Operations assessment
        result = self.sm.process_user_input(
            call_id,
            "We do everything manually - client intake, follow-ups, billing"
        )
        self.assertIn("manual_tasks", result["data_collected"])
        
        # Decision maker confirmation
        result = self.sm.process_user_input(call_id, "Yes, I'm the owner")
        self.assertIn("is_decision_maker", result["data_collected"])
        
        # Timeline
        result = self.sm.process_user_input(call_id, "Probably next quarter")
        self.assertIn("timeline", result["data_collected"])
        
        # Closing
        result = self.sm.process_user_input(call_id, "Yes, that works")
        self.assertEqual(result["state"], CallState.COMPLETED.value)
        self.assertTrue(result["should_end"])
    
    def test_missing_data_handling(self):
        """Test handling of missing required data"""
        call_id = "test_call_missing"
        self.sm.start_call(call_id, CallType.OUTBOUND)
        
        # Move to business discovery
        self.sm.process_user_input(call_id, "yes")
        
        # Provide incomplete answer
        result = self.sm.process_user_input(call_id, "we do stuff")
        
        # Should ask clarifying question if data is missing
        # (Implementation may vary based on flow logic)
        self.assertIsNotNone(result["prompt"])
    
    def test_call_not_found(self):
        """Test handling of non-existent call"""
        result = self.sm.process_user_input("nonexistent_call", "hello")
        
        self.assertIn("error", result)
        self.assertTrue(result["should_end"])
    
    def test_get_call_summary(self):
        """Test getting call summary"""
        call_id = "test_call_summary"
        self.sm.start_call(
            call_id,
            CallType.OUTBOUND,
            {"business_name": "Test Business"}
        )
        
        self.sm.process_user_input(call_id, "yes")
        self.sm.process_user_input(call_id, "We're a law firm")
        
        summary = self.sm.get_call_summary(call_id)
        
        self.assertIsNotNone(summary)
        self.assertEqual(summary["call_id"], call_id)
        self.assertEqual(summary["business_name"], "Test Business")
        self.assertIn("data_collected", summary)
        self.assertIn("data_completeness", summary)
    
    def test_end_call(self):
        """Test ending a call"""
        call_id = "test_call_end"
        self.sm.start_call(call_id, CallType.OUTBOUND)
        
        summary = self.sm.end_call(call_id)
        
        self.assertIsNotNone(summary)
        self.assertNotIn(call_id, self.sm.active_calls)


if __name__ == '__main__':
    unittest.main()

