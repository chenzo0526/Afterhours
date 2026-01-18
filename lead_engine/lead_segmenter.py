"""
Lead Segmentation

Segments leads by industry, size, location, and other attributes.
Helps with targeted outreach and template selection.
"""

from typing import List, Dict, Set
from collections import defaultdict
from lead_engine.lead_processor import Lead


class LeadSegmenter:
    """Segments leads into categories"""
    
    def __init__(self):
        self.segments: Dict[str, List[Lead]] = defaultdict(list)
    
    def segment_by_industry(self, leads: List[Lead]) -> Dict[str, List[Lead]]:
        """Segment leads by industry"""
        segments = defaultdict(list)
        
        for lead in leads:
            industry = lead.industry or "unknown"
            segments[industry].append(lead)
        
        return dict(segments)
    
    def segment_by_size(self, leads: List[Lead]) -> Dict[str, List[Lead]]:
        """Segment leads by business size"""
        segments = defaultdict(list)
        
        for lead in leads:
            size = lead.business_size or "unknown"
            segments[size].append(lead)
        
        return dict(segments)
    
    def segment_by_location(self, leads: List[Lead]) -> Dict[str, List[Lead]]:
        """Segment leads by state"""
        segments = defaultdict(list)
        
        for lead in leads:
            state = lead.location_state or "unknown"
            segments[state].append(lead)
        
        return dict(segments)
    
    def segment_by_decision_maker(self, leads: List[Lead]) -> Dict[str, List[Lead]]:
        """Segment leads by decision-maker status"""
        segments = {
            "decision_maker": [],
            "not_decision_maker": [],
            "unknown": []
        }
        
        for lead in leads:
            if lead.is_decision_maker_likely is True:
                segments["decision_maker"].append(lead)
            elif lead.is_decision_maker_likely is False:
                segments["not_decision_maker"].append(lead)
            else:
                segments["unknown"].append(lead)
        
        return segments
    
    def segment_multi_dimension(
        self,
        leads: List[Lead],
        dimensions: List[str] = None
    ) -> Dict[str, List[Lead]]:
        """
        Segment leads by multiple dimensions
        
        Args:
            leads: List of leads to segment
            dimensions: List of dimension names (industry, size, location_state, decision_maker)
        
        Returns:
            Dict mapping segment keys to lists of leads
        """
        if dimensions is None:
            dimensions = ["industry", "size", "location_state"]
        
        segments = defaultdict(list)
        
        for lead in leads:
            # Create composite key from dimensions
            key_parts = []
            for dim in dimensions:
                if dim == "industry":
                    key_parts.append(lead.industry or "unknown")
                elif dim == "size":
                    key_parts.append(lead.business_size or "unknown")
                elif dim == "location_state":
                    key_parts.append(lead.location_state or "unknown")
                elif dim == "decision_maker":
                    if lead.is_decision_maker_likely:
                        key_parts.append("dm")
                    else:
                        key_parts.append("not_dm")
            
            segment_key = "|".join(key_parts)
            segments[segment_key].append(lead)
        
        return dict(segments)
    
    def get_segment_summary(self, segments: Dict[str, List[Lead]]) -> Dict[str, int]:
        """Get summary counts for segments"""
        return {key: len(leads) for key, leads in segments.items()}

