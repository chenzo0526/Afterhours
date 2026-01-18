"""
Lead Source Loaders

Supports multiple lead sources:
- CSV files
- Google Sheets (with placeholder credentials)
- JSON files
- Manual entry
"""

import csv
import json
from typing import List, Dict, Optional
from pathlib import Path
from lead_engine.lead_processor import LeadProcessor, Lead, LeadSource


class LeadSourceLoader:
    """Loads leads from various sources"""
    
    def __init__(self, processor: Optional[LeadProcessor] = None):
        self.processor = processor or LeadProcessor()
    
    def load_from_csv(self, file_path: str) -> List[Lead]:
        """Load leads from CSV file"""
        return self.processor.load_from_csv(file_path)
    
    def load_from_json(self, file_path: str) -> List[Lead]:
        """Load leads from JSON file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle both list of dicts and single dict
        if isinstance(data, dict):
            data = [data]
        
        return self.processor.load_from_dict_list(data, LeadSource.API.value)
    
    def load_from_google_sheets(
        self,
        spreadsheet_id: str,
        worksheet_name: str = "Leads",
        credentials_file: Optional[str] = None
    ) -> List[Lead]:
        """
        Load leads from Google Sheets
        
        Requires gspread library and credentials file.
        This is a placeholder implementation - replace with actual Google Sheets API calls.
        
        Args:
            spreadsheet_id: Google Sheets spreadsheet ID
            worksheet_name: Name of worksheet to read
            credentials_file: Path to Google service account credentials JSON
        
        Returns:
            List of Lead objects
        """
        # Placeholder implementation
        # In production, use:
        # import gspread
        # from google.oauth2.service_account import Credentials
        # 
        # creds = Credentials.from_service_account_file(credentials_file)
        # gc = gspread.authorize(creds)
        # sheet = gc.open_by_key(spreadsheet_id).worksheet(worksheet_name)
        # rows = sheet.get_all_records()
        # return self.processor.load_from_dict_list(rows, LeadSource.GOOGLE_SHEET.value)
        
        print(f"Warning: Google Sheets loading not implemented. "
              f"Would load from spreadsheet_id={spreadsheet_id}, worksheet={worksheet_name}")
        print("To implement:")
        print("1. Install: pip install gspread google-auth")
        print("2. Create service account in Google Cloud Console")
        print("3. Download credentials JSON file")
        print("4. Share spreadsheet with service account email")
        print("5. Replace this placeholder with actual gspread code")
        
        return []
    
    def load_from_file(self, file_path: str) -> List[Lead]:
        """
        Auto-detect file type and load leads
        
        Supports: .csv, .json
        """
        path = Path(file_path)
        suffix = path.suffix.lower()
        
        if suffix == '.csv':
            return self.load_from_csv(file_path)
        elif suffix == '.json':
            return self.load_from_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {suffix}. Supported: .csv, .json")

