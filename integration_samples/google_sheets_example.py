"""
Google Sheets Integration Example

Shows how to integrate Afterhours lead engine with Google Sheets.

Setup:
1. Install: pip install gspread google-auth
2. Create service account in Google Cloud Console
3. Download credentials JSON file
4. Share spreadsheet with service account email
"""

import gspread
from google.oauth2.service_account import Credentials
from typing import List, Dict

# Placeholder - replace with actual path to credentials file
CREDENTIALS_FILE = "path/to/credentials.json"
SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"
WORKSHEET_NAME = "Leads"


def get_sheets_client():
    """Get authenticated Google Sheets client"""
    # Scope for read/write access
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive"
    ]
    
    creds = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=scope
    )
    
    return gspread.authorize(creds)


def append_leads_to_sheet(leads: List[Dict]):
    """
    Append leads to Google Sheet
    
    Args:
        leads: List of lead dictionaries
    """
    client = get_sheets_client()
    sheet = client.open_by_key(SPREADSHEET_ID).worksheet(WORKSHEET_NAME)
    
    # Prepare data
    if not leads:
        return
    
    # Get headers from first lead
    headers = list(leads[0].keys())
    
    # Check if headers exist, if not add them
    existing_headers = sheet.row_values(1)
    if not existing_headers or existing_headers != headers:
        sheet.insert_row(headers, 1)
    
    # Append rows
    rows = [[lead.get(header, "") for header in headers] for lead in leads]
    sheet.append_rows(rows)
    
    print(f"Appended {len(leads)} leads to sheet")


def read_leads_from_sheet() -> List[Dict]:
    """Read leads from Google Sheet"""
    client = get_sheets_client()
    sheet = client.open_by_key(SPREADSHEET_ID).worksheet(WORKSHEET_NAME)
    
    # Get all records as dictionaries
    records = sheet.get_all_records()
    
    return records


def update_queue_status(queue_id: str, status: str):
    """Update queue entry status in Google Sheet"""
    client = get_sheets_client()
    sheet = client.open_by_key(SPREADSHEET_ID).worksheet("EMAIL_QUEUE")
    
    # Find row with matching queue_id
    try:
        cell = sheet.find(queue_id)
        # Update status column (assuming column H)
        sheet.update_cell(cell.row, 8, status)
        print(f"Updated {queue_id} to status: {status}")
    except gspread.exceptions.CellNotFound:
        print(f"Queue ID {queue_id} not found")


if __name__ == "__main__":
    print("Google Sheets Integration Example")
    print("\nTo use:")
    print("1. Create service account in Google Cloud Console")
    print("2. Download credentials JSON file")
    print("3. Share spreadsheet with service account email")
    print("4. Replace CREDENTIALS_FILE and SPREADSHEET_ID above")
    print("5. Import and use functions in your code")
    print("\nExample:")
    print("  from integration_samples.google_sheets_example import append_leads_to_sheet")
    print("  append_leads_to_sheet([{'business_name': 'Test', 'email': 'test@example.com'}])")

