# Google Apps Script Code - Copy/Paste Ready

Copy each file's code into a separate script file in your Apps Script project.

---

## File 1: Util.gs

```javascript
/**
 * Util.gs - Shared utilities for Afterhours QUEUE automation
 * 
 * Provides:
 * - Header mapping for QUEUE sheet
 * - Safe get/set operations
 * - Logging utilities
 */

// Configuration constants
const CONFIG = {
  SHEET_NAME: 'QUEUE',
  AIRTABLE_BASE_ID: 'appMJsHP71wkLODeW',
  AIRTABLE_TABLE: 'Businesses',
  GMAIL_LABEL: 'AFTERHOURS_INBOUND',
  AFTERHOURS_DEMO_NUMBER: '+1XXXXXXXXXX',
  SENDER_NAME: 'Vince'
};

/**
 * Get header map for QUEUE sheet
 * Returns object mapping header names to column indices (1-based)
 */
function getHeaderMap() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerMap = {};
  
  headers.forEach((header, index) => {
    if (header && header.toString().trim()) {
      headerMap[header.toString().trim()] = index + 1;
    }
  });
  
  return headerMap;
}

/**
 * Safe get cell value by header name
 * @param {Range} rowRange - Range object for the row
 * @param {Object} headerMap - Header map from getHeaderMap()
 * @param {string} headerName - Name of the header column
 * @return {string} Cell value or empty string
 */
function safeGet(rowRange, headerMap, headerName) {
  const colIndex = headerMap[headerName];
  if (!colIndex) {
    return '';
  }
  const values = rowRange.getValues()[0];
  const value = values[colIndex - 1];
  return value ? value.toString().trim() : '';
}

/**
 * Safe set cell value by header name
 * @param {Sheet} sheet - Sheet object
 * @param {number} rowNum - Row number (1-based)
 * @param {Object} headerMap - Header map from getHeaderMap()
 * @param {string} headerName - Name of the header column
 * @param {*} value - Value to set
 */
function safeSet(sheet, rowNum, headerMap, headerName, value) {
  const colIndex = headerMap[headerName];
  if (!colIndex) {
    // Try to create column if it doesn't exist
    const lastCol = sheet.getLastColumn();
    sheet.getRange(1, lastCol + 1).setValue(headerName);
    const newColIndex = lastCol + 1;
    sheet.getRange(rowNum, newColIndex).setValue(value);
    return;
  }
  sheet.getRange(rowNum, colIndex).setValue(value);
}

/**
 * Ensure column exists, create if missing
 * @param {Sheet} sheet - Sheet object
 * @param {string} headerName - Name of the header column
 * @return {number} Column index (1-based)
 */
function ensureColumn(sheet, headerName) {
  const headerMap = getHeaderMap();
  if (headerMap[headerName]) {
    return headerMap[headerName];
  }
  
  // Create column
  const lastCol = sheet.getLastColumn();
  sheet.getRange(1, lastCol + 1).setValue(headerName);
  return lastCol + 1;
}

/**
 * Log message to script execution log
 * @param {string} message - Message to log
 * @param {string} level - Log level (INFO, WARN, ERROR)
 */
function log(message, level) {
  level = level || 'INFO';
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Optionally write to a LOG sheet if it exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('LOG');
    if (!logSheet) {
      logSheet = ss.insertSheet('LOG');
      logSheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Level', 'Message']]);
    }
    logSheet.appendRow([timestamp, level, message]);
  } catch (e) {
    // Ignore logging errors
  }
}

/**
 * Get Airtable access token from Script Properties
 * @return {string} Access token
 */
function getAirtableToken() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('AIRTABLE_ACCESS_TOKEN');
  if (!token) {
    throw new Error('AIRTABLE_ACCESS_TOKEN not found in Script Properties');
  }
  return token;
}

/**
 * Format date for Airtable (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @return {string} Formatted date string
 */
function formatDateForAirtable(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

---

## File 2: LeadEngine.gs

```javascript
/**
 * LeadEngine.gs - Sends cold emails from QUEUE sheet
 * 
 * Logic:
 * - Only send when Type="INITIAL" and Status is blank or "READY"
 * - Use Subject + Body from row if present; otherwise generate from Variant A/B
 * - After sending: set Status="Sent", LastSent=now, Followup48hDate=now+2d, Followup7dDate=now+7d
 */

/**
 * Main function to send initial emails from QUEUE
 * Can be triggered manually or via time-based trigger
 */
function sendInitialEmails() {
  log('Starting sendInitialEmails()', 'INFO');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QUEUE');
    if (!sheet) {
      throw new Error('QUEUE sheet not found');
    }
    
    const headerMap = getHeaderMap();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      log('No data rows found', 'INFO');
      return;
    }
    
    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process rows from 2 to lastRow
    for (let row = 2; row <= lastRow; row++) {
      try {
        const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
        const type = safeGet(rowRange, headerMap, 'Type');
        const status = safeGet(rowRange, headerMap, 'Status');
        const email = safeGet(rowRange, headerMap, 'Email');
        
        // Check if row qualifies for sending
        if (type !== 'INITIAL') {
          skippedCount++;
          continue;
        }
        
        if (status && status !== 'READY' && status !== '') {
          skippedCount++;
          continue;
        }
        
        if (!email || !email.includes('@')) {
          log(`Row ${row}: Invalid email address`, 'WARN');
          skippedCount++;
          continue;
        }
        
        // Get email content
        let subject = safeGet(rowRange, headerMap, 'Subject');
        let body = safeGet(rowRange, headerMap, 'Body');
        const variant = safeGet(rowRange, headerMap, 'Variant');
        const firstName = safeGet(rowRange, headerMap, 'FirstName');
        const company = safeGet(rowRange, headerMap, 'Company');
        
        // Generate subject/body if missing
        if (!subject || !body) {
          const generated = generateEmailContent(variant, firstName, company);
          if (!subject) subject = generated.subject;
          if (!body) body = generated.body;
        }
        
        // Send email
        GmailApp.sendEmail(
          email,
          subject,
          body,
          {
            name: CONFIG.SENDER_NAME
          }
        );
        
        // Update row after successful send
        const now = new Date();
        const followup48h = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const followup7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        safeSet(sheet, row, headerMap, 'Status', 'Sent');
        safeSet(sheet, row, headerMap, 'LastSent', now);
        safeSet(sheet, row, headerMap, 'Followup48hDate', followup48h);
        safeSet(sheet, row, headerMap, 'Followup7dDate', followup7d);
        
        sentCount++;
        log(`Row ${row}: Email sent to ${email}`, 'INFO');
        
        // Rate limiting: wait 1 second between sends
        Utilities.sleep(1000);
        
      } catch (error) {
        errorCount++;
        log(`Row ${row}: Error - ${error.toString()}`, 'ERROR');
      }
    }
    
    log(`sendInitialEmails() complete: ${sentCount} sent, ${skippedCount} skipped, ${errorCount} errors`, 'INFO');
    
  } catch (error) {
    log(`Fatal error in sendInitialEmails(): ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Generate email content based on variant
 * @param {string} variant - Variant A or B
 * @param {string} firstName - First name
 * @param {string} company - Company name
 * @return {Object} Object with subject and body
 */
function generateEmailContent(variant, firstName, company) {
  const name = firstName || 'there';
  const companyName = company || 'your business';
  
  // Variant A: Direct approach
  if (variant === 'A' || !variant) {
    return {
      subject: 'Missed calls after hours?',
      body: `Hey ${name},\n\nQuick note — we help service businesses capture after-hours calls so owners don't miss jobs or get woken up for nonsense.\n\nWe answer the calls, filter urgency, and send a clean summary the next morning.\n\nIf you want, we can run it quietly for a week so you can see what you're missing.\n\nWorth a quick chat?\n\n– ${CONFIG.SENDER_NAME}`
    };
  }
  
  // Variant B: Question-based approach
  if (variant === 'B') {
    return {
      subject: 'Quick setup question',
      body: `Hi ${name},\n\nDo you handle after-hours calls at ${companyName}? If so, we have a simple way to filter them so you only get woken up for real emergencies.\n\nHappy to show you how it works — takes about 5 minutes to set up.\n\nLet me know if you're interested.\n\n– ${CONFIG.SENDER_NAME}`
    };
  }
  
  // Default fallback
  return {
    subject: 'Quick setup question',
    body: `Hi ${name},\n\nQuick question about after-hours call handling at ${companyName}.\n\nWould you be interested in a quick chat?\n\n– ${CONFIG.SENDER_NAME}`
  };
}

/**
 * Menu function for manual trigger
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Afterhours Automation')
    .addItem('Send Initial Emails', 'sendInitialEmails')
    .addItem('Test Email (Dogfood)', 'testDogfoodEmail')
    .addToUi();
}

/**
 * Test function to send email to own address
 */
function testDogfoodEmail() {
  const testEmail = Session.getActiveUser().getEmail();
  log(`Sending test email to ${testEmail}`, 'INFO');
  
  try {
    GmailApp.sendEmail(
      testEmail,
      'Test: Quick setup question',
      `Hi,\n\nThis is a test email from the Afterhours automation system.\n\nIf you received this, the email sending is working correctly.\n\n– ${CONFIG.SENDER_NAME}`,
      {
        name: CONFIG.SENDER_NAME
      }
    );
    
    SpreadsheetApp.getUi().alert(`Test email sent to ${testEmail}`);
    log('Test email sent successfully', 'INFO');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Error: ${error.toString()}`);
    log(`Test email error: ${error.toString()}`, 'ERROR');
  }
}
```

---

## File 3: Autoresponder.gs

```javascript
/**
 * Autoresponder.gs - Reads Gmail replies and sends setup instructions
 * 
 * Logic:
 * - Uses Gmail label "AFTERHOURS_INBOUND"
 * - Runs every 5 minutes (time-based trigger)
 * - Finds unread threads with label
 * - Extracts sender email + body
 * - Matches by Email in QUEUE
 * - Parses choice (A/B/C)
 * - Writes to Notes, sets Status="Replied"
 * - Sends setup instructions based on choice
 * - Marks thread read
 */

/**
 * Main function to process auto-replies
 * Should be triggered every 5 minutes
 */
function processAutoresponder() {
  log('Starting processAutoresponder()', 'INFO');
  
  try {
    // Ensure label exists
    ensureGmailLabel();
    
    // Get unread threads with label
    const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
    if (!label) {
      log('Gmail label not found', 'ERROR');
      return;
    }
    
    const threads = label.getThreads(0, 50); // Get up to 50 threads
    log(`Found ${threads.length} threads with label`, 'INFO');
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < threads.length; i++) {
      try {
        const thread = threads[i];
        
        // Only process unread threads
        if (thread.isUnread()) {
          const processed = processThread(thread);
          if (processed) {
            processedCount++;
            // Mark thread as read
            thread.markRead();
          }
        }
      } catch (error) {
        errorCount++;
        log(`Error processing thread: ${error.toString()}`, 'ERROR');
      }
    }
    
    log(`processAutoresponder() complete: ${processedCount} processed, ${errorCount} errors`, 'INFO');
    
  } catch (error) {
    log(`Fatal error in processAutoresponder(): ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Process a single Gmail thread
 * @param {GmailThread} thread - Gmail thread object
 * @return {boolean} True if processed successfully
 */
function processThread(thread) {
  try {
    const messages = thread.getMessages();
    if (messages.length === 0) return false;
    
    // Get the latest message (should be the reply)
    const latestMessage = messages[messages.length - 1];
    const senderEmail = latestMessage.getFrom();
    const senderAddress = extractEmailAddress(senderEmail);
    
    if (!senderAddress) {
      log('Could not extract sender email', 'WARN');
      return false;
    }
    
    // Get plain text body
    const body = latestMessage.getPlainBody();
    
    log(`Processing reply from ${senderAddress}`, 'INFO');
    
    // Find matching row in QUEUE
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QUEUE');
    if (!sheet) {
      throw new Error('QUEUE sheet not found');
    }
    
    const headerMap = getHeaderMap();
    const lastRow = sheet.getLastRow();
    
    let matchingRow = null;
    for (let row = 2; row <= lastRow; row++) {
      const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
      const email = safeGet(rowRange, headerMap, 'Email');
      
      if (email && email.toLowerCase() === senderAddress.toLowerCase()) {
        matchingRow = row;
        break;
      }
    }
    
    if (!matchingRow) {
      log(`No matching row found for ${senderAddress}`, 'WARN');
      return false;
    }
    
    // Parse choice from body
    const choice = parseChoice(body);
    if (!choice) {
      log(`Could not parse choice from body for ${senderAddress}`, 'WARN');
      return false;
    }
    
    // Update QUEUE row
    const rowRange = sheet.getRange(matchingRow, 1, 1, sheet.getLastColumn());
    const currentNotes = safeGet(rowRange, headerMap, 'Notes');
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] Reply received. Choice: ${choice}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    
    safeSet(sheet, matchingRow, headerMap, 'Notes', updatedNotes);
    safeSet(sheet, matchingRow, headerMap, 'Status', 'Replied');
    
    // Send setup instructions
    sendSetupInstructions(senderAddress, choice);
    
    log(`Processed reply from ${senderAddress}, choice: ${choice}`, 'INFO');
    return true;
    
  } catch (error) {
    log(`Error processing thread: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Parse choice (A, B, or C) from email body
 * @param {string} body - Email body text
 * @return {string|null} Choice letter or null
 */
function parseChoice(body) {
  if (!body) return null;
  
  const upperBody = body.toUpperCase();
  
  // Look for explicit choices
  if (upperBody.includes('A)') || upperBody.includes('A.') || 
      (upperBody.includes('PHONE SYSTEM') && !upperBody.includes('B') && !upperBody.includes('C'))) {
    return 'A';
  }
  
  if (upperBody.includes('B)') || upperBody.includes('B.') || 
      upperBody.includes('CELL CARRIER') || upperBody.includes('FORWARDED TO CELL')) {
    return 'B';
  }
  
  if (upperBody.includes('C)') || upperBody.includes('C.') || 
      upperBody.includes('ANSWERING SERVICE')) {
    return 'C';
  }
  
  // Look for keywords
  if (upperBody.includes('RINGCENTRAL') || upperBody.includes('NEXTIVA') || 
      upperBody.includes('OPENPHONE') || upperBody.includes('VOIP')) {
    return 'A';
  }
  
  if (upperBody.includes('VERIZON') || upperBody.includes('AT&T') || 
      upperBody.includes('T-MOBILE') || upperBody.includes('CARRIER')) {
    return 'B';
  }
  
  return null;
}

/**
 * Send setup instructions based on choice
 * @param {string} recipientEmail - Recipient email address
 * @param {string} choice - Choice letter (A, B, or C)
 */
function sendSetupInstructions(recipientEmail, choice) {
  let subject = 'Afterhours Setup Instructions';
  let body = '';
  
  if (choice === 'A') {
    // Phone system instructions
    body = `Hi,\n\nThanks for your reply! Here are the setup steps for phone systems (RingCentral/Nextiva/OpenPhone):\n\n1. Log into your phone system admin panel\n2. Navigate to Call Routing or Forwarding settings\n3. Create a new after-hours routing rule:\n   - Time: Set to your after-hours hours (e.g., 6 PM - 8 AM, weekends)\n   - Action: Forward to ${CONFIG.AFTERHOURS_DEMO_NUMBER}\n4. Save the rule\n\nOnce set up, all after-hours calls will be forwarded to our system, and you'll receive summaries each morning.\n\nIf you need help with your specific system, let me know!\n\n– ${CONFIG.SENDER_NAME}`;
  } else if (choice === 'B') {
    // Cell carrier forwarding instructions
    body = `Hi,\n\nThanks for your reply! Here are the setup steps for cell carrier call forwarding:\n\n**Verizon:**\n- Dial *72 followed by ${CONFIG.AFTERHOURS_DEMO_NUMBER}\n- Or use My Verizon app: Settings > Call Forwarding\n\n**AT&T:**\n- Dial *21* followed by ${CONFIG.AFTERHOURS_DEMO_NUMBER} then #\n- Or use AT&T Smart Limits\n\n**T-Mobile:**\n- Dial **21* followed by ${CONFIG.AFTERHOURS_DEMO_NUMBER} then #\n- Or use T-Mobile app: Settings > Call Forwarding\n\n**Note:** Please confirm the exact codes with your carrier, as they may vary by plan.\n\nOnce set up, after-hours calls will forward to our system, and you'll receive summaries each morning.\n\nLet me know if you need help!\n\n– ${CONFIG.SENDER_NAME}`;
  } else if (choice === 'C') {
    // Answering service instructions
    body = `Hi,\n\nThanks for your reply! Here are the setup steps for answering service forwarding:\n\n1. Contact your answering service provider\n2. Request that they forward all after-hours calls to: ${CONFIG.AFTERHOURS_DEMO_NUMBER}\n3. Specify your after-hours hours (e.g., 6 PM - 8 AM, weekends)\n4. Confirm they understand the forwarding setup\n\nOnce configured, your answering service will forward calls to our system, and you'll receive summaries each morning.\n\nIf you need help coordinating with your answering service, let me know!\n\n– ${CONFIG.SENDER_NAME}`;
  } else {
    // Fallback
    body = `Hi,\n\nThanks for your reply! I received your message but couldn't determine which setup option you need.\n\nPlease reply with:\n- A for phone system (RingCentral/Nextiva/OpenPhone)\n- B for cell carrier / forwarded to cell\n- C for answering service\n\nI'll send you the specific setup instructions once I know which option you're using.\n\n– ${CONFIG.SENDER_NAME}`;
  }
  
  try {
    GmailApp.sendEmail(
      recipientEmail,
      subject,
      body,
      {
        name: CONFIG.SENDER_NAME
      }
    );
    log(`Setup instructions sent to ${recipientEmail} for choice ${choice}`, 'INFO');
  } catch (error) {
    log(`Error sending setup instructions: ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Extract email address from Gmail "From" field
 * @param {string} fromField - Gmail "From" field (e.g., "Name <email@example.com>")
 * @return {string|null} Email address or null
 */
function extractEmailAddress(fromField) {
  if (!fromField) return null;
  
  // Try to extract email from angle brackets
  const match = fromField.match(/<([^>]+)>/);
  if (match) {
    return match[1].trim();
  }
  
  // If no brackets, check if it's just an email
  if (fromField.includes('@')) {
    return fromField.trim();
  }
  
  return null;
}

/**
 * Ensure Gmail label exists, create if missing
 */
function ensureGmailLabel() {
  try {
    let label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
    if (!label) {
      GmailApp.createLabel(CONFIG.GMAIL_LABEL);
      log(`Created Gmail label: ${CONFIG.GMAIL_LABEL}`, 'INFO');
    }
  } catch (error) {
    log(`Error ensuring Gmail label: ${error.toString()}`, 'ERROR');
    throw error;
  }
}
```

---

## File 4: AirtableSync.gs

```javascript
/**
 * AirtableSync.gs - Syncs QUEUE sheet to Airtable Businesses table
 * 
 * Logic:
 * - Syncs from QUEUE to Airtable Businesses
 * - Maps: Company->Business Name, Trade->Trade, City->City, State->State, Notes->Notes, Afterhours Active=false
 * - Uses AirtableStatus column to track sync status
 * - Sets AirtableStatus="SYNCED" on success
 * - Should run every 15 minutes (time-based trigger)
 */

/**
 * Main function to sync QUEUE to Airtable
 * Should be triggered every 15 minutes
 */
function syncToAirtable() {
  log('Starting syncToAirtable()', 'INFO');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QUEUE');
    if (!sheet) {
      throw new Error('QUEUE sheet not found');
    }
    
    // Ensure AirtableStatus column exists
    ensureColumn(sheet, 'AirtableStatus');
    
    const headerMap = getHeaderMap();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      log('No data rows to sync', 'INFO');
      return;
    }
    
    const token = getAirtableToken();
    const baseId = CONFIG.AIRTABLE_BASE_ID;
    const tableName = CONFIG.AIRTABLE_TABLE;
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process rows from 2 to lastRow
    for (let row = 2; row <= lastRow; row++) {
      try {
        const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
        const airtableStatus = safeGet(rowRange, headerMap, 'AirtableStatus');
        
        // Skip if already synced
        if (airtableStatus === 'SYNCED') {
          skippedCount++;
          continue;
        }
        
        // Get row data
        const company = safeGet(rowRange, headerMap, 'Company');
        const trade = safeGet(rowRange, headerMap, 'Trade');
        const city = safeGet(rowRange, headerMap, 'City');
        const state = safeGet(rowRange, headerMap, 'State');
        const notes = safeGet(rowRange, headerMap, 'Notes');
        
        // Skip if no company name
        if (!company || company.trim() === '') {
          skippedCount++;
          continue;
        }
        
        // Prepare Airtable record
        const record = {
          fields: {
            'Business Name': company,
            'Trade': trade || '',
            'City': city || '',
            'State': state || '',
            'Notes': notes || '',
            'Afterhours Active': false
          }
        };
        
        // Check if record already exists in Airtable
        const existingRecordId = findExistingRecord(token, baseId, tableName, company);
        
        let success = false;
        if (existingRecordId) {
          // Update existing record
          success = updateAirtableRecord(token, baseId, tableName, existingRecordId, record);
          log(`Row ${row}: Updated Airtable record for ${company}`, 'INFO');
        } else {
          // Create new record
          success = createAirtableRecord(token, baseId, tableName, record);
          log(`Row ${row}: Created Airtable record for ${company}`, 'INFO');
        }
        
        if (success) {
          safeSet(sheet, row, headerMap, 'AirtableStatus', 'SYNCED');
          syncedCount++;
        } else {
          errorCount++;
        }
        
        // Rate limiting: wait 200ms between API calls
        Utilities.sleep(200);
        
      } catch (error) {
        errorCount++;
        log(`Row ${row}: Error - ${error.toString()}`, 'ERROR');
      }
    }
    
    log(`syncToAirtable() complete: ${syncedCount} synced, ${skippedCount} skipped, ${errorCount} errors`, 'INFO');
    
  } catch (error) {
    log(`Fatal error in syncToAirtable(): ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Find existing Airtable record by Business Name
 * @param {string} token - Airtable access token
 * @param {string} baseId - Airtable base ID
 * @param {string} tableName - Airtable table name
 * @param {string} businessName - Business name to search for
 * @return {string|null} Record ID or null
 */
function findExistingRecord(token, baseId, tableName, businessName) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    const params = {
      filterByFormula: `{Business Name} = "${businessName.replace(/"/g, '\\"')}"`,
      maxRecords: 1
    };
    
    const queryString = Object.keys(params).map(key => 
      `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    ).join('&');
    
    const response = UrlFetchApp.fetch(`${url}?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.getResponseCode() !== 200) {
      log(`Airtable API error: ${response.getResponseCode()}`, 'ERROR');
      return null;
    }
    
    const data = JSON.parse(response.getContentText());
    if (data.records && data.records.length > 0) {
      return data.records[0].id;
    }
    
    return null;
  } catch (error) {
    log(`Error finding existing record: ${error.toString()}`, 'ERROR');
    return null;
  }
}

/**
 * Create new Airtable record
 * @param {string} token - Airtable access token
 * @param {string} baseId - Airtable base ID
 * @param {string} tableName - Airtable table name
 * @param {Object} record - Record object with fields
 * @return {boolean} True if successful
 */
function createAirtableRecord(token, baseId, tableName, record) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ records: [record] })
    });
    
    if (response.getResponseCode() === 200) {
      return true;
    } else {
      log(`Airtable create error: ${response.getResponseCode()} - ${response.getContentText()}`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`Error creating Airtable record: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Update existing Airtable record
 * @param {string} token - Airtable access token
 * @param {string} baseId - Airtable base ID
 * @param {string} tableName - Airtable table name
 * @param {string} recordId - Record ID to update
 * @param {Object} record - Record object with fields
 * @return {boolean} True if successful
 */
function updateAirtableRecord(token, baseId, tableName, recordId, record) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ fields: record.fields })
    });
    
    if (response.getResponseCode() === 200) {
      return true;
    } else {
      log(`Airtable update error: ${response.getResponseCode()} - ${response.getContentText()}`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`Error updating Airtable record: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Manual sync function (for testing)
 */
function manualSyncToAirtable() {
  syncToAirtable();
  SpreadsheetApp.getUi().alert('Airtable sync completed. Check LOG sheet for details.');
}
```

---

## Quick Setup Checklist

1. ✅ Copy all 4 files into Apps Script project
2. ✅ Set Script Property: `AIRTABLE_ACCESS_TOKEN`
3. ✅ Update `AFTERHOURS_DEMO_NUMBER` in `Util.gs` if needed
4. ✅ Create Gmail label: `AFTERHOURS_INBOUND`
5. ✅ Create Gmail filter for replies
6. ✅ Set trigger: `processAutoresponder` every 5 minutes
7. ✅ Set trigger: `syncToAirtable` every 15 minutes
8. ✅ Authorize permissions
9. ✅ Test with dogfood email

See `APPS_SCRIPT_SETUP.md` for detailed instructions.
