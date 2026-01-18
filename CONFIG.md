# Configuration Guide

This document lists all external API keys, credentials, and configuration needed for Afterhours.

## Required Configuration

### Voice Agent

#### Twilio (Optional - for voice calls)
- **Account SID**: Get from https://www.twilio.com/console
- **Auth Token**: Get from https://www.twilio.com/console
- **Phone Number**: Purchase from Twilio
- **Where to set**: `integration_samples/twilio_example.py`
- **Environment variables**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`

#### VAPI (Optional - alternative to Twilio)
- **API Key**: Get from https://vapi.ai
- **Where to set**: In VAPI dashboard and webhook configuration
- **Environment variables**: `VAPI_API_KEY`

#### OpenAI (Optional - for NLP enhancement)
- **API Key**: Get from https://platform.openai.com/api-keys
- **Where to set**: `voice_agent/async_support.py` (enhance_with_openai_async)
- **Environment variables**: `OPENAI_API_KEY`

### Lead Engine

#### Google Sheets (Optional)
- **Service Account Credentials**: JSON file from Google Cloud Console
- **Spreadsheet ID**: From Google Sheets URL
- **Where to set**: `lead_engine/config.json` or `integration_samples/google_sheets_example.py`
- **Setup steps**:
  1. Create project in Google Cloud Console
  2. Enable Google Sheets API
  3. Create service account
  4. Download credentials JSON
  5. Share spreadsheet with service account email

#### SAFE_MODE Configuration
- **Config file**: `lead_engine/config.json`
- **Environment variable**: `SAFE_MODE=true/false`
- **Test email**: Set in config file or `TEST_EMAIL` env var

### Website

#### Form Submission API
- **Endpoint**: `/api/submit` (Next.js API route)
- **Current**: Placeholder that logs submissions
- **To implement**: Replace with database storage or Google Sheets integration

#### Analytics (Optional)
- **Google Analytics**: Add tracking code to `website/app/layout.tsx`
- **Other**: Add to appropriate pages

### CRM Integration (Optional)

#### Salesforce
- **Username**: Your Salesforce username
- **Password**: Your Salesforce password
- **Security Token**: Get from Salesforce settings
- **Where to set**: `integration_samples/crm_stub.py`

#### HubSpot
- **API Key**: Get from HubSpot settings
- **Where to set**: `integration_samples/crm_stub.py`

## Environment Variables

Create a `.env` file in project root (or set in deployment environment):

```bash
# Voice Agent
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
OPENAI_API_KEY=your_openai_key

# Lead Engine
SAFE_MODE=true
TEST_EMAIL=test@afterhours.com

# Google Sheets
GOOGLE_CREDENTIALS_FILE=path/to/credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id

# CRM
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_token
HUBSPOT_API_KEY=your_api_key
```

## Configuration Files

### `lead_engine/config.json`
Copy `lead_engine/config.json.example` to `lead_engine/config.json` and update values.

### `integration_samples/`
- `twilio_example.py` - Replace placeholder credentials
- `google_sheets_example.py` - Set credentials file path and spreadsheet ID
- `crm_stub.py` - Add CRM credentials when implementing

## Security Notes

- **Never commit credentials to git** - Use `.env` files and add to `.gitignore`
- **Use environment variables in production** - Don't hardcode credentials
- **Rotate credentials regularly** - Especially API keys
- **Limit API key permissions** - Only grant necessary scopes
- **Use service accounts** - For Google Sheets, use service accounts not user credentials

## Testing Configuration

1. **SAFE_MODE**: Always test with `SAFE_MODE=true` first
2. **Test email**: Use a test email address you control
3. **Webhooks**: Use ngrok for local webhook testing
4. **Credentials**: Test with test/sandbox accounts before production

## Next Steps

1. Set up accounts for services you want to use
2. Get API keys and credentials
3. Update configuration files
4. Test integrations in SAFE_MODE
5. Gradually enable production features

