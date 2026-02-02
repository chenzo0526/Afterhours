import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Morning Digest API — "God-Mode" logic
 *
 * 1. Pulls last 24h of call transcripts from Airtable Calls table (tblXJiS9Czxi3MEkF).
 *    Same base as Businesses (tblQj1iCoHrTkqoXs); transcripts live in Calls.
 * 2. Uses Gemini 1.5 Pro to generate a Morning Digest: (A) Hot Leads, (B) Total Revenue Opportunity, (C) Non-urgent follow-ups.
 * 3. Lead scoring: analyzes Businesses Notes via Gemini, updates Lead_Score (0–100). Add a "Lead_Score" number field to Businesses if missing.
 */

const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appMJsHP71wkLODeW';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

const TABLE_CALLS_ID = 'tblXJiS9Czxi3MEkF';
const TABLE_BUSINESSES_ID = 'tblQj1iCoHrTkqoXs';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

type AirtableRecord = { id: string; fields: Record<string, unknown> };

async function fetchCallsLast24h(): Promise<AirtableRecord[]> {
  if (!AIRTABLE_ACCESS_TOKEN) throw new Error('AIRTABLE_ACCESS_TOKEN is not configured');

  const sortField = encodeURIComponent('Call Timestamp');
  const url = `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${TABLE_CALLS_ID}?maxRecords=100&sort%5B0%5D%5Bfield%5D=${sortField}&sort%5B0%5D%5Bdirection%5D=desc`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { records?: AirtableRecord[] };
  const records = data.records ?? [];
  const now = Date.now();

  return records.filter((r) => {
    const ts = r.fields['Call Timestamp'] as string | undefined;
    if (!ts) return false;
    const t = new Date(ts).getTime();
    return !isNaN(t) && now - t <= TWENTY_FOUR_HOURS_MS;
  });
}

async function fetchBusinessesWithNotes(): Promise<AirtableRecord[]> {
  if (!AIRTABLE_ACCESS_TOKEN) throw new Error('AIRTABLE_ACCESS_TOKEN is not configured');

  const url = `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${TABLE_BUSINESSES_ID}?maxRecords=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { records?: AirtableRecord[] };
  const records = data.records ?? [];
  return records.filter((r) => {
    const n = r.fields['Notes'];
    return typeof n === 'string' && n.trim().length > 0;
  });
}

async function patchBusinessLeadScore(recordId: string, score: number): Promise<void> {
  if (!AIRTABLE_ACCESS_TOKEN) return;

  const url = `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${TABLE_BUSINESSES_ID}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: { Lead_Score: Math.max(0, Math.min(100, Math.round(score))) },
    }),
  });
  if (!res.ok) {
    console.warn(`[Digest] Failed to PATCH Lead_Score for ${recordId}: ${res.status}`);
  }
}

function buildDigestPrompt(callsContext: string): string {
  return `You are an expert business analyst for a service-trade company (plumbing, HVAC, restoration). Below are call records from the last 24 hours (transcript excerpts, issue summary, emergency level, caller info).

Generate a "Morning Digest" for the business owner. Output valid JSON only, no markdown or extra text, with this exact structure:

{
  "hotLeads": [
    { "caller": "string", "summary": "string", "urgency": "string", "recommendedAction": "string" }
  ],
  "totalRevenueOpportunity": { "amount": number, "currency": "USD", "breakdown": "string" },
  "nonUrgentFollowUps": [
    { "caller": "string", "summary": "string", "suggestedFollowUp": "string" }
  ]
}

Rules:
- hotLeads: high-intent, emergency or near-term revenue; include recommended next step.
- totalRevenueOpportunity: estimate total $ opportunity from all leads; breakdown can be a short sentence.
- nonUrgentFollowUps: lower priority, schedule-friendly; include suggested follow-up.
- If no data, use empty arrays and amount 0 with breakdown "No calls in window."

CALL DATA (last 24h):
${callsContext}`;
}

function buildLeadScorePrompt(notes: string, businessName: string): string {
  return `You are a lead-scoring analyst. Given the following "Notes" for a business, output a single number between 0 and 100 (integer) indicating lead quality. 0 = low/no intent, 100 = hot, ready-to-buy.

Business: ${businessName}
Notes:
${notes}

Reply with ONLY the number, no explanation.`;
}

export async function GET(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const skipLeadScore = searchParams.get('skipLeadScore') === '1';

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // —— 1. Fetch last 24h calls (transcripts) ——
    let calls: AirtableRecord[] = [];
    if (AIRTABLE_ACCESS_TOKEN) {
      calls = await fetchCallsLast24h();
    }

    const callsContext = calls.length === 0
      ? 'No calls in the last 24 hours.'
      : calls.map((r) => {
          const ts = (r.fields['Call Timestamp'] as string) ?? '';
          const transcript = (r.fields['Transcript'] as string) ?? '';
          const summary = (r.fields['Issue Summary'] as string) ?? '';
          const level = (r.fields['Emergency Level'] as string) ?? '';
          const phone = (r.fields['Caller Phone'] as string) ?? '';
          const trunc = transcript.length > 800 ? transcript.slice(0, 800) + '...' : transcript;
          return `[${ts}] Caller: ${phone} | Emergency: ${level}\nIssue: ${summary}\nTranscript:\n${trunc}`;
        }).join('\n\n---\n\n');

    const digestPrompt = buildDigestPrompt(callsContext);
    const digestResult = await model.generateContent(digestPrompt);
    const digestText = digestResult.response.text();
    let digest: {
      hotLeads: Array<{ caller: string; summary: string; urgency: string; recommendedAction: string }>;
      totalRevenueOpportunity: { amount: number; currency: string; breakdown: string };
      nonUrgentFollowUps: Array<{ caller: string; summary: string; suggestedFollowUp: string }>;
    };

    try {
      const cleaned = digestText.replace(/```json?\s*|\s*```/g, '').trim();
      digest = JSON.parse(cleaned) as typeof digest;
    } catch {
      digest = {
        hotLeads: [],
        totalRevenueOpportunity: { amount: 0, currency: 'USD', breakdown: 'Parse error; no calls or invalid model output.' },
        nonUrgentFollowUps: [],
      };
    }

    // —— 2. Lead scoring: analyze Notes, update Lead_Score ——
    const leadScores: Array<{ businessId: string; businessName: string; score: number }> = [];
    if (!skipLeadScore && AIRTABLE_ACCESS_TOKEN) {
      const businesses = await fetchBusinessesWithNotes();
      for (const b of businesses) {
        const name = (b.fields['Business Name'] as string) ?? 'Unknown';
        const notes = (b.fields['Notes'] as string) ?? '';
        const prompt = buildLeadScorePrompt(notes, name);
        const res = await model.generateContent(prompt);
        const raw = res.response.text().trim().replace(/\D/g, '');
        const score = Math.min(100, Math.max(0, parseInt(raw, 10) || 0));
        leadScores.push({ businessId: b.id, businessName: name, score });
        await patchBusinessLeadScore(b.id, score);
      }
    }

    return NextResponse.json({
      digest,
      leadScores: leadScores.length ? leadScores : undefined,
      meta: { callsCount: calls.length, generatedAt: new Date().toISOString() },
    });
  } catch (e) {
    console.error('[Digest] Error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Digest generation failed' },
      { status: 500 }
    );
  }
}
