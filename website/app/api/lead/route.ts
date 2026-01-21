export const runtime = "nodejs";

import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY ?? process.env.AIRTABLE_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_LEADS = process.env.AIRTABLE_TABLE_LEADS || "Leads";
const AIRTABLE_DATA_BASE = "https://api.airtable.com/v0";
const AIRTABLE_META_BASE = "https://api.airtable.com/v0/meta";

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
  if (!AIRTABLE_API_KEY) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_API_KEY", 500);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
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

type LeadFieldSchema = {
  name: string;
  type: string;
  options?: Record<string, unknown>;
};

const LEAD_STATUS_OPTIONS = ["New", "Contacted", "Qualified", "Disqualified"] as const;

function buildLeadFieldSchema(): LeadFieldSchema[] {
  return [
    { name: "Name", type: "singleLineText" },
    { name: "Email", type: "email" },
    { name: "Phone", type: "singleLineText" },
    { name: "Company", type: "singleLineText" },
    { name: "Role", type: "singleLineText" },
    { name: "Website", type: "url" },
    { name: "Source", type: "singleLineText" },
    {
      name: "Status",
      type: "singleSelect",
      options: {
        choices: LEAD_STATUS_OPTIONS.map((name) => ({ name })),
      },
    },
    { name: "Created At", type: "createdTime" },
  ];
}

async function ensureLeadsTableReady() {
  if (!AIRTABLE_BASE_ID) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_BASE_ID", 500);
  }

  const tables = await fetchJson<{ tables?: Array<{ id: string; name: string; fields?: any[] }> }>(
    `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`
  );
  const leadTable = tables?.tables?.find((table) => table.name === AIRTABLE_TABLE_LEADS);
  const schema = buildLeadFieldSchema();

  if (!leadTable) {
    await fetchJson(`${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`, {
      method: "POST",
      body: JSON.stringify({
        name: AIRTABLE_TABLE_LEADS,
        fields: schema,
      }),
    });
    return;
  }

  const existing = new Set((leadTable.fields || []).map((field) => field.name));
  const missing = schema.filter((field) => !existing.has(field.name));
  for (const field of missing) {
    await fetchJson(
      `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables/${leadTable.id}/fields`,
      {
        method: "POST",
        body: JSON.stringify(field),
      }
    );
  }
}

let ensureLeadsTablePromise: Promise<void> | null = null;
function ensureLeadsTableOnce() {
  if (!ensureLeadsTablePromise) {
    ensureLeadsTablePromise = ensureLeadsTableReady().catch((err) => {
      ensureLeadsTablePromise = null;
      throw err;
    });
  }
  return ensureLeadsTablePromise;
}

function logError(err: unknown, context?: Record<string, unknown>) {
  if (err instanceof LeadApiError) {
    console.error("[LEAD_API]", { code: err.code, message: err.message, ...context });
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("[LEAD_API]", { code: "AIRTABLE_ERROR", message, ...context });
}

function logStatus(status: "received" | "success" | "error", context: Record<string, unknown>) {
  console.info("[LEAD_API]", { route: "api/lead", status, ...context });
}

function promoteLeadToBusiness(_leadId: string) {
  // TODO: Future workflow:
  // 1. Validate lead status
  // 2. Copy record to Businesses table
  // 3. Link records
  // 4. Preserve lead history
}

export async function POST(req: Request) {
  let email = "";
  let company = "";
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const name = pickValue(body, ["name", "fullName", "full_name", "contactName"]);
    company = pickValue(body, [
      "business_name",
      "businessName",
      "business",
      "company",
      "companyName",
    ]);
    const phone = pickValue(body, ["phone", "phone_number", "phoneNumber"]);
    email = pickValue(body, ["email", "emailAddress"]);
    const roleRaw = pickValue(body, ["role", "title", "position"]);
    const trade = pickValue(body, ["trade", "service", "serviceType", "service_type"]);
    const website = pickValue(body, ["website", "companyWebsite", "company_website", "url"]);
    const normalizedWebsite = normalizeWebsiteInput(website);
    const role = roleRaw || (trade ? `Trade: ${trade}` : "");
    const source = pickValue(body, ["source"]) || "website";
    const statusRaw = pickValue(body, ["status"]) || "New";
    const status = LEAD_STATUS_OPTIONS.includes(statusRaw as (typeof LEAD_STATUS_OPTIONS)[number])
      ? statusRaw
      : "New";

    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!email) missing.push("email");

    if (missing.length) {
      throw new LeadApiError(
        "VALIDATION_ERROR",
        `Missing required fields: ${missing.join(", ")}`,
        400
      );
    }

    logStatus("received", { email, company });

    if (website && !normalizedWebsite) {
      throw new LeadApiError(
        "VALIDATION_ERROR",
        "Invalid website URL.",
        400
      );
    }

    await ensureLeadsTableOnce();

    const payload = {
      Name: name,
      Email: email,
      Phone: phone || undefined,
      Company: company || undefined,
      Role: role || undefined,
      Website: normalizedWebsite || undefined,
      Source: source,
      Status: status,
    };

    const recordId = await createRecord(AIRTABLE_TABLE_LEADS, payload);
    logStatus("success", { email, company });
    promoteLeadToBusiness(recordId);
    return NextResponse.json({ ok: true, id: recordId || crypto.randomUUID() }, { status: 200 });
  } catch (err) {
    const errorCode = err instanceof LeadApiError ? err.code : "AIRTABLE_ERROR";
    logStatus("error", { email, company, error_code: errorCode });
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
        hasToken: Boolean(AIRTABLE_API_KEY),
        hasBaseId: Boolean(AIRTABLE_BASE_ID),
      },
    },
    { status: 200 }
  );
}
