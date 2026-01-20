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
const AIRTABLE_META_BASE = "https://api.airtable.com/v0/meta";
const AIRTABLE_DATA_BASE = "https://api.airtable.com/v0";

const LEAD_TABLE_CANDIDATES = [
  "Leads",
  "Trial Leads",
  "Live Trial Leads",
  "Start Live Trial",
];
const FALLBACK_TABLE_NAME = "Businesses";
const FALLBACK_FIELD_NAME = "Inbound Trial Lead JSON";
const CACHE_TTL_MS = 5 * 60 * 1000;

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
    throw new Error("Missing AIRTABLE_ACCESS_TOKEN");
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
    throw new Error(
      `Airtable API request failed (${response.status}): ${text || "No response body"}`
    );
  }

  return (await response.json()) as T;
}

async function loadTables() {
  if (cachedTables && Date.now() - cachedTables.fetchedAt < CACHE_TTL_MS) {
    return cachedTables.tables;
  }

  if (!AIRTABLE_BASE_ID) {
    throw new Error("Missing AIRTABLE_BASE_ID");
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

function buildLeadFieldSchema() {
  return [
    { name: "Name", type: "singleLineText" },
    { name: "Business Name", type: "singleLineText" },
    { name: "Phone", type: "phoneNumber" },
    { name: "Email", type: "email" },
    { name: "Trade", type: "singleLineText" },
    { name: "Company Website", type: "url" },
    { name: "Notes", type: "multilineText" },
    { name: "Source", type: "singleLineText" },
    { name: "Submitted At", type: "dateTime" },
    {
      name: "Status",
      type: "singleSelect",
      options: {
        choices: [
          { name: "New" },
          { name: "Contacted" },
          { name: "Trial Started" },
          { name: "Closed" },
        ],
      },
    },
  ];
}

async function ensureLeadTable(tables: AirtableTable[]) {
  const existing = findTableByName(tables, LEAD_TABLE_CANDIDATES);
  if (existing) return existing;

  try {
    const created = await fetchJson<AirtableTable>(
      `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`,
      {
        method: "POST",
        body: JSON.stringify({
          name: "Leads",
          fields: buildLeadFieldSchema(),
        }),
      }
    );
    return created;
  } catch (err) {
    console.log("[lead] Lead table not found and could not be created.");
    return null;
  }
}

async function createRecord(tableId: string, fields: Record<string, unknown>) {
  const url = `${AIRTABLE_DATA_BASE}/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    tableId
  )}`;
  await fetchJson(url, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }] }),
  });
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

    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!businessName) missing.push("business_name");
    if (!phone) missing.push("phone");
    if (!email) missing.push("email");
    if (!trade) missing.push("trade");

    if (missing.length) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (!AIRTABLE_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { ok: false, error: "Airtable is not configured" },
        { status: 500 }
      );
    }

    const tables = await loadTables();
    const leadTable = await ensureLeadTable(tables);

    const submittedAt = new Date().toISOString();
    const notesParts = [];
    if (notes) notesParts.push(notes);
    if (statusHint) notesParts.push(`Start status: ${statusHint}`);

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
      if (websiteField && website) payload[websiteField] = website;
      if (notesField && notesParts.length) payload[notesField] = notesParts.join("\n\n");
      if (sourceField) payload[sourceField] = "website";
      if (submittedField) payload[submittedField] = submittedAt;
      if (statusField) payload[statusField] = "New";

      await createRecord(leadTable.id, payload);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const fallbackTable = findTableByName(tables, [FALLBACK_TABLE_NAME]);
    if (!fallbackTable) {
      throw new Error("No lead table found and fallback Businesses table missing.");
    }

    const fallbackField = resolveFieldName(fallbackTable.fields || [], [FALLBACK_FIELD_NAME]);
    if (!fallbackField) {
      throw new Error(
        'Fallback field "Inbound Trial Lead JSON" missing on Businesses table.'
      );
    }

    const fallbackPayload = {
      name,
      businessName,
      phone,
      email,
      trade,
      website,
      notes: notesParts.join("\n\n") || undefined,
      source: "website",
      submittedAt,
    };

    await createRecord(fallbackTable.id, {
      [fallbackField]: JSON.stringify(fallbackPayload, null, 2),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Request failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
