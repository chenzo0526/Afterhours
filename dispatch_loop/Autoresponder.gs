/**
 * Autoresponder.gs - Reads Gmail replies and sends setup instructions
 * 
 * Logic:
 * - NO Gmail labels required - scans inbox directly
 * - Runs every 5 minutes (time-based trigger)
 * - Finds unread reply threads in inbox
 * - Matches by ThreadId (if stored), then sender email + time window, then subject + sender
 * - Extracts sender email + body
 * - Parses choice (A/B/C)
 * - Updates QUEUE: Status="Replied", ReplySnippet, ThreadId, LastSent
 * - Sends setup instructions based on choice
 * - Marks thread read to prevent reprocessing
 */

/**
 * Main function to process auto-replies
 * Should be triggered every 5 minutes
 */
function processAutoresponder() {
  log('Starting processAutoresponder()', 'INFO');
  
  try {
    // Get recent unread threads from inbox (last 7 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    const query = `is:inbox is:unread after:${Math.floor(cutoffDate.getTime() / 1000)}`;
    const threads = GmailApp.search(query, 0, 50); // Get up to 50 threads
    
    log(`Found ${threads.length} unread inbox threads (last 7 days)`, 'INFO');
    
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
            // Mark thread as read to prevent reprocessing
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
    
    // Skip if we sent this message (not a reply to us)
    if (latestMessage.isInInbox() && !latestMessage.isUnread()) {
      // Double check: if sender is us, skip
      const myEmail = Session.getActiveUser().getEmail();
      if (senderAddress.toLowerCase() === myEmail.toLowerCase()) {
        return false;
      }
    }
    
    // Get plain text body
    const body = latestMessage.getPlainBody();
    const subject = latestMessage.getSubject();
    const threadId = thread.getId();
    const messageDate = latestMessage.getDate();
    
    log(`Processing reply from ${senderAddress}, thread: ${threadId}`, 'INFO');
    
    // Find matching row in QUEUE using multiple strategies
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QUEUE');
    if (!sheet) {
      throw new Error('QUEUE sheet not found');
    }
    
    const headerMap = getHeaderMap();
    const lastRow = sheet.getLastRow();
    
    let matchingRow = null;
    let matchMethod = '';
    
    // Strategy 1: Match by ThreadId (preferred if present)
    for (let row = 2; row <= lastRow; row++) {
      const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
      const storedThreadId = safeGet(rowRange, headerMap, 'ThreadId');
      
      if (storedThreadId && storedThreadId === threadId) {
        matchingRow = row;
        matchMethod = 'ThreadId';
        break;
      }
    }
    
    // Strategy 2: Match by sender Email and recent time window (last 7 days)
    if (!matchingRow) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      for (let row = 2; row <= lastRow; row++) {
        const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
        const email = safeGet(rowRange, headerMap, 'Email');
        const lastSent = safeGet(rowRange, headerMap, 'LastSent');
        
        if (email && email.toLowerCase() === senderAddress.toLowerCase()) {
          // Check if LastSent is within 7 days
          let isRecent = false;
          if (lastSent) {
            try {
              const lastSentDate = new Date(lastSent);
              if (lastSentDate >= sevenDaysAgo) {
                isRecent = true;
              }
            } catch (e) {
              // If date parsing fails, assume recent
              isRecent = true;
            }
          } else {
            // No LastSent, assume recent if email matches
            isRecent = true;
          }
          
          if (isRecent) {
            matchingRow = row;
            matchMethod = 'Email + TimeWindow';
            break;
          }
        }
      }
    }
    
    // Strategy 3: Match by subject containing "Afterhours" or "quick setup" AND sender matches QUEUE Email
    if (!matchingRow) {
      const subjectUpper = subject.toUpperCase();
      const hasAfterhoursKeyword = subjectUpper.includes('AFTERHOURS') || 
                                    subjectUpper.includes('QUICK SETUP') ||
                                    subjectUpper.includes('SETUP');
      
      if (hasAfterhoursKeyword) {
        for (let row = 2; row <= lastRow; row++) {
          const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
          const email = safeGet(rowRange, headerMap, 'Email');
          
          if (email && email.toLowerCase() === senderAddress.toLowerCase()) {
            matchingRow = row;
            matchMethod = 'Subject + Email';
            break;
          }
        }
      }
    }
    
    if (!matchingRow) {
      log(`No matching row found for ${senderAddress}`, 'WARN');
      return false;
    }
    
    // Check if already processed (safeguard against double replying)
    const rowRange = sheet.getRange(matchingRow, 1, 1, sheet.getLastColumn());
    const currentStatus = safeGet(rowRange, headerMap, 'Status');
    const existingThreadId = safeGet(rowRange, headerMap, 'ThreadId');
    
    if (currentStatus === 'Replied' && existingThreadId === threadId) {
      log(`Thread ${threadId} already processed for ${senderAddress}, skipping`, 'INFO');
      return false;
    }
    
    // Parse choice from body
    const choice = parseChoice(body);
    if (!choice) {
      log(`Could not parse choice from body for ${senderAddress}`, 'WARN');
      return false;
    }
    
    log(`Matched ${senderAddress} using ${matchMethod}, choice: ${choice}`, 'INFO');
    
    // Extract reply snippet (first 200 chars)
    const replySnippet = body.substring(0, 200).replace(/\n/g, ' ').trim();
    
    // Update QUEUE row
    const currentNotes = safeGet(rowRange, headerMap, 'Notes');
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] Reply received via ${matchMethod}. Choice: ${choice}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    
    safeSet(sheet, matchingRow, headerMap, 'Status', 'Replied');
    safeSet(sheet, matchingRow, headerMap, 'ReplySnippet', replySnippet);
    safeSet(sheet, matchingRow, headerMap, 'ThreadId', threadId);
    safeSet(sheet, matchingRow, headerMap, 'LastSent', messageDate.toISOString());
    safeSet(sheet, matchingRow, headerMap, 'Notes', updatedNotes);
    
    // Send setup instructions
    sendSetupInstructions(senderAddress, choice);
    
    log(`Processed reply from ${senderAddress}, choice: ${choice}, thread: ${threadId}`, 'INFO');
    return true;
    
  } catch (error) {
    log(`Error processing thread: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * FORCE_processLastReplyNow() - Process the most recent reply email in inbox (last 24h)
 * Even if not unread. Matches by sender email.
 * Useful for testing and manual processing.
 */
function FORCE_processLastReplyNow() {
  log('FORCE_processLastReplyNow() - Processing most recent reply (last 24h)', 'INFO');
  
  try {
    // Get threads from last 24 hours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    
    const query = `is:inbox after:${Math.floor(cutoffDate.getTime() / 1000)}`;
    const threads = GmailApp.search(query, 0, 100); // Get up to 100 threads
    
    log(`Found ${threads.length} inbox threads (last 24h)`, 'INFO');
    
    if (threads.length === 0) {
      log('No threads found in last 24 hours', 'WARN');
      return;
    }
    
    // Sort by date (most recent first)
    const threadsWithDates = threads.map(thread => {
      const messages = thread.getMessages();
      const latestMessage = messages[messages.length - 1];
      return {
        thread: thread,
        date: latestMessage.getDate(),
        message: latestMessage
      };
    });
    
    threadsWithDates.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Process the most recent thread
    const mostRecent = threadsWithDates[0];
    const senderEmail = mostRecent.message.getFrom();
    const senderAddress = extractEmailAddress(senderEmail);
    
    log(`Most recent thread from: ${senderAddress}, date: ${mostRecent.date}`, 'INFO');
    
    // Get QUEUE sheet to check if sender matches
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
      log(`No matching QUEUE row found for ${senderAddress}`, 'WARN');
      log('Available emails in QUEUE:', 'INFO');
      for (let row = 2; row <= lastRow; row++) {
        const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
        const email = safeGet(rowRange, headerMap, 'Email');
        if (email) {
          log(`  Row ${row}: ${email}`, 'INFO');
        }
      }
      return;
    }
    
    log(`Matched QUEUE row ${matchingRow} for ${senderAddress}`, 'INFO');
    
    // Process the thread (force process even if read)
    const processed = processThread(mostRecent.thread);
    
    if (processed) {
      log(`FORCE processed reply from ${senderAddress} successfully`, 'INFO');
      // Mark as read
      mostRecent.thread.markRead();
    } else {
      log(`FORCE processing failed for ${senderAddress}`, 'WARN');
    }
    
  } catch (error) {
    log(`Fatal error in FORCE_processLastReplyNow(): ${error.toString()}`, 'ERROR');
    throw error;
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
  
  // Look for explicit single letter choices (most common)
  if (upperBody.match(/\bA\b/) && !upperBody.match(/\bB\b/) && !upperBody.match(/\bC\b/)) {
    return 'A';
  }
  
  if (upperBody.match(/\bB\b/) && !upperBody.match(/\bA\b/) && !upperBody.match(/\bC\b/)) {
    return 'B';
  }
  
  if (upperBody.match(/\bC\b/) && !upperBody.match(/\bA\b/) && !upperBody.match(/\bB\b/)) {
    return 'C';
  }
  
  // Look for explicit choices with punctuation
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
