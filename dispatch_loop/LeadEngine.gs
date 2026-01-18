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
      body: `Hey ${name},\n\nQuick note — we help service businesses handle after-hours calls so owners don't miss jobs or get woken up for nonsense.\n\nWe answer the calls, filter urgency, and send a clean summary the next morning.\n\nIf you want, we can run it quietly for a week so you can see what you're missing.\n\nWorth a quick chat?\n\n– ${CONFIG.SENDER_NAME}`
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
