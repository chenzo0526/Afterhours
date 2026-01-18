"""
Main entry point for Lead Engine

Example usage and integration
"""

import csv
from lead_engine.lead_processor import LeadProcessor
from lead_engine.decision_maker_detector import DecisionMakerDetector
from lead_engine.queue_manager import QueueManager, EmailType


def example_process_csv():
    """Example: Process leads from CSV file"""
    
    # Initialize processors
    processor = LeadProcessor()
    detector = DecisionMakerDetector()
    queue_manager = QueueManager(safe_mode=True, test_email="test@afterhours.com")
    
    # Load leads from CSV
    print("Loading leads from CSV...")
    leads = processor.load_from_csv("example_leads.csv")
    print(f"Loaded {len(leads)} leads")
    
    # Deduplicate
    print("Deduplicating...")
    unique_leads = processor.deduplicate(leads)
    print(f"Found {len(unique_leads)} unique leads, {len(processor.duplicates)} duplicates")
    
    # Validate
    print("Validating...")
    valid_leads, invalid_leads = processor.validate_leads(unique_leads)
    print(f"Valid: {len(valid_leads)}, Invalid: {len(invalid_leads)}")
    
    # Detect decision-makers
    print("Detecting decision-makers...")
    scored_leads = detector.batch_detect(valid_leads)
    
    # Show results
    decision_makers = [l for l in scored_leads if l.is_decision_maker_likely]
    print(f"\nDecision-makers detected: {len(decision_makers)}/{len(scored_leads)}")
    
    for lead in decision_makers[:5]:  # Show first 5
        print(f"  - {lead.business_name}: {lead.contact_email} (score: {lead.decision_maker_score})")
    
    # Add to queue (example templates)
    email_templates = {
        EmailType.DEMO: {
            "subject": "Quick question about {industry} operations",
            "body": "Hi {contact_name},\n\nThanks for your interest. I've prepared a demo email for {business_name}.\n\n[Demo content here]"
        },
        EmailType.INITIAL: {
            "subject": "Following up on {business_name}",
            "body": "Hi {contact_name},\n\nFollowing up on the demo email I sent..."
        }
    }
    
    print("\nAdding leads to queue...")
    for lead in decision_makers[:3]:  # Add first 3 to queue
        entries = queue_manager.add_lead_to_queue(lead, email_templates)
        print(f"  Added {len(entries)} queue entries for {lead.business_name}")
    
    # Show pending review
    pending = queue_manager.get_pending_review()
    print(f"\nPending review: {len(pending)} entries")
    
    # Export for Google Sheets
    sheets_data = queue_manager.export_to_sheets_format()
    print(f"\nExported {len(sheets_data)} entries for Google Sheets")
    
    return queue_manager


if __name__ == "__main__":
    import sys
    
    # If run as CLI, use CLI interface
    if len(sys.argv) > 1:
        from lead_engine.cli import main
        main()
    else:
        # Otherwise run example
        print("=== Afterhours Lead Engine MVP ===\n")
        print("Note: This example requires 'example_leads.csv' file")
        print("Creating sample CSV for demonstration...\n")
        print("For CLI usage, run: python -m lead_engine.cli process <input_file> --output <output_file>\n")
        
        # Create sample CSV
        sample_data = [
            {
                "business_name": "Smith Legal Services",
                "email": "john.smith@smithlegal.com",
                "contact_name": "John Smith",
                "phone": "555-123-4567",
                "industry": "legal",
                "city": "San Francisco",
                "state": "CA",
                "size": "solo"
            },
            {
                "business_name": "ABC Healthcare Clinic",
                "email": "info@abchealth.com",
                "contact_name": "Dr. Jane Doe",
                "phone": "555-987-6543",
                "industry": "healthcare",
                "city": "Los Angeles",
                "state": "CA",
                "size": "small"
            }
        ]
        
        with open("example_leads.csv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=sample_data[0].keys())
            writer.writeheader()
            writer.writerows(sample_data)
        
        print("Created example_leads.csv\n")
        example_process_csv()

