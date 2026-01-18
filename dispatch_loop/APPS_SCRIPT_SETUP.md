# Google Apps Script Setup Guide
## Afterhours QUEUE Automation System

This guide walks you through setting up the complete automation system for cold email, auto-replies, and Airtable sync.

---

## Prerequisites

- Google Sheet named "Afterhours QUEUE" with a tab named "QUEUE"
- QUEUE sheet headers include: `Type`, `Status`, `Email`, `Subject`, `Body`, `LastSent`, `Followup48hDate`, `Followup7dDate`, `Variant`, `City`, `State`, `Trade`, `Company`, `Notes`, `FirstName`
- Airtable Base ID: `appMJsHP71wkLODeW`
- Airtable Table: `Businesses`
- Airtable Personal Access Token (get from https://airtable.com/create/tokens)

---

## Step 1: Create Apps Script Project

1. Open your Google Sheet "Afterhours QUEUE"
2. Click **Extensions** → **Apps Script**
3. Delete any default code in the editor
4. Create 4 new script files:
   - Click the **+** button next to "Files" → **Script**
   - Name it `Util.gs` → Paste the code from `Util.gs`
   - Repeat for: `LeadEngine.gs`, `Autoresponder.gs`, `AirtableSync.gs`
5. Save all files (Ctrl+S or Cmd+S)

---

## Step 2: Set Script Properties (Airtable Token)

1. In Apps Script editor, click **Project Settings** (gear icon) in left sidebar
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Property: `AIRTABLE_ACCESS_TOKEN`
5. Value: Your Airtable Personal Access Token
6. Click **Save script properties**

**To get your Airtable token:**
- Go to https://airtable.com/create/tokens
- Create a new token with scope: `data.records:read` and `data.records:write`
- Copy the token and paste it as the property value

---

## Step 3: Update Configuration Constants

1. Open `Util.gs` in the Apps Script editor
2. Find the `CONFIG` object at the top
3. Update these values if needed:
   - `AFTERHOURS_DEMO_NUMBER`: Replace `+1XXXXXXXXXX` with your actual demo number
   - `SENDER_NAME`: Already set to "Vince" (change if needed)
   - `AIRTABLE_BASE_ID`: Already set to `appMJsHP71wkLODeW` (verify this is correct)
   - `AIRTABLE_TABLE`: Already set to `Businesses` (verify this is correct)

---

## Step 4: Create Gmail Label and Filter

### 4a. Create Gmail Label

1. Open Gmail
2. Click **Settings** (gear icon) → **See all settings**
3. Go to **Labels** tab
4. Scroll down to **Labels** section
5. Click **Create new label**
6. Name it: `AFTERHOURS_INBOUND`
7. Click **Create**

**OR** run this function once in Apps Script to auto-create it:
- In Apps Script editor, select function `ensureGmailLabel` from dropdown
- Click **Run** (play button)
- Authorize permissions if prompted

### 4b. Create Gmail Filter

1. In Gmail, click the search box
2. Click the **Show search options** icon (filter icon)
3. Set up filter criteria:
   - **From**: Leave blank OR add your outbound email addresses
   - **Subject contains**: `Quick setup question` (or your email subject)
   - **Has the words**: `reply` OR `re:`
4. Click **Create filter**
5. Check: **Apply the label** → Select `AFTERHOURS_INBOUND`
6. Check: **Also apply filter to matching conversations**
7. Click **Create filter**

**Alternative filter setup (more comprehensive):**
- Create filter for emails that are replies to any email address in your QUEUE sheet
- Use: `from:(email1@example.com OR email2@example.com OR ...)`
- Apply label: `AFTERHOURS_INBOUND`

---

## Step 5: Set Up Time-Based Triggers

### 5a. Autoresponder Trigger (Every 5 Minutes)

1. In Apps Script editor, click **Triggers** (clock icon) in left sidebar
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - **Choose which function to run**: `processAutoresponder`
   - **Select event source**: `Time-driven`
   - **Select type of time based trigger**: `Minutes timer`
   - **Select minute interval**: `Every 5 minutes`
4. Click **Save**
5. Authorize permissions if prompted

### 5b. Airtable Sync Trigger (Every 15 Minutes)

1. Click **+ Add Trigger** again
2. Configure:
   - **Choose which function to run**: `syncToAirtable`
   - **Select event source**: `Time-driven`
   - **Select type of time based trigger**: `Minutes timer`
   - **Select minute interval**: `Every 15 minutes`
3. Click **Save**

### 5c. Manual Email Sending (Menu Option)

The menu is automatically created when you open the sheet. No trigger needed.

---

## Step 6: Authorize Permissions

1. In Apps Script editor, click **Run** on any function (e.g., `testDogfoodEmail`)
2. You'll be prompted to **Review permissions**
3. Click **Review permissions**
4. Select your Google account
5. Click **Advanced** → **Go to [Project Name] (unsafe)**
6. Click **Allow** for all requested permissions:
   - Gmail (read/send emails)
   - Google Sheets (read/write)
   - Script Properties (read)

---

## Step 7: Test the System (Dogfood Test)

### 7a. Test Email Sending

1. Open your Google Sheet "Afterhours QUEUE"
2. Add a test row in the QUEUE tab:
   - `Type`: `INITIAL`
   - `Status`: (leave blank or `READY`)
   - `Email`: Your own email address
   - `Subject`: (leave blank to auto-generate)
   - `Body`: (leave blank to auto-generate)
   - `FirstName`: Your first name
   - `Company`: Test Company
   - `Variant`: `A` or `B` (optional)
3. In the sheet, click **Afterhours Automation** menu → **Send Initial Emails**
4. Check your email inbox for the test email

**OR** use the built-in test function:
- In Apps Script, run `testDogfoodEmail` function
- This sends a test email to your account

### 7b. Test Autoresponder

1. Reply to the test email you received
2. In your reply, include one of:
   - `A` (for phone system)
   - `B` (for cell carrier)
   - `C` (for answering service)
3. Make sure your Gmail filter applies the `AFTERHOURS_INBOUND` label
4. Wait up to 5 minutes (or manually run `processAutoresponder` in Apps Script)
5. Check:
   - Your email inbox for setup instructions
   - QUEUE sheet: `Status` should be `Replied`, `Notes` should contain the reply timestamp

### 7c. Test Airtable Sync

1. In QUEUE sheet, add a row with:
   - `Company`: Test Company Name
   - `Trade`: Plumbing (or any trade)
   - `City`: Test City
   - `State`: CA (or any state)
   - `Notes`: Test notes
   - `AirtableStatus`: (leave blank)
2. In Apps Script, run `syncToAirtable` function
3. Check:
   - QUEUE sheet: `AirtableStatus` should be `SYNCED`
   - Airtable: New record should appear in `Businesses` table

---

## Step 8: Verify Everything Works

### Checklist:

- [ ] Script Properties: `AIRTABLE_ACCESS_TOKEN` is set
- [ ] Gmail label `AFTERHOURS_INBOUND` exists
- [ ] Gmail filter is created and working (test by sending yourself a reply)
- [ ] Autoresponder trigger runs every 5 minutes
- [ ] Airtable sync trigger runs every 15 minutes
- [ ] Test email sending works
- [ ] Test autoresponder works (reply with A/B/C)
- [ ] Test Airtable sync works
- [ ] LOG sheet is created automatically (check for it)

---

## Troubleshooting

### Emails Not Sending

- Check QUEUE sheet: `Type` must be `INITIAL`, `Status` must be blank or `READY`
- Check LOG sheet for error messages
- Verify email addresses are valid
- Check Apps Script execution log: **View** → **Execution log**

### Autoresponder Not Working

- Verify Gmail label `AFTERHOURS_INBOUND` exists
- Check that Gmail filter is applying the label
- Verify the reply email matches an `Email` in QUEUE sheet
- Check LOG sheet for parsing errors
- Manually run `processAutoresponder` and check execution log

### Airtable Sync Failing

- Verify `AIRTABLE_ACCESS_TOKEN` in Script Properties
- Check Airtable Base ID and Table name are correct
- Verify Airtable token has read/write permissions
- Check LOG sheet for API errors
- Verify field names in Airtable match: `Business Name`, `Trade`, `City`, `State`, `Notes`, `Afterhours Active`

### Permission Errors

- Re-authorize: **Run** any function → **Review permissions** → **Allow**
- Check that you're using the same Google account for Sheet, Gmail, and Apps Script

---

## Manual Functions Reference

### Available Menu Items (in Google Sheet)

- **Afterhours Automation** → **Send Initial Emails**: Manually trigger email sending
- **Afterhours Automation** → **Test Email (Dogfood)**: Send test email to yourself

### Available Functions (in Apps Script)

- `sendInitialEmails()`: Send emails from QUEUE
- `processAutoresponder()`: Process Gmail replies
- `syncToAirtable()`: Sync QUEUE to Airtable
- `testDogfoodEmail()`: Send test email
- `ensureGmailLabel()`: Create Gmail label if missing
- `manualSyncToAirtable()`: Manual Airtable sync with alert

---

## Field Mapping Reference

### QUEUE Sheet → Airtable Businesses

| QUEUE Column | Airtable Field | Notes |
|-------------|----------------|-------|
| Company | Business Name | Required |
| Trade | Trade | Optional |
| City | City | Optional |
| State | State | Optional |
| Notes | Notes | Optional |
| (auto) | Afterhours Active | Always set to `false` |

### Email Status Flow

1. **Initial**: `Type=INITIAL`, `Status=` (blank or `READY`)
2. **After Send**: `Status=Sent`, `LastSent=` (timestamp), `Followup48hDate=` (2 days), `Followup7dDate=` (7 days)
3. **After Reply**: `Status=Replied`, `Notes=` (appended with reply info)

---

## Next Steps

1. Add real leads to QUEUE sheet
2. Monitor LOG sheet for errors
3. Review Airtable for synced records
4. Adjust email templates in `LeadEngine.gs` → `generateEmailContent()` if needed
5. Customize setup instructions in `Autoresponder.gs` → `sendSetupInstructions()` if needed

---

## Support

- Check LOG sheet for detailed error messages
- Review Apps Script execution log: **View** → **Execution log**
- Verify all triggers are active: **Triggers** → Check status column

---

**Setup Complete!** Your automation system is now ready to send cold emails, handle replies, and sync to Airtable.
