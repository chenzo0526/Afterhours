import { NextResponse } from "next/server";

const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_LEADS = process.env.AIRTABLE_TABLE_LEADS || "Leads";
const AIRTABLE_DATA_BASE = "https://api.airtable.com/v0";

type LeadApiErrorCode = "MISSING_ENV" | "AIRTABLE_ERROR" | "VALIDATION_ERROR";

class LeadApiError extends Error {
  code: LeadApiErrorCode;
  status: number;

  constructor(code: LeadApiErrorCode, message: string, status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function pickValue(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim().length) {
      return value.trim();
    }
  }
  return "";
}

async function fetchJson<T>(url: string, options: RequestInit = {}) {
  if (!AIRTABLE_ACCESS_TOKEN) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_ACCESS_TOKEN", 500);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new LeadApiError(
      "AIRTABLE_ERROR",
      `Airtable API request failed (${response.status}): ${text || "No response body"}`,
      502
    );
  }

  return (await response.json()) as T;
}

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.toString();
  } catch {
    return "";
  }
}

async function createRecord(tableIdOrName: string, fields: Record<string, unknown>) {
  if (!AIRTABLE_BASE_ID) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_BASE_ID", 500);
  }

  const url = `${AIRTABLE_DATA_BASE}/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    tableIdOrName
  )}`;
  const data = await fetchJson<{ records?: Array<{ id: string }> }>(url, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }] }),
  });

  return data?.records?.[0]?.id || "";
}

function logError(err: unknown, context?: Record<string, unknown>) {
  if (err instanceof LeadApiError) {
    console.error("[LEAD_API]", { code: err.code, message: err.message, ...context });
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("[LEAD_API]", { code: "AIRTABLE_ERROR", message, ...context });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const name = pickValue(body, ["name", "fullName", "full_name", "contactName"]);
    const businessName = pickValue(body, [
      "business_name",
      "businessName",
      "business",
      "company",
      "companyName",
    ]);
    const phone = pickValue(body, ["phone", "phone_number", "phoneNumber"]);
    const email = pickValue(body, ["email", "emailAddress"]);
    const trade = pickValue(body, ["trade", "service", "serviceType", "service_type"]);
    const website = pickValue(body, ["website", "companyWebsite", "company_website", "url"]);
    const notes = pickValue(body, ["notes", "note"]);
    const statusHint = pickValue(body, ["status"]);
    const normalizedWebsite = normalizeWebsiteInput(website);

    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!businessName) missing.push("business_name");
    if (!phone) missing.push("phone");
    if (!email) missing.push("email");
    if (!trade) missing.push("trade");

    if (missing.length) {
      throw new LeadApiError(
        "VALIDATION_ERROR",
        `Missing required fields: ${missing.join(", ")}`,
        400
      );
    }

  if (website && !normalizedWebsite) {
      throw new LeadApiError(
        "VALIDATION_ERROR",
        "Invalid website URL.",
        400
      );
    }

  if (!AIRTABLE_ACCESS_TOKEN) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_ACCESS_TOKEN", 500);
  }

  if (!AIRTABLE_BASE_ID) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_BASE_ID", 500);
  }

  const createdAt = new Date().toISOString();
  const notesParts = [];
  if (notes) notesParts.push(notes);
  if (statusHint) notesParts.push(`Start status: ${statusHint}`);

  const payload = {
    Name: name,
    "Business Name": businessName,
    Phone: phone,
    Email: email,
    Trade: trade,
    Website: normalizedWebsite || undefined,
    Notes: notesParts.join("\n\n") || undefined,
    Source: "website",
    "Created At": createdAt,
  };

  const recordId = await createRecord(AIRTABLE_TABLE_LEADS, payload);
  return NextResponse.json({ ok: true, id: recordId || crypto.randomUUID() }, { status: 200 });
  } catch (err) {
    logError(err, { stage: "lead_post" });

    if (err instanceof LeadApiError) {
      return NextResponse.json(
        { ok: false, error: err.message, code: err.code },
        { status: err.status }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Lead submission failed.", code: "AIRTABLE_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      env: {
        hasToken: Boolean(AIRTABLE_ACCESS_TOKEN),
        hasBaseId: Boolean(AIRTABLE_BASE_ID),
      },
    },
    { status: 200 }
  );
}
