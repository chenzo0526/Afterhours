import { NextRequest, NextResponse } from 'next/server';

/**
 * Interactive Demo Call API
 * 
 * Initiates a demo call using Retell API for interactive demonstration.
 * Falls back to Twilio if Retell is not configured.
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;
// Internal Note: This agent acts as a lead qualifier for our software business to prove the concept.
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID ?? 'REPLACE_WITH_VINCENZO_AGENT_ID';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, type = 'interactive' } = body;

    // If Retell is configured, use Retell API
    if (RETELL_API_KEY && RETELL_AGENT_ID) {
      return await initiateRetellCall(phoneNumber, type);
    }

    // Fallback to Twilio if configured
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      return await initiateTwilioCall(phoneNumber);
    }

    // If neither is configured, return test call URL
    return NextResponse.json({
      success: true,
      message: 'Demo call service not configured. Please contact support to set up.',
      callUrl: 'https://dashboard.retellai.com',
      configured: false,
    });
  } catch (error) {
    console.error('[Demo Call API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate demo call',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function initiateRetellCall(phoneNumber: string | undefined, type: string) {
  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    throw new Error('Retell API not configured');
  }

  // Retell API V2 endpoint for creating phone calls
  const retellApiUrl = 'https://api.retellai.com/v2/create-phone-call';

  // If no phone number provided, return test call interface URL
  if (!phoneNumber) {
    return NextResponse.json({
      success: true,
      message: 'Interactive demo available',
      callUrl: `https://dashboard.retellai.com/agent/${RETELL_AGENT_ID}/test-call`,
      type: 'test-interface',
      configured: true,
    });
  }

  // Retell API payload for outbound call
  const payload = {
    agent_id: RETELL_AGENT_ID,
    phone_number: phoneNumber,
    override_agent_phone_number_settings: true,
    // Optional: Add metadata for tracking
    metadata: {
      call_type: 'demo',
      source: 'website_interactive_demo',
    },
  };

  try {
    const response = await fetch(retellApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Retell API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      callId: data.call_id,
      message: 'Demo call initiated successfully',
      status: data.status,
      configured: true,
    });
  } catch (error) {
    console.error('[Retell Call] Error:', error);
    throw error;
  }
}

async function initiateTwilioCall(phoneNumber: string | undefined) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio not configured');
  }

  if (!phoneNumber) {
    // Return Twilio test interface URL
    return NextResponse.json({
      success: true,
      message: 'Twilio demo available',
      callUrl: `https://console.twilio.com/us1/develop/phone-numbers/manage/incoming/${TWILIO_PHONE_NUMBER}`,
      type: 'twilio-console',
      configured: true,
    });
  }

  // Use Twilio API to make outbound call
  // This would require the Twilio SDK on the server
  // For now, return instructions
  return NextResponse.json({
    success: true,
    message: 'Twilio call initiation requires server-side SDK',
    instructions: 'Use Twilio SDK to create outbound call',
    configured: true,
  });
}
