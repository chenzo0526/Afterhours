import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for form submissions (trial form in app/page.tsx).
 *
 * Trial mapping: Always writes to Airtable table tblQj1iCoHrTkqoXs (Businesses).
 * Maps 'Restoration' trade to 'Other'. Sends confirmation SMS via Twilio.
 */

const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appMJsHP71wkLODeW';
const AIRTABLE_TABLE_BUSINESSES_ID = 'tblQj1iCoHrTkqoXs';

// Field IDs from DATA_CONTEXT.md
const FIELD_BUSINESS_NAME = 'fldDGjgICRUismisU';
const FIELD_TRADE = 'fldjG0IuIRp8H9Gwj';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Send confirmation SMS via Twilio
 */
async function sendConfirmationSMS(phoneNumber: string, businessName: string): Promise<void> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[SMS] Twilio not configured, skipping SMS');
    return;
  }

  if (!phoneNumber || !phoneNumber.trim()) {
    console.warn('[SMS] No phone number provided, skipping SMS');
    return;
  }

  try {
    // Normalize phone number (ensure E.164 format)
    const normalizedPhone = phoneNumber.trim().startsWith('+')
      ? phoneNumber.trim()
      : `+1${phoneNumber.trim().replace(/\D/g, '')}`;

    const message = `Thanks ${businessName || 'for signing up'}! We've received your information and will be in touch shortly. - Afterhours AI`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: normalizedPhone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[SMS] Confirmation SMS sent successfully:', data.sid);
  } catch (error) {
    // Log error but don't fail the request
    console.error('[SMS] Failed to send confirmation SMS:', error);
    // Don't throw - SMS failure shouldn't block form submission
  }
}

/**
 * Create record in Airtable Businesses table
 */
async function createBusinessRecord(
  businessName: string,
  trade?: string
): Promise<string> {
  if (!AIRTABLE_ACCESS_TOKEN) {
    throw new Error('AIRTABLE_ACCESS_TOKEN is not configured');
  }

  if (!businessName || !businessName.trim()) {
    throw new Error('Business Name is required');
  }

  const validTrades = ['Plumbing', 'HVAC', 'Electrical', 'Other'] as const;
  const raw = (trade && trade.trim()) || '';
  const normalized = raw === 'Restoration' ? 'Other' : raw; /* Restoration → Other */
  const resolvedTrade = normalized && validTrades.includes(normalized as (typeof validTrades)[number])
    ? (normalized as (typeof validTrades)[number])
    : 'Other';

  const fields: Record<string, unknown> = {
    [FIELD_BUSINESS_NAME]: businessName.trim(),
    [FIELD_TRADE]: resolvedTrade,
  };

  const url = `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_BUSINESSES_ID}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          fields,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Airtable] API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { records?: Array<{ id: string }> };
  const recordId = data?.records?.[0]?.id;

  if (!recordId) {
    throw new Error('Failed to get record ID from Airtable response');
  }

  return recordId;
}

export async function POST(request: NextRequest) {
  let recordId: string | null = null;
  let businessName = '';
  let phoneNumber = '';

  try {
    const data = await request.json();

    // Extract form fields (handle various naming conventions)
    businessName =
      data.businessName ||
      data.business_name ||
      data.company ||
      data.companyName ||
      data.name ||
      '';

    const trade = data.trade || data.service || data.serviceType || data.service_type || '';

    phoneNumber = data.phone || data.phoneNumber || data.phone_number || '';

    // Validate required fields
    if (!businessName || !businessName.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Business Name is required',
        },
        { status: 400 }
      );
    }

    // Create record in Airtable
    recordId = await createBusinessRecord(businessName.trim(), trade);

    console.log('[Submit] Business record created:', {
      recordId,
      businessName: businessName.trim(),
      trade: trade || 'not provided',
    });

    // Send confirmation SMS (non-blocking)
    if (phoneNumber) {
      // Don't await - send SMS asynchronously
      sendConfirmationSMS(phoneNumber, businessName.trim()).catch((error) => {
        console.error('[Submit] SMS error (non-blocking):', error);
      });
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We\'ll follow up by phone, typically within 24 hours.',
        record_id: recordId,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error to Vercel
    console.error('[Submit] Form submission error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      businessName,
      recordId,
    });

    // Return 500 if Airtable failed
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'There was an error processing your submission. Please try again.',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}
