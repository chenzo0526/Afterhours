"""
Intent Detection Logic for Voice Agent

Detects user intent from speech/text input using rule-based patterns.
In production, this would integrate with NLP services (OpenAI, etc.)
"""

from typing import Dict, List, Optional, Tuple
from enum import Enum
import re


class Intent(Enum):
    """Detected user intent"""
    CONTINUE = "continue"  # User wants to continue conversation
    OPT_OUT = "opt_out"  # User wants to stop/opt out
    CLARIFICATION = "clarification"  # User needs clarification
    TRANSFER = "transfer"  # User wants to speak to human
    AFFIRMATIVE = "affirmative"  # Yes/agree
    NEGATIVE = "negative"  # No/disagree
    QUESTION = "question"  # User is asking a question
    UNKNOWN = "unknown"  # Could not determine intent


class IntentDetector:
    """Rule-based intent detection (MVP - can be replaced with NLP)"""
    
    # Patterns for each intent
    OPT_OUT_PATTERNS = [
        r"\b(no|not interested|stop|don't call|remove|unsubscribe)\b",
        r"\b(not now|maybe later|another time)\b",
        r"\b(too busy|don't have time)\b"
    ]
    
    AFFIRMATIVE_PATTERNS = [
        r"\b(yes|yeah|yep|sure|okay|ok|fine|absolutely|definitely)\b",
        r"\b(that works|sounds good|perfect|great)\b"
    ]
    
    NEGATIVE_PATTERNS = [
        r"\b(no|nope|nah|not really|don't think so)\b",
        r"\b(not sure|don't know|maybe not)\b"
    ]
    
    QUESTION_PATTERNS = [
        r"\?",
        r"\b(what|how|why|when|where|who|can you|do you)\b",
        r"\b(explain|tell me|help me understand)\b"
    ]
    
    TRANSFER_PATTERNS = [
        r"\b(speak to|talk to|human|person|representative|agent)\b",
        r"\b(transfer|connect me|put me through)\b"
    ]
    
    CLARIFICATION_PATTERNS = [
        r"\b(repeat|say that again|what did you say|didn't catch that)\b",
        r"\b(what do you mean|clarify|explain)\b"
    ]
    
    def detect(self, text: str, context: Optional[Dict] = None) -> Tuple[Intent, float]:
        """
        Detect intent from text input
        
        Returns:
            Tuple of (Intent, confidence_score)
        """
        if not text:
            return Intent.UNKNOWN, 0.0
        
        text_lower = text.lower().strip()
        
        # Check patterns in order of specificity
        # Most specific first
        
        # Opt-out (high priority - respect immediately)
        if self._match_patterns(text_lower, self.OPT_OUT_PATTERNS):
            return Intent.OPT_OUT, 0.9
        
        # Transfer request
        if self._match_patterns(text_lower, self.TRANSFER_PATTERNS):
            return Intent.TRANSFER, 0.85
        
        # Clarification needed
        if self._match_patterns(text_lower, self.CLARIFICATION_PATTERNS):
            return Intent.CLARIFICATION, 0.8
        
        # Question
        if self._match_patterns(text_lower, self.QUESTION_PATTERNS):
            return Intent.QUESTION, 0.75
        
        # Affirmative
        if self._match_patterns(text_lower, self.AFFIRMATIVE_PATTERNS):
            return Intent.AFFIRMATIVE, 0.7
        
        # Negative
        if self._match_patterns(text_lower, self.NEGATIVE_PATTERNS):
            return Intent.NEGATIVE, 0.7
        
        # Default: assume continue if we have substantial text
        if len(text_lower) > 10:
            return Intent.CONTINUE, 0.6
        
        return Intent.UNKNOWN, 0.3
    
    def _match_patterns(self, text: str, patterns: List[str]) -> bool:
        """Check if text matches any pattern"""
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def extract_entities(self, text: str) -> Dict[str, any]:
        """
        Extract entities from text (business name, industry, etc.)
        MVP: Basic pattern matching
        Production: Use NLP service
        """
        entities = {}
        text_lower = text.lower()
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            entities['email'] = emails[0]
        
        # Extract phone number
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        phones = re.findall(phone_pattern, text)
        if phones:
            entities['phone'] = phones[0]
        
        # Extract business size indicators
        size_patterns = {
            'solo': r'\b(solo|just me|only me|one person)\b',
            'small': r'\b(\d+[- ]?(employees|people|staff)|small team|few people)\b',
            'medium': r'\b(\d+[- ]?(employees|people|staff)|medium|growing team)\b'
        }
        for size_type, pattern in size_patterns.items():
            if re.search(pattern, text_lower):
                entities['business_size'] = size_type
                break
        
        # Extract industry keywords (simplified)
        industry_keywords = {
            'legal': ['law', 'attorney', 'lawyer', 'legal', 'law firm'],
            'healthcare': ['health', 'medical', 'doctor', 'clinic', 'hospital'],
            'real_estate': ['real estate', 'realtor', 'property', 'realty'],
            'professional_services': ['consulting', 'consultant', 'advisory', 'services'],
            'ecommerce': ['ecommerce', 'online store', 'shop', 'retail'],
            'local_services': ['plumber', 'electrician', 'contractor', 'local']
        }
        
        for industry, keywords in industry_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                entities['industry'] = industry
                break
        
        return entities

