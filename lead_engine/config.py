"""
Configuration management for Lead Engine

Handles SAFE_MODE and other settings via config file or environment variables.
"""

import json
import os
from typing import Dict, Optional
from pathlib import Path


class LeadEngineConfig:
    """Configuration for Lead Engine"""
    
    def __init__(self, config_file: Optional[str] = None):
        """
        Initialize config from file or environment
        
        Args:
            config_file: Path to config JSON file (default: config.json in current dir)
        """
        self.config_file = config_file or "config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load config from file or use defaults"""
        default_config = {
            "safe_mode": True,
            "test_email": "test@afterhours.com",
            "google_sheets": {
                "enabled": False,
                "credentials_file": "credentials.json",
                "spreadsheet_id": "",
                "worksheet_name": "Leads"
            },
            "segmentation": {
                "enabled": True,
                "categories": ["industry", "size", "location_state"]
            },
            "ranking": {
                "enabled": True,
                "decision_maker_threshold": 0.6,
                "min_score": 0.3
            }
        }
        
        # Check environment variables first
        env_config = {
            "safe_mode": os.getenv("SAFE_MODE", "true").lower() == "true",
            "test_email": os.getenv("TEST_EMAIL", default_config["test_email"])
        }
        default_config.update(env_config)
        
        # Try to load from file
        config_path = Path(self.config_file)
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    file_config = json.load(f)
                    default_config.update(file_config)
            except Exception as e:
                print(f"Warning: Could not load config file: {e}")
        
        return default_config
    
    def get(self, key: str, default=None):
        """Get config value by key (supports dot notation)"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, default)
            else:
                return default
        
        return value if value is not None else default
    
    def set(self, key: str, value: any):
        """Set config value (supports dot notation)"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
    
    def save(self):
        """Save config to file"""
        config_path = Path(self.config_file)
        with open(config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    @property
    def safe_mode(self) -> bool:
        """Get SAFE_MODE setting"""
        return self.get("safe_mode", True)
    
    @safe_mode.setter
    def safe_mode(self, value: bool):
        """Set SAFE_MODE"""
        self.set("safe_mode", value)
    
    @property
    def test_email(self) -> str:
        """Get test email address"""
        return self.get("test_email", "test@afterhours.com")

