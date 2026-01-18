# Afterhours Airtable Base Creator

Automatically creates the "Afterhours — Ops & Dispatch" Airtable base with all required tables and fields.

## Overview

This script creates a complete Airtable base structure for the Afterhours operations and dispatch system, including:

- **Businesses** table
- **On-Call Roster** table  
- **Calls** table
- **Dispatch Events** table
- **Issues / Bugs** table

All tables are created with the exact field definitions and types required for the Afterhours system.

## Prerequisites

- Node.js 18+ (for native `fetch` support)
- Airtable Personal Access Token (PAT)
- (Optional) Airtable Base ID (if base creation is not available in your account)

## Setup

### 1. Get Your Airtable Access Token

1. Go to https://airtable.com/create/tokens
2. Create a new Personal Access Token
3. Grant scopes: `data.records:read`, `data.records:write`, `schema.bases:read`, `schema.bases:write`
4. Copy the token (starts with `pat...`)

### 2. Find Your Workspace ID (Optional)

If you want to create the base in a specific workspace:

1. Go to your Airtable workspace
2. The workspace ID is in the URL: `https://airtable.com/workspace/wsXXXXXXXXXXXXXX`
3. Copy the `wsXXXXXXXXXXXXXX` part

### 3. Set Environment Variables

```bash
# Required
export AIRTABLE_ACCESS_TOKEN=patnC0TGvibI104Su.3636ff250e993bf5579ce1cd92a9f8cd681e5823885dc49c9af18a434a68520

# Optional - if base creation fails, use existing base
export AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Optional - specify workspace for base creation
export AIRTABLE_WORKSPACE_ID=wsXXXXXXXXXXXXXX
```

Or create a `.env` file in this directory:

```bash
AIRTABLE_ACCESS_TOKEN=your_token_here
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX  # Optional
AIRTABLE_WORKSPACE_ID=wsXXXXXXXXXXXXXX  # Optional
```

Note: This script uses native Node.js `fetch`, so no `.env` file loader is needed. Set environment variables directly or use a tool like `dotenv-cli` if you prefer.

## Usage

### Option 1: Create New Base (Recommended)

The script will attempt to create a new base named "Afterhours — Ops & Dispatch":

```bash
cd tools/airtable
AIRTABLE_ACCESS_TOKEN=your_token_here node create_afterhours_base.js
```

### Option 2: Use Existing Base

If base creation is not available in your Airtable account (requires Enterprise), use an existing base:

```bash
cd tools/airtable
AIRTABLE_ACCESS_TOKEN=your_token_here AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX node create_afterhours_base.js
```

### Option 3: Using .env File (if using dotenv-cli)

```bash
npm install -g dotenv-cli  # Install dotenv-cli globally
cd tools/airtable
dotenv node create_afterhours_base.js
```

## Output

The script will:

1. Create or find the base
2. Create all required tables
3. Create all fields with proper types and options
4. Print a summary with:
   - Base ID
   - Table IDs
   - Field IDs and types
5. Save `airtable_schema_output.json` with the complete schema mapping

### Example Output

```
======================================================================
Afterhours Airtable Base Creator
======================================================================

Step 1: Finding or creating base...
  ✓ Found existing base: "Afterhours — Ops & Dispatch" (appXXXXXXXXXXXXXX)

Step 2: Checking existing tables...
  Found 0 existing table(s)

Step 3: Creating tables and fields...
  Processing table: "Businesses"...
    ✓ Created table: "Businesses" (tblXXXXXXXXXXXXXX)
      ✓ Created field: "Business Name" (fldXXXXXXXXXXXXXX)
      ✓ Created field: "Trade" (fldYYYYYYYYYYYYYYYY)
      ...

======================================================================
✓ SUCCESS: Base setup complete!
======================================================================

Base Information:
  Base ID: appXXXXXXXXXXXXXX
  Base Name: "Afterhours — Ops & Dispatch"
  Base URL: https://airtable.com/appXXXXXXXXXXXXXX

Tables Created/Updated:
  • Businesses (tblXXXXXXXXXXXXXX)
    Fields: 9
      - Business Name (fldXXXXXXXXXXXXXX) [singleLineText]
      ...
```

## Schema Structure

### Businesses Table
- Business Name (singleLineText)
- Trade (singleSelect: Plumbing, HVAC, Electrical, Other)
- City (singleLineText)
- State (singleLineText)
- Timezone (singleSelect: America/Los_Angeles, America/Chicago, America/New_York, America/Denver)
- Afterhours Active (checkbox)
- Primary Phone (phoneNumber)
- Emergency Keywords (multilineText)
- Notes (multilineText)

### On-Call Roster Table
- Business (link to Businesses)
- Name (singleLineText)
- Role (singleSelect: Owner, Tech, Dispatcher)
- Phone (phoneNumber)
- Priority (number)
- Backup Contact (checkbox)
- Active (checkbox)
- Notes (multilineText)

### Calls Table
- Call ID (singleLineText)
- Business (link to Businesses)
- Call Timestamp (dateTime)
- Caller Phone (phoneNumber)
- City (singleLineText)
- Emergency Level (singleSelect: Emergency, Non-Emergency, Unknown)
- Issue Summary (multilineText)
- Agent Confidence (number)
- Transcript (multilineText)
- Dispatch Required (checkbox)
- Status (singleSelect: New, Dispatched, Failed, Resolved)

### Dispatch Events Table
- Call (link to Calls)
- Contact (link to On-Call Roster)
- Method (singleSelect: SMS, Call, Both)
- Sent At (dateTime)
- Delivery Status (singleSelect: Sent, Failed, Unknown)
- Acknowledged (checkbox)
- Notes (multilineText)

### Issues / Bugs Table
- Related Call (link to Calls)
- Severity (singleSelect: Low, Medium, High, Critical)
- Description (multilineText)
- Root Cause (multilineText)
- Fixed (checkbox)
- Fix Notes (multilineText)

## Error Handling

The script includes robust error handling:

- **Base Creation Fails**: Provides clear instructions to use an existing base
- **Table Already Exists**: Reuses existing table and creates missing fields
- **Field Already Exists**: Skips existing fields, only creates new ones
- **API Errors**: Shows detailed error messages with suggestions

## Idempotency

The script is idempotent - you can run it multiple times safely:

- If base exists with the same name, it reuses it
- If table exists, it reuses it and only creates missing fields
- If field exists, it skips it

## Troubleshooting

### "Base creation requires Enterprise API access"

**Solution**: Use an existing base:
1. Create a base manually in Airtable
2. Get the Base ID from the URL (`appXXXXXXXXXXXXXX`)
3. Run: `AIRTABLE_ACCESS_TOKEN=your_token AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX node create_afterhours_base.js`

### "AIRTABLE_ACCESS_TOKEN environment variable is required"

**Solution**: Set the environment variable:
```bash
export AIRTABLE_ACCESS_TOKEN=your_token_here
```

### "Cannot list bases (API limitation)"

**Note**: This is normal - base listing may not be available in all accounts. The script will attempt base creation or use the provided BASE_ID.

### Permission Errors

Ensure your Personal Access Token has the required scopes:
- `data.records:read`
- `data.records:write`
- `schema.bases:read`
- `schema.bases:write`

## Output File

The script creates `airtable_schema_output.json` with the complete schema structure:

```json
{
  "baseId": "appXXXXXXXXXXXXXX",
  "baseName": "Afterhours — Ops & Dispatch",
  "tables": [
    {
      "name": "Businesses",
      "id": "tblXXXXXXXXXXXXXX",
      "fields": [
        {
          "name": "Business Name",
          "id": "fldXXXXXXXXXXXXXX",
          "type": "singleLineText",
          "options": {}
        },
        ...
      ]
    },
    ...
  ]
}
```

This file can be used for automation, documentation, or integration with other systems.

## Notes

- Uses native Node.js `fetch` (no external HTTP library required)
- Requires Node.js 18+ for native fetch support
- All API calls use the Airtable Metadata API (v0/meta)
- Script is idempotent - safe to run multiple times
- Creates tables in the correct order to resolve linked table references
