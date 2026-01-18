#!/usr/bin/env node
/**
 * Reliability test script for dispatch loop
 * Tests SMS send verification and follow-up execution
 */

require('dotenv').config();
const { processDispatch } = require('../lib/dispatchEngine');
const { base, TABLES } = require('../lib/airtable');

async function testSMSReliability() {
  console.log('🧪 Testing SMS reliability...\n');
  
  // Check if TEST_MODE is enabled (prevents real SMS sends)
  const testMode = process.env.TEST_MODE === 'true';
  if (testMode) {
    console.log('⚠️  TEST_MODE enabled - SMS sends will be skipped\n');
  }
  
  // Test 1: SMS send
  console.log('1. Testing SMS send...');
  const testCallData = {
    callerPhone: process.env.TEST_CALLER_PHONE || '+19497968362',
    emergencyLevel: 'HIGH',
    issueSummary: 'Test reliability check - please ignore',
    twilioToNumber: process.env.TWILIO_PHONE_NUMBER,
    callId: `test_${Date.now()}`,
  };
  
  try {
    const result = await processDispatch(testCallData);
    console.log('   Dispatch result:', JSON.stringify(result, null, 2));
    
    // Verify SMS sent
    if (result.channels?.sms?.success) {
      console.log('   ✅ SMS sent successfully');
      console.log('   SID:', result.channels.sms.sid);
      
      // Test 2: Check Dispatch Events written
      console.log('\n2. Checking Dispatch Events written...');
      await checkDispatchEvent(result.callId, result.channels.sms.sid);
      
      // Test 3: Wait for status callback (informational)
      console.log('\n3. Status callback check...');
      console.log('   ℹ️  Status callback should be received within 30 seconds');
      console.log('   ℹ️  Check Dispatch Events table for delivery status update');
      console.log('   ℹ️  Message SID:', result.channels.sms.sid);
      
    } else {
      console.error('   ❌ SMS send failed:', result.channels?.sms?.error);
      if (result.channels?.sms?.errorCode === 30034) {
        console.log('   ℹ️  A2P 30034 error - SMS blocked, falling back to email');
      }
    }
  } catch (error) {
    console.error('   ❌ Dispatch failed:', error.message);
    throw error;
  }
  
  console.log('\n✅ Test complete');
}

/**
 * Check if Dispatch Event was written to Airtable
 */
async function checkDispatchEvent(callId, messageSid) {
  try {
    // Wait a moment for async write to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Query Dispatch Events table for this callId
    const records = await base(TABLES.DISPATCH_EVENTS)
      .select({
        maxRecords: 10,
        filterByFormula: `{Call} = '${callId}'`,
      })
      .firstPage();
    
    if (records.length > 0) {
      console.log('   ✅ Dispatch Event found in Airtable');
      const event = records[0];
      console.log('   Event ID:', event.id);
      console.log('   Method:', event.get('Method') || 'N/A');
      console.log('   Attempt Number:', event.get('Attempt Number') || 'N/A');
      
      // Check if messageSid is stored
      const storedSid = event.get('Message SID') || event.get('messageSid') || null;
      if (storedSid) {
        console.log('   ✅ Message SID stored:', storedSid);
        if (storedSid === messageSid) {
          console.log('   ✅ Message SID matches');
        } else {
          console.log('   ⚠️  Message SID mismatch (expected:', messageSid, ')');
        }
      } else {
        console.log('   ⚠️  Message SID not found in event (field may not exist)');
      }
    } else {
      console.log('   ⚠️  Dispatch Event not found (may still be writing or table unavailable)');
    }
  } catch (error) {
    console.error('   ⚠️  Error checking Dispatch Events:', error.message);
    // Don't fail test - table may not be available
  }
}

// Run test
testSMSReliability().catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});
