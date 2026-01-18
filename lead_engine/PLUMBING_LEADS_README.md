# Plumbing Leads Generator

Generates high-intent plumbing business leads from target US cities for after-hours call handling services.

## Overview

This tool generates a CSV file of plumbing businesses from:
- Orange County, CA
- San Diego, CA
- Phoenix, AZ
- Dallas, TX
- Tampa, FL

The generator focuses on businesses that are likely closed after 5pm or on weekends, making them ideal candidates for after-hours call handling services.

## Prerequisites

- Node.js 18+ and npm
- Internet connection (for fetching business websites)

## Installation

```bash
cd /Users/vincenzoricco/Project_Vault/Afterhours/lead_engine
npm install
```

This installs:
- `axios` - HTTP client for fetching websites
- `cheerio` - HTML parsing (jQuery-like)
- `csv-writer` - CSV file writing
- `csv-parse` - CSV file reading

## Usage

### Step 1: Generate Initial Leads

Generate the initial CSV file with business information:

```bash
cd /Users/vincenzoricco/Project_Vault/Afterhours/lead_engine
node generate_plumbing_leads.js
```

This creates `plumbing_only_leads.csv` with:
- Company names
- Websites
- Cities and States
- Phone numbers (if found on websites)
- Notes (why after-hours is relevant)
- Source URLs

**Note:** Emails are left blank initially. This is intentional - we only include verified emails from websites.

### Step 2: Enrich with Email Addresses

Extract email addresses from business websites:

```bash
cd /Users/vincenzoricco/Project_Vault/Afterhours/lead_engine
node enrich_emails.js
```

Or specify a different input file:

```bash
node enrich_emails.js plumbing_only_leads.csv
```

The enrichment script:
- Fetches each business website
- Checks the homepage, `/contact`, `/contact-us`, `/about`, `/services` pages
- Extracts emails from:
  - `mailto:` links
  - Plain text in HTML
  - Meta tags
- Categorizes emails into PrimaryEmail (info@, specific names) and BackupEmail (contact@, etc.)
- Updates the CSV file in place

### Combined Workflow

Run both steps in sequence:

```bash
cd /Users/vincenzoricco/Project_Vault/Afterhours/lead_engine
node generate_plumbing_leads.js && node enrich_emails.js
```

Or use npm scripts:

```bash
npm run generate  # Generate leads
npm run enrich    # Enrich emails
npm run full      # Run both
```

## Output Format

The generated CSV (`plumbing_only_leads.csv`) contains:

| Column | Description |
|--------|-------------|
| `Company` | Business name |
| `Website` | Business website URL |
| `City` | City name |
| `State` | State abbreviation (CA, AZ, TX, FL) |
| `PrimaryEmail` | Primary contact email (info@, owner@, etc.) |
| `BackupEmail` | Secondary contact email (contact@, support@, etc.) |
| `Phone` | Business phone number |
| `Notes` | Why this business is a fit for after-hours call handling |
| `SourceURL` | URL where the business data was found/verified |

## Important Rules

✅ **DO:**
- Only include verified business information
- Leave emails blank if not found (never hallucinate)
- Include SourceURL for every row
- Add meaningful Notes explaining after-hours relevance

❌ **DON'T:**
- Make up email addresses
- Include businesses without verified websites
- Skip the SourceURL column
- Add generic notes that don't explain why after-hours matters

## Troubleshooting

### "Input file not found" error

Make sure you run `generate_plumbing_leads.js` first to create the initial CSV file.

### Website fetch errors

Some websites may:
- Block automated requests
- Have invalid URLs
- Take too long to respond

The scripts will continue processing other businesses and log warnings for failed fetches.

### No emails found

This is normal! Many plumbing businesses don't list emails on their websites. You can:
1. Manually research emails through directories (Yelp, Google Maps)
2. Use the Phone field to call and request email addresses
3. Leave blank and enrich later when you have more information

## Sample Output

See `plumbing_only_leads.csv` for the generated output. Example rows:

```csv
Company,Website,City,State,PrimaryEmail,BackupEmail,Phone,Notes,SourceURL
California Coast Plumbers,https://californiacoastplumbers.com,Orange County,CA,,,714-632-0170,Commercial plumbing specialist. Website mentions business hours but likely needs after-hours call handling for overflow.,https://californiacoastplumbers.com
Pacific Plumbing of Southern California,https://www.pacificplumbingsocal.com,Santa Ana,CA,,,714-699-9936,Established 1929, residential and commercial. Long history suggests standard business hours - perfect for after-hours enhancement.,https://www.pacificplumbingsocal.com
```

## Adding More Cities

To target additional cities, edit `generate_plumbing_leads.js`:

1. Add to `TARGET_CITIES` array:
```javascript
{ name: 'Austin', state: 'TX', searchTerms: ['Austin TX', 'Austin Texas'] }
```

2. Add businesses to `KNOWN_BUSINESSES` array with verified data

## Next Steps

After generating leads:

1. **Review the CSV** - Verify all information is accurate
2. **Manual research** - Use Phone numbers to call and get emails if needed
3. **Import into CRM** - Use with your lead processing pipeline
4. **Track outreach** - Use Notes field for personalized messaging

## Notes on Data Quality

- All businesses are verified real companies
- Websites are checked for validity
- Phone numbers extracted from websites when available
- Emails only included if found on business websites (no guessing)
- SourceURL provided for verification and compliance

---

**Questions?** Check the scripts' console output for detailed logging of the enrichment process.
