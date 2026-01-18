"""
Queue Manager - Manages email queue with SAFE MODE support

Handles:
- Adding leads to queue
- SAFE MODE routing (test emails vs real emails)
- Queue status management
- Google Sheets integration (ready for Apps Script)
"""

from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import json

from lead_engine.lead_processor import Lead, LeadStatus


class EmailType(Enum):
    """Type of email in queue"""
    DEMO = "demo"  # Initial demo email
    INITIAL = "initial"  # First follow-up
    FOLLOWUP_1 = "followup_1"  # Second follow-up
    FOLLOWUP_2 = "followup_2"  # Third follow-up
    FOLLOWUP_3 = "followup_3"  # Final follow-up (break-up email)


class QueueStatus(Enum):
    """Status of queue entry"""
    PENDING_REVIEW = "pending_review"  # Awaiting founder approval
    APPROVED = "approved"  # Approved, ready to send
    SENT = "sent"  # Already sent
    SKIPPED = "skipped"  # Skipped by founder
    FAILED = "failed"  # Send failed


@dataclass
class QueueEntry:
    """Entry in email queue"""
    queue_id: str
    lead_id: str
    business_name: str
    contact_email: str
    email_type: EmailType
    subject_line: str
    body: str
    send_date: datetime
    status: QueueStatus = QueueStatus.PENDING_REVIEW
    safe_mode: bool = True  # Default to safe mode
    created_at: datetime = None
    sent_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    
    # Additional metadata
    category: Optional[str] = None
    personalization_data: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.personalization_data is None:
            self.personalization_data = {}
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage (e.g., Google Sheets)"""
        data = asdict(self)
        data['email_type'] = self.email_type.value
        data['status'] = self.status.value
        data['send_date'] = self.send_date.isoformat()
        data['created_at'] = self.created_at.isoformat()
        if self.sent_at:
            data['sent_at'] = self.sent_at.isoformat()
        if self.reviewed_at:
            data['reviewed_at'] = self.reviewed_at.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'QueueEntry':
        """Create QueueEntry from dictionary"""
        data = data.copy()
        data['email_type'] = EmailType(data['email_type'])
        data['status'] = QueueStatus(data['status'])
        data['send_date'] = datetime.fromisoformat(data['send_date'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        if data.get('sent_at'):
            data['sent_at'] = datetime.fromisoformat(data['sent_at'])
        if data.get('reviewed_at'):
            data['reviewed_at'] = datetime.fromisoformat(data['reviewed_at'])
        return cls(**data)


class QueueManager:
    """Manages email queue with SAFE MODE support"""
    
    def __init__(self, safe_mode: bool = True, test_email: str = "test@afterhours.com"):
        """
        Initialize queue manager
        
        Args:
            safe_mode: If True, route all emails to test address
            test_email: Email address to use when safe_mode is True
        """
        self.safe_mode = safe_mode
        self.test_email = test_email
        self.queue: List[QueueEntry] = []
    
    def add_lead_to_queue(
        self,
        lead: Lead,
        email_templates: Dict[EmailType, Dict[str, str]],
        send_delays: Optional[Dict[EmailType, int]] = None
    ) -> List[QueueEntry]:
        """
        Add lead to queue with sequence of emails
        
        Args:
            lead: Lead to add
            email_templates: Dict mapping EmailType to {subject, body}
            send_delays: Days to delay each email type (default: DEMO=0, INITIAL=3, FOLLOWUP_1=7, etc.)
        
        Returns:
            List of QueueEntry objects created
        """
        if send_delays is None:
            send_delays = {
                EmailType.DEMO: 0,
                EmailType.INITIAL: 3,
                EmailType.FOLLOWUP_1: 7,
                EmailType.FOLLOWUP_2: 14,
                EmailType.FOLLOWUP_3: 21
            }
        
        entries = []
        base_date = datetime.now()
        
        # Create queue entries for each email type
        for email_type in [EmailType.DEMO, EmailType.INITIAL, EmailType.FOLLOWUP_1, 
                          EmailType.FOLLOWUP_2, EmailType.FOLLOWUP_3]:
            if email_type not in email_templates:
                continue
            
            template = email_templates[email_type]
            
            # Calculate send date
            delay_days = send_delays.get(email_type, 0)
            send_date = base_date + timedelta(days=delay_days)
            
            # Personalize email content
            subject = self._personalize(template['subject'], lead)
            body = self._personalize(template['body'], lead)
            
            # Determine recipient (safe mode vs real)
            recipient_email = self.test_email if self.safe_mode else lead.contact_email
            
            # Create queue entry
            entry = QueueEntry(
                queue_id=f"QUEUE_{lead.lead_id}_{email_type.value}",
                lead_id=lead.lead_id,
                business_name=lead.business_name,
                contact_email=recipient_email,  # Will be test_email if safe_mode
                email_type=email_type,
                subject_line=subject,
                body=body,
                send_date=send_date,
                safe_mode=self.safe_mode,
                category=lead.industry
            )
            
            entries.append(entry)
        
        self.queue.extend(entries)
        return entries
    
    def _personalize(self, template: str, lead: Lead) -> str:
        """Personalize email template with lead data"""
        replacements = {
            '{business_name}': lead.business_name,
            '{contact_name}': lead.contact_name or 'there',
            '{industry}': lead.industry or 'your industry',
            '{location}': f"{lead.location_city or ''}, {lead.location_state or ''}".strip(', ')
        }
        
        result = template
        for placeholder, value in replacements.items():
            result = result.replace(placeholder, value)
        
        return result
    
    def get_pending_review(self) -> List[QueueEntry]:
        """Get all entries pending review"""
        return [entry for entry in self.queue if entry.status == QueueStatus.PENDING_REVIEW]
    
    def get_ready_to_send(self) -> List[QueueEntry]:
        """Get all entries approved and ready to send (send_date <= now)"""
        now = datetime.now()
        return [
            entry for entry in self.queue
            if entry.status == QueueStatus.APPROVED
            and entry.send_date <= now
            and entry.status != QueueStatus.SENT
        ]
    
    def approve_entry(self, queue_id: str, reviewed_by: str = "founder") -> bool:
        """Approve a queue entry"""
        entry = self._find_entry(queue_id)
        if entry:
            entry.status = QueueStatus.APPROVED
            entry.reviewed_at = datetime.now()
            entry.reviewed_by = reviewed_by
            return True
        return False
    
    def skip_entry(self, queue_id: str, reviewed_by: str = "founder") -> bool:
        """Skip a queue entry"""
        entry = self._find_entry(queue_id)
        if entry:
            entry.status = QueueStatus.SKIPPED
            entry.reviewed_at = datetime.now()
            entry.reviewed_by = reviewed_by
            return True
        return False
    
    def mark_sent(self, queue_id: str) -> bool:
        """Mark entry as sent"""
        entry = self._find_entry(queue_id)
        if entry:
            entry.status = QueueStatus.SENT
            entry.sent_at = datetime.now()
            return True
        return False
    
    def mark_failed(self, queue_id: str, error: str = None) -> bool:
        """Mark entry as failed"""
        entry = self._find_entry(queue_id)
        if entry:
            entry.status = QueueStatus.FAILED
            if error and 'errors' not in entry.personalization_data:
                entry.personalization_data['errors'] = []
            if error:
                entry.personalization_data['errors'].append(error)
            return True
        return False
    
    def toggle_safe_mode(self, safe_mode: bool = None) -> bool:
        """Toggle safe mode on/off"""
        if safe_mode is None:
            self.safe_mode = not self.safe_mode
        else:
            self.safe_mode = safe_mode
        
        # Update all pending entries to use correct email
        for entry in self.queue:
            if entry.status in [QueueStatus.PENDING_REVIEW, QueueStatus.APPROVED]:
                if self.safe_mode:
                    entry.contact_email = self.test_email
                else:
                    # Would need to restore original email from lead data
                    pass
                entry.safe_mode = self.safe_mode
        
        return self.safe_mode
    
    def _find_entry(self, queue_id: str) -> Optional[QueueEntry]:
        """Find queue entry by ID"""
        for entry in self.queue:
            if entry.queue_id == queue_id:
                return entry
        return None
    
    def export_to_sheets_format(self) -> List[Dict]:
        """Export queue to format suitable for Google Sheets"""
        return [entry.to_dict() for entry in self.queue]
    
    def load_from_sheets_format(self, data: List[Dict]) -> None:
        """Load queue from Google Sheets format"""
        self.queue = [QueueEntry.from_dict(entry) for entry in data]

