"""
Lead Processor - Normalizes and processes leads from CSV/Sheet input

Handles:
- CSV/Sheet import
- Data normalization
- Validation
- Deduplication
"""

import csv
import re
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum


class LeadSource(Enum):
    """Source of lead"""
    CSV = "csv"
    GOOGLE_SHEET = "google_sheet"
    MANUAL = "manual"
    API = "api"


class LeadStatus(Enum):
    """Status of lead in system"""
    NEW = "new"
    PROCESSED = "processed"
    QUEUED = "queued"
    CONTACTED = "contacted"
    SKIPPED = "skipped"
    DUPLICATE = "duplicate"


@dataclass
class Lead:
    """Normalized lead data structure"""
    # Required fields
    business_name: str
    contact_email: str
    
    # Optional but preferred
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    business_website: Optional[str] = None
    industry: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: str = "US"
    
    # Metadata
    business_size: Optional[str] = None  # solo, small, medium, large
    years_in_business: Optional[int] = None
    source: str = "unknown"
    lead_id: Optional[str] = None
    status: LeadStatus = LeadStatus.NEW
    
    # Decision-maker detection (filled by processor)
    is_decision_maker_likely: Optional[bool] = None
    decision_maker_score: float = 0.0
    
    # Additional data
    raw_data: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.raw_data is None:
            self.raw_data = {}
        if not self.lead_id:
            self.lead_id = self._generate_lead_id()
    
    def _generate_lead_id(self) -> str:
        """Generate unique lead ID"""
        import hashlib
        key = f"{self.business_name}_{self.contact_email}".lower()
        return f"LEAD_{hashlib.md5(key.encode()).hexdigest()[:8].upper()}"
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        data = asdict(self)
        data['status'] = self.status.value
        return data


class LeadProcessor:
    """Processes and normalizes leads from various sources"""
    
    # Common industry mappings
    INDUSTRY_MAPPINGS = {
        'legal': ['law', 'attorney', 'lawyer', 'legal', 'law firm', 'legal services'],
        'healthcare': ['health', 'medical', 'doctor', 'clinic', 'hospital', 'healthcare'],
        'real_estate': ['real estate', 'realtor', 'property', 'realty', 'real estate agent'],
        'professional_services': ['consulting', 'consultant', 'advisory', 'professional services'],
        'ecommerce': ['ecommerce', 'online store', 'shop', 'retail', 'e-commerce'],
        'local_services': ['plumber', 'electrician', 'contractor', 'local services', 'home services'],
        'accounting': ['accountant', 'accounting', 'cpa', 'tax', 'bookkeeping'],
        'marketing': ['marketing', 'advertising', 'agency', 'digital marketing'],
        'technology': ['tech', 'software', 'it', 'technology', 'saas']
    }
    
    # Email patterns that suggest decision-maker
    DECISION_MAKER_EMAIL_PATTERNS = [
        r'^(owner|founder|ceo|president|director|principal|partner)@',
        r'^[a-z]+\.[a-z]+@',  # first.last@domain.com
        r'^[a-z]+@',  # firstname@domain.com
    ]
    
    # Non-decision-maker patterns
    NON_DECISION_MAKER_PATTERNS = [
        r'^(info|contact|hello|support|sales|marketing|admin|noreply)@',
        r'^[a-z]+[0-9]+@',  # generic123@domain.com
    ]
    
    def __init__(self):
        self.processed_leads: List[Lead] = []
        self.duplicates: List[Lead] = []
    
    def load_from_csv(self, file_path: str) -> List[Lead]:
        """Load leads from CSV file"""
        leads = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                lead = self._normalize_row(row, LeadSource.CSV.value)
                if lead:
                    leads.append(lead)
        
        return leads
    
    def load_from_dict_list(self, data: List[Dict], source: str = "manual") -> List[Lead]:
        """Load leads from list of dictionaries (e.g., from Google Sheets API)"""
        leads = []
        for row in data:
            lead = self._normalize_row(row, source)
            if lead:
                leads.append(lead)
        return leads
    
    def _normalize_row(self, row: Dict, source: str) -> Optional[Lead]:
        """Normalize a single row of data into Lead object"""
        
        # Extract required fields (try multiple column name variations)
        business_name = self._extract_field(row, [
            'business_name', 'business', 'company', 'company_name', 'name', 'organization'
        ])
        
        contact_email = self._extract_field(row, [
            'email', 'contact_email', 'e-mail', 'email_address', 'contact'
        ])
        
        # Validate required fields
        if not business_name or not contact_email:
            return None
        
        if not self._is_valid_email(contact_email):
            return None
        
        # Extract optional fields
        contact_name = self._extract_field(row, [
            'contact_name', 'name', 'contact', 'owner', 'founder', 'decision_maker'
        ])
        
        contact_phone = self._extract_field(row, [
            'phone', 'contact_phone', 'phone_number', 'tel', 'telephone'
        ])
        
        business_website = self._extract_field(row, [
            'website', 'url', 'web', 'site', 'domain'
        ])
        
        industry = self._extract_field(row, [
            'industry', 'category', 'sector', 'type', 'business_type'
        ])
        
        location_city = self._extract_field(row, [
            'city', 'location_city', 'town'
        ])
        
        location_state = self._extract_field(row, [
            'state', 'location_state', 'province', 'region'
        ])
        
        # Normalize industry
        if industry:
            industry = self._normalize_industry(industry)
        
        # Normalize business size
        business_size = self._extract_business_size(row)
        
        # Create lead
        lead = Lead(
            business_name=business_name.strip(),
            contact_email=contact_email.lower().strip(),
            contact_name=contact_name.strip() if contact_name else None,
            contact_phone=self._normalize_phone(contact_phone) if contact_phone else None,
            business_website=self._normalize_website(business_website) if business_website else None,
            industry=industry,
            location_city=location_city.strip() if location_city else None,
            location_state=location_state.strip().upper() if location_state else None,
            business_size=business_size,
            source=source,
            raw_data=row
        )
        
        return lead
    
    def _extract_field(self, row: Dict, possible_keys: List[str]) -> Optional[str]:
        """Extract field value trying multiple key variations"""
        for key in possible_keys:
            # Try exact match
            if key in row and row[key]:
                return str(row[key]).strip()
            # Try case-insensitive
            for row_key in row.keys():
                if row_key.lower() == key.lower() and row[row_key]:
                    return str(row[row_key]).strip()
        return None
    
    def _is_valid_email(self, email: str) -> bool:
        """Basic email validation"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def _normalize_industry(self, industry: str) -> Optional[str]:
        """Normalize industry to standard categories"""
        industry_lower = industry.lower()
        
        for category, keywords in self.INDUSTRY_MAPPINGS.items():
            if any(keyword in industry_lower for keyword in keywords):
                return category
        
        return industry.lower() if industry else None
    
    def _extract_business_size(self, row: Dict) -> Optional[str]:
        """Extract business size from row"""
        size_field = self._extract_field(row, ['size', 'employees', 'employee_count', 'team_size'])
        
        if not size_field:
            return None
        
        size_lower = size_field.lower()
        
        # Check for solo indicators
        if any(word in size_lower for word in ['solo', 'just me', 'one', '1', 'individual']):
            return 'solo'
        
        # Check for small (2-10)
        if any(word in size_lower for word in ['small', 'few', '2-10', '3-5', '5-10']):
            return 'small'
        
        # Check for medium (11-50)
        if any(word in size_lower for word in ['medium', '11-50', '20-50', 'growing']):
            return 'medium'
        
        # Check for large (50+)
        if any(word in size_lower for word in ['large', '50+', '100+', 'enterprise']):
            return 'large'
        
        # Try to parse number
        try:
            num = int(re.search(r'\d+', size_field).group())
            if num == 1:
                return 'solo'
            elif 2 <= num <= 10:
                return 'small'
            elif 11 <= num <= 50:
                return 'medium'
            elif num > 50:
                return 'large'
        except:
            pass
        
        return None
    
    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number format"""
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        # Format as +1XXXXXXXXXX (US format)
        if len(digits) == 10:
            return f"+1{digits}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"+{digits}"
        elif digits.startswith('+'):
            return digits
        
        return phone  # Return as-is if can't normalize
    
    def _normalize_website(self, website: str) -> str:
        """Normalize website URL"""
        website = website.strip()
        if not website.startswith(('http://', 'https://')):
            website = f"https://{website}"
        return website
    
    def deduplicate(self, leads: List[Lead]) -> List[Lead]:
        """Remove duplicate leads based on email or business name"""
        seen_emails = set()
        seen_businesses = set()
        unique_leads = []
        duplicates = []
        
        for lead in leads:
            email_key = lead.contact_email.lower()
            business_key = f"{lead.business_name.lower()}_{lead.location_city or ''}"
            
            if email_key in seen_emails or business_key in seen_businesses:
                lead.status = LeadStatus.DUPLICATE
                duplicates.append(lead)
            else:
                seen_emails.add(email_key)
                seen_businesses.add(business_key)
                unique_leads.append(lead)
        
        self.duplicates = duplicates
        return unique_leads
    
    def validate_leads(self, leads: List[Lead]) -> tuple[List[Lead], List[Lead]]:
        """Validate leads and separate valid from invalid"""
        valid = []
        invalid = []
        
        for lead in leads:
            if self._is_valid_email(lead.contact_email) and lead.business_name:
                valid.append(lead)
            else:
                invalid.append(lead)
        
        return valid, invalid

