/**
 * Dispatch Packet Builder
 * Creates standardized dispatch summary messages for techs
 */

function buildDispatchPacket(callData, callRecordId = null) {
  const {
    callerName,
    callerPhone,
    addressLine1,
    city,
    state,
    zip,
    issueSummary,
    urgency,
    emergencyReason,
    preferredContactMethod,
    bestTimeToReach,
  } = callData;
  
  // Build address string
  const addressParts = [addressLine1, city, state, zip].filter(Boolean);
  const address = addressParts.length > 0 
    ? addressParts.join(', ') 
    : city || 'Address not provided';
  
  // Build urgency indicator
  const urgencyEmoji = urgency === 'HIGH' ? '🚨' : urgency === 'MEDIUM' ? '⚠️' : 'ℹ️';
  const urgencyText = urgency === 'HIGH' ? 'EMERGENCY' : urgency === 'MEDIUM' ? 'URGENT' : 'ROUTINE';
  
  // Build message
  let message = `${urgencyEmoji} ${urgencyText} - After-Hours Call\n\n`;
  
  message += `👤 Name: ${callerName || 'Not provided'}\n`;
  message += `📞 Phone: ${callerPhone || 'Not provided'}\n`;
  message += `📍 Address: ${address}\n\n`;
  
  message += `🔧 Issue: ${issueSummary || 'See transcript'}\n`;
  
  if (emergencyReason) {
    message += `⚠️ Reason: ${emergencyReason}\n`;
  }
  
  if (preferredContactMethod) {
    message += `📱 Preferred contact: ${preferredContactMethod}\n`;
  }
  
  if (bestTimeToReach) {
    message += `⏰ Best time: ${bestTimeToReach}\n`;
  }
  
  // Add Airtable link if available
  if (callRecordId) {
    const baseId = process.env.AIRTABLE_BASE_ID || 'appMJsHP71wkLODeW';
    const airtableUrl = `https://airtable.com/${baseId}/tbl.../${callRecordId}`;
    message += `\n📋 Full details: ${airtableUrl}`;
  }
  
  // Add recommended next step
  if (urgency === 'HIGH') {
    message += `\n\n🚨 ACTION REQUIRED: Please contact customer immediately.`;
  } else {
    message += `\n\nPlease contact customer to schedule service.`;
  }
  
  return message;
}

/**
 * Build SMS message (shorter version)
 */
function buildSMSMessage(callData, callRecordId = null) {
  const packet = buildDispatchPacket(callData, callRecordId);
  
  // SMS has 1600 char limit, but we'll keep it concise
  // If too long, truncate intelligently
  if (packet.length > 1500) {
    const lines = packet.split('\n');
    const essential = [
      lines[0], // Urgency header
      lines.find(l => l.includes('Name:')),
      lines.find(l => l.includes('Phone:')),
      lines.find(l => l.includes('Address:')),
      lines.find(l => l.includes('Issue:')),
      lines[lines.length - 1], // Action required
    ].filter(Boolean);
    
    return essential.join('\n') + '\n\n(Message truncated - see full details in Airtable)';
  }
  
  return packet;
}

/**
 * Build email subject
 */
function buildEmailSubject(callData) {
  const urgency = callData.urgency || 'MEDIUM';
  const urgencyText = urgency === 'HIGH' ? '🚨 EMERGENCY' : urgency === 'MEDIUM' ? '⚠️ URGENT' : 'ℹ️ ROUTINE';
  const callerName = callData.callerName || 'Unknown';
  const city = callData.city || '';
  
  return `${urgencyText} - ${callerName}${city ? ` (${city})` : ''} - After-Hours Call`;
}

/**
 * Build email body (HTML)
 */
function buildEmailBody(callData, callRecordId = null) {
  const packet = buildDispatchPacket(callData, callRecordId);
  
  // Convert to HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
        .urgent { color: #d32f2f; }
        .action { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${callData.urgency === 'HIGH' ? '🚨 EMERGENCY' : callData.urgency === 'MEDIUM' ? '⚠️ URGENT' : 'ℹ️ ROUTINE'} - After-Hours Call</h2>
      </div>
      
      <div class="field">
        <span class="label">Name:</span> ${callData.callerName || 'Not provided'}
      </div>
      <div class="field">
        <span class="label">Phone:</span> ${callData.callerPhone || 'Not provided'}
      </div>
      <div class="field">
        <span class="label">Address:</span> ${[callData.addressLine1, callData.city, callData.state, callData.zip].filter(Boolean).join(', ') || 'Not provided'}
      </div>
      <div class="field">
        <span class="label">Issue:</span> ${callData.issueSummary || 'See transcript'}
      </div>
      ${callData.emergencyReason ? `<div class="field"><span class="label">Emergency Reason:</span> ${callData.emergencyReason}</div>` : ''}
      ${callData.preferredContactMethod ? `<div class="field"><span class="label">Preferred Contact:</span> ${callData.preferredContactMethod}</div>` : ''}
      ${callData.bestTimeToReach ? `<div class="field"><span class="label">Best Time:</span> ${callData.bestTimeToReach}</div>` : ''}
      
      ${callRecordId ? `<div class="field"><a href="https://airtable.com/${process.env.AIRTABLE_BASE_ID || 'appMJsHP71wkLODeW'}/tbl.../${callRecordId}">View full details in Airtable</a></div>` : ''}
      
      <div class="action">
        <strong>${callData.urgency === 'HIGH' ? '🚨 ACTION REQUIRED: Please contact customer immediately.' : 'Please contact customer to schedule service.'}</strong>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

module.exports = {
  buildDispatchPacket,
  buildSMSMessage,
  buildEmailSubject,
  buildEmailBody,
};
