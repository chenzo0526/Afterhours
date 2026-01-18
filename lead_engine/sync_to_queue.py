#!/usr/bin/env python3
"""
Afterhours Ops Agent - Outbound Pipeline Setup

Reads plumbing_only_leads.csv and syncs to Google Sheets QUEUE tab.
Calls Apps Script functions: ensureQueueHeaders(), applyTemplatesToNewRows(), sendDailyBatch()
"""

import csv
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Optional
import gspread
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# Configuration - will be loaded from config or env vars
SPREADSHEET_NAME = "Afterhours QUEUE"
QUEUE_TAB_NAME = "QUEUE"
CSV_FILE = Path(__file__).parent / "plumbing_only_leads.csv"
TRADE_TYPE = "Plumbing"
EMAIL_TYPE = "INITIAL"


def get_sheets_client():
    """Get authenticated Google Sheets client using service account"""
    credentials_file = find_credentials_file()
    
    if not credentials_file:
        raise FileNotFoundError(
            "Google credentials.json not found. Please place it in lead_engine/ or set GOOGLE_CREDENTIALS_FILE env var."
        )
    
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/script.projects",
    ]
    
    creds = Credentials.from_service_account_file(credentials_file, scopes=scope)
    return gspread.authorize(creds), credentials_file


def get_apps_script_service(credentials_file_path: str):
    """Get Apps Script API service for executing functions"""
    scope = [
        "https://www.googleapis.com/auth/script.projects",
        "https://www.googleapis.com/auth/spreadsheets",
    ]
    
    creds = Credentials.from_service_account_file(credentials_file_path, scopes=scope)
    service = build('script', 'v1', credentials=creds)
    return service


def find_credentials_file():
    """Find Google credentials file"""
    credentials_paths = [
        Path(__file__).parent / "credentials.json",
        Path(__file__).parent.parent.parent / "credentials.json",
        Path(os.getenv("GOOGLE_CREDENTIALS_FILE", "")),
    ]
    
    for path in credentials_paths:
        if path and Path(path).exists():
            return str(Path(path).absolute())
    
    return None


def read_csv_leads(csv_path: Path) -> List[Dict]:
    """Read leads from CSV file"""
    leads = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            leads.append(row)
    return leads


def map_to_queue_format(leads: List[Dict]) -> List[List]:
    """
    Map CSV leads to QUEUE tab format:
    FirstName, Company, Email, Trade, City, State, Notes, Type, Status, Variant, Subject, Body, LastSent, Followup48hDate, Followup7dDate
    """
    queue_rows = []
    
    for i, lead in enumerate(leads):
        # Extract email (use PrimaryEmail if available, else BackupEmail)
        email = lead.get('PrimaryEmail', '').strip() or lead.get('BackupEmail', '').strip()
        
        # Alternate Variant A and B
        variant = 'A' if i % 2 == 0 else 'B'
        
        # Extract company name
        company = lead.get('Company', '').strip()
        
        # Create queue row
        row = [
            '',  # FirstName (blank)
            company,  # Company
            email,  # Email
            TRADE_TYPE,  # Trade
            lead.get('City', '').strip(),  # City
            lead.get('State', '').strip(),  # State
            lead.get('Notes', '').strip(),  # Notes
            EMAIL_TYPE,  # Type
            '',  # Status (blank)
            variant,  # Variant (alternating A/B)
            '',  # Subject (will be filled by applyTemplatesToNewRows)
            '',  # Body (will be filled by applyTemplatesToNewRows)
            '',  # LastSent (blank)
            '',  # Followup48hDate (blank)
            '',  # Followup7dDate (blank)
        ]
        queue_rows.append(row)
    
    return queue_rows


def ensure_queue_headers(sheet):
    """Ensure QUEUE tab has proper headers"""
    headers = [
        'FirstName', 'Company', 'Email', 'Trade', 'City', 'State', 'Notes',
        'Type', 'Status', 'Variant', 'Subject', 'Body', 'LastSent',
        'Followup48hDate', 'Followup7dDate'
    ]
    
    # Check if headers exist
    try:
        existing_headers = sheet.row_values(1)
        if existing_headers != headers:
            # Clear first row and set headers
            sheet.delete_rows(1)
            sheet.insert_row(headers, 1)
            print("✓ Headers updated in QUEUE tab")
        else:
            print("✓ Headers already present in QUEUE tab")
    except Exception as e:
        # If sheet is empty or error, insert headers
        sheet.insert_row(headers, 1)
        print("✓ Headers inserted in QUEUE tab")


def write_rows_to_queue(sheet, rows: List[List]):
    """Append rows to QUEUE tab"""
    if not rows:
        return 0
    
    # Append all rows at once (more efficient)
    sheet.append_rows(rows)
    return len(rows)


def call_apps_script_function(credentials_file: str, spreadsheet_id: str, function_name: str, parameters: Optional[List] = None):
    """
    Call an Apps Script function in the spreadsheet
    
    Note: This requires the Apps Script to be deployed as an API executable
    or use the Apps Script API with the script ID
    """
    try:
        # Use Apps Script Execution API
        # This requires the script to be deployed as an API executable with the script ID
        script_id = os.getenv("APPS_SCRIPT_ID", "")
        
        if not script_id:
            # Try to get script ID from spreadsheet (for bound scripts)
            # This is a fallback - bound scripts may not work directly via API
            print(f"  ℹ APPS_SCRIPT_ID not set - attempting to execute as bound script")
            
            # For bound scripts, we need to use a different approach
            # We can try to execute via the Script Execution API if the script is deployed
            # Otherwise, we'll need manual execution
            return None
        
        script_service = get_apps_script_service(credentials_file)
        request_body = {
            'function': function_name,
            'parameters': parameters or []
        }
        
        response = script_service.scripts().run(
            scriptId=script_id,
            body=request_body
        ).execute()
        
        if response.get('error'):
            error = response['error']
            error_details = error.get('details', [{}])[0] if error.get('details') else {}
            error_message = error.get('message', 'Unknown error')
            print(f"  ⚠ Apps Script error: {error_message}")
            if error_details.get('errorMessage'):
                print(f"     {error_details['errorMessage']}")
            return None
        
        return response
        
    except HttpError as e:
        error_content = json.loads(e.content.decode('utf-8'))
        print(f"  ⚠ HTTP error calling {function_name}(): {error_content.get('error', {}).get('message', str(e))}")
        return None
    except Exception as e:
        print(f"  ⚠ Could not call Apps Script function {function_name}(): {str(e)}")
        print(f"     You may need to run this function manually in Apps Script editor")
        return None


def main():
    """Main execution function"""
    try:
        print("=" * 60)
        print("Afterhours Ops Agent - Outbound Pipeline Setup")
        print("=" * 60)
        print()
        
        # Step 1: Read CSV file
        print("Step 1: Reading plumbing_only_leads.csv...")
        if not CSV_FILE.exists():
            raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")
        
        leads = read_csv_leads(CSV_FILE)
        print(f"✓ Read {len(leads)} leads from CSV")
        print()
        
        # Step 2: Map to QUEUE format
        print("Step 2: Mapping leads to QUEUE format...")
        queue_rows = map_to_queue_format(leads)
        print(f"✓ Mapped {len(queue_rows)} leads to QUEUE format")
        print(f"  - Type: {EMAIL_TYPE}")
        print(f"  - Variant: Alternating A/B")
        print()
        
        # Step 3: Connect to Google Sheets
        print("Step 3: Connecting to Google Sheets...")
        client, credentials_file = get_sheets_client()
        
        # Open spreadsheet
        try:
            spreadsheet = client.open(SPREADSHEET_NAME)
        except gspread.exceptions.SpreadsheetNotFound:
            raise FileNotFoundError(
                f"Spreadsheet '{SPREADSHEET_NAME}' not found. "
                f"Please ensure it exists and the service account has access."
            )
        
        # Get or create QUEUE tab
        try:
            queue_sheet = spreadsheet.worksheet(QUEUE_TAB_NAME)
        except gspread.exceptions.WorksheetNotFound:
            queue_sheet = spreadsheet.add_worksheet(title=QUEUE_TAB_NAME, rows=1000, cols=20)
            print(f"✓ Created QUEUE tab")
        else:
            print(f"✓ Found QUEUE tab")
        print()
        
        # Step 4: Ensure headers
        print("Step 4: Ensuring QUEUE headers...")
        ensure_queue_headers(queue_sheet)
        print()
        
        # Step 5: Write rows to QUEUE
        print("Step 5: Writing rows to QUEUE tab...")
        rows_written = write_rows_to_queue(queue_sheet, queue_rows)
        print(f"✓ Wrote {rows_written} rows to QUEUE tab")
        print()
        
        # Step 6: Call Apps Script functions
        spreadsheet_id = spreadsheet.id
        
        print("Step 6: Calling Apps Script functions...")
        
        # Note: ensureQueueHeaders was already called via Python
        print("  ✓ ensureQueueHeaders() - Headers ensured via Python")
        
        # Call applyTemplatesToNewRows
        print("  - applyTemplatesToNewRows()...")
        # This function should fill Subject and Body columns
        result = call_apps_script_function(credentials_file, spreadsheet_id, "applyTemplatesToNewRows")
        if result:
            print("    ✓ Templates applied to new rows")
        else:
            print("    ℹ Manual step required: Run applyTemplatesToNewRows() in Apps Script editor")
        
        # Call sendDailyBatch with SAFE_MODE=true
        print("  - sendDailyBatch(SAFE_MODE=true)...")
        result = call_apps_script_function(credentials_file, spreadsheet_id, "sendDailyBatch", parameters=[True])
        if result:
            print("    ✓ sendDailyBatch executed in SAFE_MODE")
        else:
            print("    ℹ Manual step required: Run sendDailyBatch(true) in Apps Script editor")
        print()
        
        # Success message
        print("=" * 60)
        print("✓ SUCCESS: All leads processed and queued")
        print(f"  Rows processed: {rows_written}")
        print("=" * 60)
        print()
        print("Next steps:")
        print("  1. Verify data in QUEUE tab")
        print("  2. Run applyTemplatesToNewRows() in Apps Script if not automated")
        print("  3. Run sendDailyBatch(SAFE_MODE=true) in Apps Script if not automated")
        
        return 0
        
    except Exception as e:
        print()
        print("=" * 60)
        print("✗ ERROR: Pipeline setup failed")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print()
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
