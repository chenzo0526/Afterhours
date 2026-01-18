"""
Lead Ranking System

Ranks leads by quality, fit, and likelihood to convert.
Uses heuristics to score leads for prioritization.
"""

from typing import List, Dict
from lead_engine.lead_processor import Lead
from lead_engine.decision_maker_detector import DecisionMakerDetector


class LeadRanker:
    """Ranks leads by quality and fit"""
    
    def __init__(self):
        self.detector = DecisionMakerDetector()
    
    def rank_leads(self, leads: List[Lead]) -> List[Lead]:
        """
        Rank leads by overall quality score
        
        Scoring factors:
        - Decision-maker likelihood (0-0.4)
        - Data completeness (0-0.2)
        - Industry match (0-0.2)
        - Business size fit (0-0.2)
        
        Returns:
            List of leads sorted by rank (highest first)
        """
        for lead in leads:
            # Calculate decision-maker score
            dm_result = self.detector.detect(lead)
            lead.is_decision_maker_likely = dm_result['is_decision_maker_likely']
            lead.decision_maker_score = dm_result['decision_maker_score']
            
            # Calculate overall rank score
            rank_score = self._calculate_rank_score(lead)
            lead.raw_data['rank_score'] = rank_score
        
        # Sort by rank score (highest first)
        return sorted(leads, key=lambda l: l.raw_data.get('rank_score', 0), reverse=True)
    
    def _calculate_rank_score(self, lead: Lead) -> float:
        """Calculate overall rank score for a lead"""
        score = 0.0
        
        # Decision-maker score (0-0.4)
        score += lead.decision_maker_score * 0.4
        
        # Data completeness (0-0.2)
        completeness = self._calculate_completeness(lead)
        score += completeness * 0.2
        
        # Industry match (0-0.2) - prefer certain industries
        industry_score = self._score_industry(lead.industry)
        score += industry_score * 0.2
        
        # Business size fit (0-0.2) - prefer solo/small
        size_score = self._score_business_size(lead.business_size)
        score += size_score * 0.2
        
        return round(score, 3)
    
    def _calculate_completeness(self, lead: Lead) -> float:
        """Calculate data completeness score"""
        fields = [
            'business_name', 'contact_email', 'contact_name',
            'contact_phone', 'industry', 'location_city', 'location_state',
            'business_website', 'business_size'
        ]
        
        completed = sum(1 for field in fields if getattr(lead, field, None))
        return completed / len(fields)
    
    def _score_industry(self, industry: Optional[str]) -> float:
        """Score industry preference"""
        if not industry:
            return 0.5  # Neutral if unknown
        
        # Higher scores for industries we have templates/expertise for
        preferred_industries = {
            'legal': 1.0,
            'healthcare': 0.9,
            'professional_services': 0.9,
            'real_estate': 0.8,
            'local_services': 0.7,
            'accounting': 0.8,
            'ecommerce': 0.6,
            'technology': 0.7
        }
        
        return preferred_industries.get(industry, 0.5)
    
    def _score_business_size(self, size: Optional[str]) -> float:
        """Score business size preference"""
        if not size:
            return 0.5
        
        # Prefer solo/small (easier to convert, decision-maker clearer)
        size_scores = {
            'solo': 1.0,
            'small': 0.9,
            'medium': 0.7,
            'large': 0.5
        }
        
        return size_scores.get(size, 0.5)
    
    def filter_by_rank(self, leads: List[Lead], min_score: float = 0.3) -> List[Lead]:
        """Filter leads by minimum rank score"""
        ranked = self.rank_leads(leads)
        return [l for l in ranked if l.raw_data.get('rank_score', 0) >= min_score]

