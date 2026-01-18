# Afterhours Lead Engine

Processes leads, detects decision-makers, and manages email queue with SAFE MODE support.

## Components

1. **Lead Processor** (`lead_processor.py`) - Normalizes and validates leads from CSV/Sheet input
2. **Decision Maker Detector** (`decision_maker_detector.py`) - Heuristics to identify likely decision-makers
3. **Queue Manager** (`queue_manager.py`) - Manages email queue with SAFE MODE routing

## Usage

### Process Leads from CSV

```python
from lead_engine.lead_processor import LeadProcessor
from lead_engine.decision_maker_detector import DecisionMakerDetector
from lead_engine.queue_manager import QueueManager, EmailType

# Initialize
processor = LeadProcessor()
detector = DecisionMakerDetector()
queue_manager = QueueManager(safe_mode=True, test_email="test@afterhours.com")

# Load and process
leads = processor.load_from_csv("leads.csv")
unique_leads = processor.deduplicate(leads)
valid_leads, invalid = processor.validate_leads(unique_leads)

# Detect decision-makers
scored_leads = detector.batch_detect(valid_leads)

# Add to queue
email_templates = {
    EmailType.DEMO: {"subject": "...", "body": "..."},
    EmailType.INITIAL: {"subject": "...", "body": "..."}
}
queue_manager.add_lead_to_queue(lead, email_templates)
```

### Google Sheets Integration

The queue manager exports data in Google Sheets format:

```python
# Export for Google Sheets
sheets_data = queue_manager.export_to_sheets_format()

# In Google Apps Script:
# - Import this data into EMAIL_QUEUE sheet
# - Use QueueManager logic to handle SAFE_MODE routing
# - Email sender script reads APPROVED entries and sends
```

## SAFE MODE

When `safe_mode=True`, all emails route to test email address instead of real leads. This allows testing the full system without sending real emails.

```python
# Enable safe mode
queue_manager = QueueManager(safe_mode=True, test_email="test@afterhours.com")

# Disable safe mode (when ready)
queue_manager.toggle_safe_mode(False)
```

## Decision-Maker Detection

The detector uses heuristics:
- Email patterns (first.last@domain.com = likely decision-maker)
- Business size (solo/small = likely decision-maker)
- Contact name/title (owner/founder/CEO = decision-maker)

Scores range from 0.0-1.0. Scores >= 0.6 are considered "likely decision-maker".

## Queue Entry Status Flow

```
PENDING_REVIEW → APPROVED → SENT
                ↓
            SKIPPED
                ↓
            FAILED
```

1. Entries start as `PENDING_REVIEW`
2. Founder reviews and approves/skips
3. Approved entries send when `send_date <= now`
4. Status updates to `SENT` or `FAILED`

## Next Steps

1. **Integrate with Google Sheets** - Use Apps Script to sync queue
2. **Add email templates** - Build category-specific templates
3. **Add analytics** - Track open rates, reply rates, conversions
4. **Enhance decision-maker detection** - Add ML models or external APIs

