require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'dispatch.db');
const db = new Database(dbPath);

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id TEXT UNIQUE NOT NULL,
      customer_name TEXT,
      callback_number TEXT,
      service_address TEXT,
      issue_type TEXT,
      urgency TEXT,
      access_notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS owner_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id TEXT NOT NULL,
      from_number TEXT NOT NULL,
      reply_text TEXT NOT NULL,
      parsed_reply TEXT,
      status TEXT DEFAULT 'processing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (call_id) REFERENCES calls(call_id)
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id TEXT NOT NULL,
      follow_up_type TEXT NOT NULL,
      scheduled_time TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (call_id) REFERENCES calls(call_id)
    );
  `);
}

initDatabase();

// Helper: Parse owner reply
function parseOwnerReply(replyText) {
  const normalized = replyText.trim().toUpperCase();
  
  // YES variations
  if (normalized === 'YES' || normalized === 'Y' || normalized === 'DISPATCH') {
    return 'YES';
  }
  
  // TOMORROW variations
  if (normalized === 'TOMORROW' || normalized === 'TMR' || normalized === 'LATER') {
    return 'TOMORROW';
  }
  
  // CALL variations
  if (normalized === 'CALL' || normalized === 'CONNECT') {
    return 'CALL';
  }
  
  // CALL NOW / CALL LATER patterns
  if (normalized.startsWith('CALL NOW')) {
    return 'CALL_NOW';
  }
  
  if (normalized.startsWith('CALL LATER')) {
    const timeMatch = normalized.match(/CALL LATER\s+(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) {
      return `CALL_LATER_${timeMatch[0].replace('CALL LATER ', '').trim()}`;
    }
    return 'CALL_LATER';
  }
  
  return null;
}

// Helper: Get safe field value
function safeField(value) {
  return value && value.trim() ? value.trim() : 'Unclear';
}

// Helper: Format message to owner
function formatOwnerMessage(callData) {
  return `New after-hours call.
Name: ${safeField(callData.customer_name)}
Phone: ${safeField(callData.callback_number)}
Address: ${safeField(callData.service_address)}
Issue: ${safeField(callData.issue_type)}
Urgency: ${safeField(callData.urgency)}
Access: ${safeField(callData.access_notes)}
Reply: YES / TOMORROW / CALL
CallID: ${callData.call_id}`;
}

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Retell webhook: call ended
app.post('/webhooks/retell/call-ended', async (req, res) => {
  try {
    const payload = req.body;
    
    // Extract call data from Retell webhook payload
    // Retell typically sends: call_id, direction, from_number, to_number, end_reason, transcript, metadata
    const callId = payload.call_id || payload.callId || `retell_${Date.now()}`;
    
    // Extract structured data from transcript or metadata
    // For MVP, we'll look for structured data in metadata, or parse from transcript
    const metadata = payload.metadata || payload.custom_variables || {};
    const transcript = payload.transcript || '';
    
    const customerName = metadata.customer_name || metadata.CustomerName || extractFromTranscript(transcript, 'name') || null;
    const callbackNumber = metadata.callback_number || metadata.CallbackNumber || payload.from_number || null;
    const serviceAddress = metadata.service_address || metadata.ServiceAddress || extractFromTranscript(transcript, 'address') || null;
    const issueType = metadata.issue_type || metadata.IssueType || extractFromTranscript(transcript, 'issue') || null;
    const urgency = metadata.urgency || metadata.Urgency || extractFromTranscript(transcript, 'urgency') || null;
    const accessNotes = metadata.access_notes || metadata.AccessNotes || extractFromTranscript(transcript, 'access') || null;
    
    // Store call in database
    const insertCall = db.prepare(`
      INSERT OR REPLACE INTO calls (call_id, customer_name, callback_number, service_address, issue_type, urgency, access_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    
    insertCall.run(callId, customerName, callbackNumber, serviceAddress, issueType, urgency, accessNotes);
    
    // Prepare message for owner
    const callData = {
      call_id: callId,
      customer_name: customerName,
      callback_number: callbackNumber,
      service_address: serviceAddress,
      issue_type: issueType,
      urgency: urgency,
      access_notes: accessNotes
    };
    
    const message = formatOwnerMessage(callData);
    const ownerPhone = process.env.OWNER_PHONE_NUMBER;
    
    if (!ownerPhone) {
      console.error('OWNER_PHONE_NUMBER not configured');
      return res.status(500).json({ error: 'Owner phone number not configured' });
    }
    
    // Send SMS to owner
    const smsResult = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: ownerPhone
    });
    
    console.log(`SMS sent to owner for call ${callId}: ${smsResult.sid}`);
    
    // Update call status
    const updateStatus = db.prepare('UPDATE calls SET status = ? WHERE call_id = ?');
    updateStatus.run('sms_sent', callId);
    
    res.json({ 
      success: true, 
      call_id: callId,
      sms_sid: smsResult.sid
    });
    
  } catch (error) {
    console.error('Error processing Retell webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper: Extract data from transcript (simple keyword-based extraction)
function extractFromTranscript(transcript, field) {
  if (!transcript) return null;
  
  const lower = transcript.toLowerCase();
  const patterns = {
    name: /(?:name|customer|caller)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    address: /(?:address|location|service address)[\s:]+([^\n,]+)/i,
    issue: /(?:issue|problem|type)[\s:]+([^\n,]+)/i,
    urgency: /(?:urgency|urgent|priority)[\s:]+([^\n,]+)/i,
    access: /(?:access|notes)[\s:]+([^\n,]+)/i
  };
  
  const pattern = patterns[field];
  if (!pattern) return null;
  
  const match = transcript.match(pattern);
  return match ? match[1].trim() : null;
}

// Twilio webhook: SMS from owner
app.post('/webhooks/twilio/sms', async (req, res) => {
  try {
    const fromNumber = req.body.From;
    const replyText = req.body.Body || '';
    const twilioMessageSid = req.body.MessageSid;
    
    // Parse the reply
    const parsedReply = parseOwnerReply(replyText);
    
    if (!parsedReply) {
      // Unknown reply format - send clarification
      const clarification = `Please reply with one of:
YES - to dispatch plumber
TOMORROW - to schedule for tomorrow
CALL - to call the customer`;
      
      await twilioClient.messages.create({
        body: clarification,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: fromNumber
      });
      
      return res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
    
    // Find the most recent pending call for this owner
    const pendingCall = db.prepare(`
      SELECT * FROM calls 
      WHERE status = 'sms_sent' 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get();
    
    if (!pendingCall) {
      await twilioClient.messages.create({
        body: 'No pending call found. Please check your records.',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: fromNumber
      });
      
      return res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
    
    // Store owner reply
    const insertReply = db.prepare(`
      INSERT INTO owner_replies (call_id, from_number, reply_text, parsed_reply, status)
      VALUES (?, ?, ?, ?, 'processing')
    `);
    insertReply.run(pendingCall.call_id, fromNumber, replyText, parsedReply);
    
    // Route based on reply
    if (parsedReply === 'YES') {
      // Dispatch: SMS plumber with call details
      const plumberPhone = process.env.ON_CALL_PLUMBER_NUMBER;
      
      if (!plumberPhone) {
        console.error('ON_CALL_PLUMBER_NUMBER not configured');
        await twilioClient.messages.create({
          body: 'Error: Plumber number not configured. Please contact support.',
          from: process.env.TWILIO_PHONE_NUMBER,
          to: fromNumber
        });
      } else {
        const plumberMessage = `New dispatch request:
Call ID: ${pendingCall.call_id}
Customer: ${safeField(pendingCall.customer_name)}
Phone: ${safeField(pendingCall.callback_number)}
Address: ${safeField(pendingCall.service_address)}
Issue: ${safeField(pendingCall.issue_type)}
Urgency: ${safeField(pendingCall.urgency)}
Access: ${safeField(pendingCall.access_notes)}`;
        
        await twilioClient.messages.create({
          body: plumberMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: plumberPhone
        });
        
        // Confirm to owner
        await twilioClient.messages.create({
          body: `Plumber notified. Call ID: ${pendingCall.call_id}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: fromNumber
        });
        
        // Update status
        const updateCall = db.prepare('UPDATE calls SET status = ? WHERE call_id = ?');
        updateCall.run('dispatched', pendingCall.call_id);
        
        const updateReply = db.prepare('UPDATE owner_replies SET status = ? WHERE call_id = ? AND id = (SELECT MAX(id) FROM owner_replies WHERE call_id = ?)');
        updateReply.run('completed', pendingCall.call_id, pendingCall.call_id);
      }
      
    } else if (parsedReply === 'TOMORROW') {
      // Schedule for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const insertFollowUp = db.prepare(`
        INSERT INTO follow_ups (call_id, follow_up_type, scheduled_time, status)
        VALUES (?, 'tomorrow', ?, 'pending')
      `);
      insertFollowUp.run(pendingCall.call_id, tomorrowStr);
      
      // Confirm to owner
      await twilioClient.messages.create({
        body: `Follow-up scheduled for tomorrow. Call ID: ${pendingCall.call_id}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: fromNumber
      });
      
      // Update status
      const updateCall = db.prepare('UPDATE calls SET status = ? WHERE call_id = ?');
      updateCall.run('scheduled', pendingCall.call_id);
      
      const updateReply = db.prepare('UPDATE owner_replies SET status = ? WHERE call_id = ? AND id = (SELECT MAX(id) FROM owner_replies WHERE call_id = ?)');
      updateReply.run('completed', pendingCall.call_id, pendingCall.call_id);
      
    } else if (parsedReply === 'CALL' || parsedReply.startsWith('CALL_')) {
      // Ask for CALL NOW or CALL LATER with time
      if (parsedReply === 'CALL') {
        // Initial CALL reply - ask for timing
        await twilioClient.messages.create({
          body: `Call requested for Call ID: ${pendingCall.call_id}. Reply with:
CALL NOW - to call immediately
CALL LATER HH:MM - to schedule (e.g., CALL LATER 14:30)`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: fromNumber
        });
        
        // Update call status to waiting for call timing
        const updateCall = db.prepare('UPDATE calls SET status = ? WHERE call_id = ?');
        updateCall.run('awaiting_call_time', pendingCall.call_id);
        
      } else if (parsedReply === 'CALL_NOW') {
        // Call now - store and confirm
        const insertFollowUp = db.prepare(`
          INSERT INTO follow_ups (call_id, follow_up_type, scheduled_time, status)
          VALUES (?, 'call_now', ?, 'pending')
        `);
        insertFollowUp.run(pendingCall.call_id, new Date().toISOString());
        
        await twilioClient.messages.create({
          body: `Call scheduled now. Call ID: ${pendingCall.call_id}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: fromNumber
        });
        
        const updateCall = db.prepare('UPDATE calls SET status = ? WHERE call_id = ?');
        updateCall.run('call_scheduled', pendingCall.call_id);
        
        const updateReply = db.prepare('UPDATE owner_replies SET status = ? WHERE call_id = ? AND id = (SELECT MAX(id) FROM owner_replies WHERE call_id = ?)');
        updateReply.run('completed', pendingCall.call_id, pendingCall.call_id);
        
      } else if (parsedReply.startsWith('CALL_LATER')) {
        // Call later with time
        const timeStr = parsedReply.replace('CALL_LATER_', '');
        const insertFollowUp = db.prepare(`
          INSERT INTO follow_ups (call_id, follow_up_type, scheduled_time, status)
          VALUES (?, 'call_later', ?, 'pending')
        `);
        insertFollowUp.run(pendingCall.call_id, timeStr);
        
        await twilioClient.messages.create({
          body: `Call scheduled for ${timeStr}. Call ID: ${pendingCall.call_id}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: fromNumber
        });
        
        const updateCall = db.prepare('UPDATE calls SET status = ? WHERE call_id = ?');
        updateCall.run('call_scheduled', pendingCall.call_id);
        
        const updateReply = db.prepare('UPDATE owner_replies SET status = ? WHERE call_id = ? AND id = (SELECT MAX(id) FROM owner_replies WHERE call_id = ?)');
        updateReply.run('completed', pendingCall.call_id, pendingCall.call_id);
      }
    }
    
    // Return TwiML response (empty - we handle via async SMS)
    res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    
  } catch (error) {
    console.error('Error processing Twilio SMS webhook:', error);
    res.status(500).type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Dispatch loop server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

