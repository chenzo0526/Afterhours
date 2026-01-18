"""
Unit tests for IntentDetector
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from voice_agent.intent_detector import IntentDetector, Intent


class TestIntentDetector(unittest.TestCase):
    """Test cases for IntentDetector"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.detector = IntentDetector()
    
    def test_opt_out_intent(self):
        """Test opt-out intent detection"""
        test_cases = [
            ("no, not interested", Intent.OPT_OUT),
            ("stop calling me", Intent.OPT_OUT),
            ("remove me from your list", Intent.OPT_OUT),
            ("not now, maybe later", Intent.OPT_OUT),
            ("too busy right now", Intent.OPT_OUT)
        ]
        
        for text, expected_intent in test_cases:
            intent, confidence = self.detector.detect(text)
            self.assertEqual(intent, expected_intent, f"Failed for: {text}")
            self.assertGreater(confidence, 0.8)
    
    def test_transfer_intent(self):
        """Test transfer intent detection"""
        test_cases = [
            ("can I speak to a human", Intent.TRANSFER),
            ("transfer me to someone", Intent.TRANSFER),
            ("I want to talk to a person", Intent.TRANSFER)
        ]
        
        for text, expected_intent in test_cases:
            intent, confidence = self.detector.detect(text)
            self.assertEqual(intent, expected_intent, f"Failed for: {text}")
    
    def test_affirmative_intent(self):
        """Test affirmative intent detection"""
        test_cases = [
            ("yes, that works", Intent.AFFIRMATIVE),
            ("sure, sounds good", Intent.AFFIRMATIVE),
            ("okay, fine", Intent.AFFIRMATIVE),
            ("absolutely", Intent.AFFIRMATIVE)
        ]
        
        for text, expected_intent in test_cases:
            intent, confidence = self.detector.detect(text)
            self.assertEqual(intent, expected_intent, f"Failed for: {text}")
    
    def test_question_intent(self):
        """Test question intent detection"""
        test_cases = [
            ("what do you do?", Intent.QUESTION),
            ("how does this work?", Intent.QUESTION),
            ("can you explain?", Intent.QUESTION)
        ]
        
        for text, expected_intent in test_cases:
            intent, confidence = self.detector.detect(text)
            self.assertEqual(intent, expected_intent, f"Failed for: {text}")
    
    def test_entity_extraction(self):
        """Test entity extraction"""
        # Test email extraction
        text = "My email is john@example.com"
        entities = self.detector.extract_entities(text)
        self.assertIn("email", entities)
        self.assertEqual(entities["email"], "john@example.com")
        
        # Test phone extraction
        text = "Call me at 555-123-4567"
        entities = self.detector.extract_entities(text)
        self.assertIn("phone", entities)
        
        # Test industry extraction
        text = "I'm a lawyer at a law firm"
        entities = self.detector.extract_entities(text)
        self.assertIn("industry", entities)
        self.assertEqual(entities["industry"], "legal")
        
        # Test business size extraction
        text = "It's just me, solo practitioner"
        entities = self.detector.extract_entities(text)
        self.assertIn("business_size", entities)
        self.assertEqual(entities["business_size"], "solo")
    
    def test_empty_input(self):
        """Test handling of empty input"""
        intent, confidence = self.detector.detect("")
        self.assertEqual(intent, Intent.UNKNOWN)
        self.assertEqual(confidence, 0.0)
    
    def test_continue_intent(self):
        """Test continue intent for substantial text"""
        text = "We're a small law firm handling estate planning and probate cases"
        intent, confidence = self.detector.detect(text)
        self.assertEqual(intent, Intent.CONTINUE)
        self.assertGreater(confidence, 0.5)


if __name__ == '__main__':
    unittest.main()

