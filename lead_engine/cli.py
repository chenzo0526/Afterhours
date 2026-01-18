#!/usr/bin/env python3
"""
Command-line interface for Lead Engine

Usage:
    python -m lead_engine.cli process leads.csv --output processed_leads.csv
    python -m lead_engine.cli process leads.csv --output processed_leads.csv --safe-mode
    python -m lead_engine.cli process leads.csv --output processed_leads.csv --no-safe-mode
"""

import argparse
import csv
import sys
from pathlib import Path

from lead_engine.lead_sources import LeadSourceLoader
from lead_engine.lead_processor import LeadProcessor
from lead_engine.decision_maker_detector import DecisionMakerDetector
from lead_engine.lead_ranker import LeadRanker
from lead_engine.lead_segmenter import LeadSegmenter
from lead_engine.queue_manager import QueueManager, EmailType
from lead_engine.config import LeadEngineConfig


def process_leads(
    input_file: str,
    output_file: str,
    safe_mode: bool = True,
    config_file: str = None
):
    """
    Process leads from input file and output processed CSV
    
    Args:
        input_file: Path to input CSV/JSON file
        output_file: Path to output CSV file
        safe_mode: Whether to enable SAFE_MODE
        config_file: Path to config file
    """
    # Load config
    config = LeadEngineConfig(config_file)
    if safe_mode is not None:
        config.safe_mode = safe_mode
    
    print(f"Loading leads from {input_file}...")
    
    # Load leads
    loader = LeadSourceLoader()
    leads = loader.load_from_file(input_file)
    print(f"Loaded {len(leads)} leads")
    
    # Deduplicate
    processor = LeadProcessor()
    unique_leads = processor.deduplicate(leads)
    print(f"Found {len(unique_leads)} unique leads, {len(processor.duplicates)} duplicates")
    
    # Validate
    valid_leads, invalid_leads = processor.validate_leads(unique_leads)
    print(f"Valid: {len(valid_leads)}, Invalid: {len(invalid_leads)}")
    
    if invalid_leads:
        print(f"\nInvalid leads (skipped):")
        for lead in invalid_leads[:5]:
            print(f"  - {lead.business_name}: {lead.contact_email}")
    
    # Detect decision-makers
    print("\nDetecting decision-makers...")
    detector = DecisionMakerDetector()
    scored_leads = detector.batch_detect(valid_leads)
    
    decision_makers = [l for l in scored_leads if l.is_decision_maker_likely]
    print(f"Decision-makers: {len(decision_makers)}/{len(scored_leads)}")
    
    # Rank leads
    print("\nRanking leads...")
    ranker = LeadRanker()
    ranked_leads = ranker.rank_leads(scored_leads)
    
    # Filter by minimum score
    min_score = config.get("ranking.min_score", 0.3)
    filtered_leads = ranker.filter_by_rank(ranked_leads, min_score)
    print(f"Leads above threshold ({min_score}): {len(filtered_leads)}")
    
    # Segment leads
    print("\nSegmenting leads...")
    segmenter = LeadSegmenter()
    segments = segmenter.segment_by_industry(filtered_leads)
    summary = segmenter.get_segment_summary(segments)
    print("Segments by industry:")
    for industry, count in sorted(summary.items(), key=lambda x: x[1], reverse=True):
        print(f"  {industry}: {count}")
    
    # Export to CSV
    print(f"\nExporting to {output_file}...")
    export_leads_to_csv(filtered_leads, output_file)
    print(f"Exported {len(filtered_leads)} leads")
    
    # Optionally add to queue
    if config.get("queue.auto_add", False):
        print("\nAdding to queue...")
        queue_manager = QueueManager(
            safe_mode=config.safe_mode,
            test_email=config.test_email
        )
        
        # Load email templates (would come from config or file)
        email_templates = {
            EmailType.DEMO: {
                "subject": "Quick question about {industry} operations",
                "body": "Hi {contact_name},\n\nThanks for your interest..."
            }
        }
        
        for lead in filtered_leads[:10]:  # Limit to first 10
            queue_manager.add_lead_to_queue(lead, email_templates)
        
        print(f"Added {len(queue_manager.queue)} entries to queue")
        
        # Export queue
        queue_file = output_file.replace('.csv', '_queue.csv')
        export_queue_to_csv(queue_manager, queue_file)
        print(f"Exported queue to {queue_file}")


def export_leads_to_csv(leads, output_file: str):
    """Export leads to CSV file"""
    if not leads:
        return
    
    fieldnames = [
        'lead_id', 'business_name', 'contact_email', 'contact_name',
        'contact_phone', 'industry', 'location_city', 'location_state',
        'business_size', 'is_decision_maker_likely', 'decision_maker_score',
        'rank_score', 'source'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for lead in leads:
            row = {
                'lead_id': lead.lead_id,
                'business_name': lead.business_name,
                'contact_email': lead.contact_email,
                'contact_name': lead.contact_name or '',
                'contact_phone': lead.contact_phone or '',
                'industry': lead.industry or '',
                'location_city': lead.location_city or '',
                'location_state': lead.location_state or '',
                'business_size': lead.business_size or '',
                'is_decision_maker_likely': 'Yes' if lead.is_decision_maker_likely else 'No',
                'decision_maker_score': lead.decision_maker_score,
                'rank_score': lead.raw_data.get('rank_score', 0),
                'source': lead.source
            }
            writer.writerow(row)


def export_queue_to_csv(queue_manager: QueueManager, output_file: str):
    """Export queue to CSV file"""
    queue_data = queue_manager.export_to_sheets_format()
    
    if not queue_data:
        return
    
    fieldnames = [
        'queue_id', 'lead_id', 'business_name', 'contact_email',
        'email_type', 'subject_line', 'send_date', 'status', 'safe_mode'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for entry in queue_data:
            row = {
                'queue_id': entry.get('queue_id', ''),
                'lead_id': entry.get('lead_id', ''),
                'business_name': entry.get('business_name', ''),
                'contact_email': entry.get('contact_email', ''),
                'email_type': entry.get('email_type', ''),
                'subject_line': entry.get('subject_line', ''),
                'send_date': entry.get('send_date', ''),
                'status': entry.get('status', ''),
                'safe_mode': entry.get('safe_mode', True)
            }
            writer.writerow(row)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description='Afterhours Lead Engine CLI')
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Process command
    process_parser = subparsers.add_parser('process', help='Process leads from file')
    process_parser.add_argument('input_file', help='Input CSV or JSON file')
    process_parser.add_argument('--output', '-o', required=True, help='Output CSV file')
    process_parser.add_argument('--config', '-c', help='Config file path')
    process_parser.add_argument(
        '--safe-mode',
        action='store_true',
        default=None,
        help='Enable SAFE_MODE (default: from config)'
    )
    process_parser.add_argument(
        '--no-safe-mode',
        action='store_false',
        dest='safe_mode',
        help='Disable SAFE_MODE'
    )
    
    args = parser.parse_args()
    
    if args.command == 'process':
        process_leads(
            args.input_file,
            args.output,
            safe_mode=args.safe_mode,
            config_file=args.config
        )
    else:
        parser.print_help()


if __name__ == '__main__':
    main()

