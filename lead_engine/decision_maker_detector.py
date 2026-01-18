"""
Decision Maker Detection - Heuristics to identify likely decision-makers

Uses patterns in email addresses, business size, titles, and other signals
to score likelihood that contact is a decision-maker.
"""

import re
from typing import Dict, List, Optional
from lead_engine.lead_processor import Lead


class DecisionMakerDetector:
    """Detects likely decision-makers using heuristics"""
    
    # Email patterns suggesting decision-maker
    DECISION_MAKER_EMAIL_PATTERNS = [
        r'^(owner|founder|ceo|president|director|principal|partner|manager)@',
        r'^[a-z]+\.[a-z]+@',  # first.last@domain.com
        r'^[a-z]+@',  # firstname@domain.com
    ]
    
    # Email patterns suggesting NOT decision-maker
    NON_DECISION_MAKER_EMAIL_PATTERNS = [
        r'^(info|contact|hello|support|sales|marketing|admin|noreply|help|service)@',
        r'^[a-z]+[0-9]+@',  # generic123@domain.com
        r'^team@',
        r'^office@',
    ]
    
    # Title keywords suggesting decision-maker
    DECISION_MAKER_TITLES = [
        'owner', 'founder', 'ceo', 'president', 'director', 'principal',
        'partner', 'manager', 'vp', 'vice president', 'head of', 'chief'
    ]
    
    # Business size thresholds
    SOLO_THRESHOLD = 1  # Solo = definitely decision-maker
    SMALL_THRESHOLD = 10  # Small = likely decision-maker
    MEDIUM_THRESHOLD = 50  # Medium = maybe decision-maker
    
    def detect(self, lead: Lead) -> Dict[str, any]:
        """
        Detect if lead is likely a decision-maker
        
        Returns:
            Dict with:
            - is_decision_maker_likely: bool
            - decision_maker_score: float (0.0-1.0)
            - signals: List of signals that contributed
        """
        score = 0.0
        signals = []
        
        # Signal 1: Email pattern (0.0-0.4 points)
        email_score, email_signals = self._score_email(lead.contact_email)
        score += email_score
        signals.extend(email_signals)
        
        # Signal 2: Contact name/title (0.0-0.3 points)
        name_score, name_signals = self._score_name_title(lead.contact_name, lead.business_name)
        score += name_score
        signals.extend(name_signals)
        
        # Signal 3: Business size (0.0-0.3 points)
        size_score, size_signals = self._score_business_size(lead.business_size)
        score += size_score
        signals.extend(size_signals)
        
        # Normalize score to 0.0-1.0
        score = min(1.0, score)
        
        # Threshold: >= 0.6 = likely decision-maker
        is_decision_maker_likely = score >= 0.6
        
        return {
            'is_decision_maker_likely': is_decision_maker_likely,
            'decision_maker_score': round(score, 2),
            'signals': signals
        }
    
    def _score_email(self, email: str) -> tuple[float, List[str]]:
        """Score email address for decision-maker likelihood"""
        if not email:
            return 0.0, []
        
        email_lower = email.lower()
        score = 0.0
        signals = []
        
        # Check for non-decision-maker patterns (negative signal)
        for pattern in self.NON_DECISION_MAKER_EMAIL_PATTERNS:
            if re.match(pattern, email_lower):
                score -= 0.3
                signals.append(f"Email pattern suggests non-decision-maker: {email}")
                break
        
        # Check for decision-maker patterns (positive signal)
        for pattern in self.DECISION_MAKER_EMAIL_PATTERNS:
            if re.match(pattern, email_lower):
                score += 0.4
                signals.append(f"Email pattern suggests decision-maker: {email}")
                break
        
        # Check for first.last pattern (strong positive)
        if re.match(r'^[a-z]+\.[a-z]+@', email_lower):
            score += 0.2
            signals.append("First.last email format suggests personal contact")
        
        # Check for firstname@domain (moderate positive)
        elif re.match(r'^[a-z]+@', email_lower):
            score += 0.1
            signals.append("Firstname email format suggests personal contact")
        
        return max(0.0, min(0.4, score)), signals
    
    def _score_name_title(self, contact_name: Optional[str], business_name: Optional[str]) -> tuple[float, List[str]]:
        """Score contact name for decision-maker indicators"""
        if not contact_name:
            return 0.0, []
        
        name_lower = contact_name.lower()
        score = 0.0
        signals = []
        
        # Check for decision-maker titles in name
        for title in self.DECISION_MAKER_TITLES:
            if title in name_lower:
                score += 0.3
                signals.append(f"Title in name suggests decision-maker: {title}")
                break
        
        # Check if name matches business name (owner likely)
        if business_name:
            business_words = set(business_name.lower().split())
            name_words = set(name_lower.split())
            # Remove common words
            common_words = {'the', 'llc', 'inc', 'corp', 'ltd', 'and', 'of', 'a'}
            business_words -= common_words
            name_words -= common_words
            
            # If significant overlap, likely owner
            if business_words and name_words:
                overlap = len(business_words & name_words) / len(business_words | name_words)
                if overlap > 0.3:
                    score += 0.2
                    signals.append("Name matches business name (likely owner)")
        
        return min(0.3, score), signals
    
    def _score_business_size(self, business_size: Optional[str]) -> tuple[float, List[str]]:
        """Score business size for decision-maker likelihood"""
        if not business_size:
            return 0.0, []
        
        score = 0.0
        signals = []
        
        size_lower = business_size.lower()
        
        if size_lower == 'solo':
            score = 0.3  # Solo = definitely decision-maker
            signals.append("Solo business = decision-maker")
        elif size_lower == 'small':
            score = 0.25  # Small = likely decision-maker
            signals.append("Small business = likely decision-maker")
        elif size_lower == 'medium':
            score = 0.15  # Medium = maybe decision-maker
            signals.append("Medium business = maybe decision-maker")
        elif size_lower == 'large':
            score = 0.05  # Large = less likely to be decision-maker
            signals.append("Large business = less likely decision-maker")
        
        return score, signals
    
    def batch_detect(self, leads: List[Lead]) -> List[Lead]:
        """Detect decision-makers for a batch of leads"""
        for lead in leads:
            result = self.detect(lead)
            lead.is_decision_maker_likely = result['is_decision_maker_likely']
            lead.decision_maker_score = result['decision_maker_score']
            # Store signals in raw_data for reference
            if 'signals' not in lead.raw_data:
                lead.raw_data['signals'] = []
            lead.raw_data['signals'].extend(result['signals'])
        
        return leads

