import { NextResponse } from "next/server";

type AirtableField = {
  id: string;
  name: string;
  type: string;
};

type AirtableTable = {
  id: string;
  name: string;
  fields: AirtableField[];
};

const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_LEADS = process.env.AIRTABLE_TABLE_LEADS || "Leads";
const AIRTABLE_META_BASE = "https://api.airtable.com/v0/meta";
const AIRTABLE_DATA_BASE = "https://api.airtable.com/v0";

const LEAD_TABLE_CANDIDATES = [
  AIRTABLE_TABLE_LEADS,
  "Leads",
  "Trial Leads",
  "Live Trial Leads",
  "Start Live Trial",
];
const FALLBACK_TABLE_NAME = "Businesses";
const CACHE_TTL_MS = 5 * 60 * 1000;

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

let cachedTables: { fetchedAt: number; tables: AirtableTable[] } | null = null;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
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

async function loadTables() {
  if (cachedTables && Date.now() - cachedTables.fetchedAt < CACHE_TTL_MS) {
    return cachedTables.tables;
  }

  if (!AIRTABLE_BASE_ID) {
    throw new LeadApiError("MISSING_ENV", "Missing AIRTABLE_BASE_ID", 500);
  }

  const data = await fetchJson<{ tables: AirtableTable[] }>(
    `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`
  );
  cachedTables = { fetchedAt: Date.now(), tables: data.tables || [] };
  return cachedTables.tables;
}

function findTableByName(tables: AirtableTable[], names: string[]) {
  const candidates = new Set(names.map((name) => normalize(name)));
  return tables.find((table) => candidates.has(normalize(table.name)));
}

function resolveFieldName(fields: AirtableField[], candidates: string[]) {
  const fieldMap = new Map(fields.map((field) => [normalize(field.name), field]));
  for (const candidate of candidates) {
    const match = fieldMap.get(normalize(candidate));
    if (match) return match.name;
  }
  return "";
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

    let tables: AirtableTable[] | null = null;
    try {
      tables = await loadTables();
    } catch (err) {
      logError(err, { stage: "load_tables" });
    }

    const submittedAt = new Date().toISOString();
    const notesParts = [];
    if (notes) notesParts.push(notes);
    if (statusHint) notesParts.push(`Start status: ${statusHint}`);

    if (tables) {
      const leadTable = findTableByName(tables, LEAD_TABLE_CANDIDATES);

      if (leadTable) {
        const leadFields = leadTable.fields || [];
        const payload: Record<string, unknown> = {};

        const nameField = resolveFieldName(leadFields, ["Name", "Full Name", "Contact Name"]);
        const businessField = resolveFieldName(leadFields, [
          "Business Name",
          "Company Name",
          "Company",
          "Business",
        ]);
        const phoneField = resolveFieldName(leadFields, ["Phone", "Phone Number", "Primary Phone"]);
        const emailField = resolveFieldName(leadFields, ["Email", "Email Address"]);
        const tradeField = resolveFieldName(leadFields, ["Trade", "Service", "Service Type"]);
        const websiteField = resolveFieldName(leadFields, [
          "Company Website",
          "Website",
          "Web Site",
          "URL",
        ]);
        const notesField = resolveFieldName(leadFields, ["Notes", "Lead Notes", "Details"]);
        const sourceField = resolveFieldName(leadFields, ["Source", "Lead Source"]);
        const submittedField = resolveFieldName(leadFields, [
          "Submitted At",
          "Submitted",
          "Received At",
          "Created At",
        ]);
        const statusField = resolveFieldName(leadFields, ["Status", "Lead Status"]);

        if (nameField) payload[nameField] = name;
        if (businessField) payload[businessField] = businessName;
        if (phoneField) payload[phoneField] = phone;
        if (emailField) payload[emailField] = email;
        if (tradeField) payload[tradeField] = trade;
        if (websiteField && normalizedWebsite) payload[websiteField] = normalizedWebsite;
        if (notesField && notesParts.length) payload[notesField] = notesParts.join("\n\n");
        if (sourceField) payload[sourceField] = "website";
        if (submittedField) payload[submittedField] = submittedAt;
        if (statusField) payload[statusField] = "New";

        const recordId = await createRecord(leadTable.id, payload);
        return NextResponse.json({ ok: true, id: recordId || crypto.randomUUID() }, { status: 200 });
      }

      const fallbackTable = findTableByName(tables, [FALLBACK_TABLE_NAME]);
      if (!fallbackTable) {
        throw new LeadApiError(
          "AIRTABLE_ERROR",
          "Lead table not found and Businesses table is missing.",
          502
        );
      }

      const fallbackFields = fallbackTable.fields || [];
      const fallbackPayload: Record<string, unknown> = {};
      const fallbackBusinessField = resolveFieldName(fallbackFields, [
        "Business Name",
        "Company Name",
        "Company",
        "Business",
      ]);
      const fallbackPhoneField = resolveFieldName(fallbackFields, [
        "Primary Phone",
        "Phone",
        "Phone Number",
      ]);
      const fallbackTradeField = resolveFieldName(fallbackFields, ["Trade", "Service"]);
      const fallbackNotesField = resolveFieldName(fallbackFields, ["Notes", "Lead Notes"]);
      const fallbackLeadSourceField = resolveFieldName(fallbackFields, [
        "Lead Source",
        "Source",
      ]);

      if (fallbackBusinessField) fallbackPayload[fallbackBusinessField] = businessName;
      if (fallbackPhoneField) fallbackPayload[fallbackPhoneField] = phone;
      if (fallbackTradeField) fallbackPayload[fallbackTradeField] = trade;
      if (fallbackLeadSourceField) fallbackPayload[fallbackLeadSourceField] = "Website Trial";

      const fallbackNotes = {
        name,
        businessName,
        phone,
        email,
        trade,
        website: normalizedWebsite || "",
        notes: notesParts.join("\n\n"),
        submittedAt,
      };

      if (fallbackNotesField) {
        fallbackPayload[fallbackNotesField] = JSON.stringify(fallbackNotes, null, 2);
      }

      if (!Object.keys(fallbackPayload).length) {
        throw new LeadApiError(
          "AIRTABLE_ERROR",
          "Businesses table has no writable lead fields configured.",
          502
        );
      }

      const recordId = await createRecord(fallbackTable.id, fallbackPayload);
      return NextResponse.json({ ok: true, id: recordId || crypto.randomUUID() }, { status: 200 });
    }

    const fallbackPayload = {
      Name: name,
      "Business Name": businessName,
      Phone: phone,
      Email: email,
      Trade: trade,
      "Company Website": normalizedWebsite || undefined,
      Notes: notesParts.join("\n\n") || undefined,
      Source: "website",
      "Submitted At": submittedAt,
      Status: "New",
    };

    const recordId = await createRecord(AIRTABLE_TABLE_LEADS, fallbackPayload);
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
