import process from "node:process";

const { AIRTABLE_ACCESS_TOKEN, AIRTABLE_BASE_ID } = process.env;
const AIRTABLE_META_BASE = "https://api.airtable.com/v0/meta";
const LEAD_TABLE_CANDIDATES = [
  "Leads",
  "Trial Leads",
  "Live Trial Leads",
  "Start Live Trial",
];

function requireEnv() {
  if (!AIRTABLE_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    console.error(
      "Missing env vars. Set AIRTABLE_ACCESS_TOKEN and AIRTABLE_BASE_ID before running."
    );
    process.exit(1);
  }
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function fetchJson(url, options = {}) {
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

  return response.json();
}

function summarizeTable(table) {
  const fieldMap = {};
  for (const field of table.fields || []) {
    fieldMap[field.name] = { id: field.id, type: field.type };
  }

  return {
    leadTableId: table.id,
    leadTableName: table.name,
    fieldMap,
  };
}

async function loadSchema() {
  const data = await fetchJson(
    `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`
  );
  return data?.tables || [];
}

function findLeadTable(tables) {
  const candidateSet = new Set(LEAD_TABLE_CANDIDATES.map(normalize));
  return tables.find((table) => candidateSet.has(normalize(table.name)));
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

async function createLeadTable() {
  const payload = {
    name: "Leads",
    fields: buildLeadFieldSchema(),
  };

  const data = await fetchJson(
    `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return data;
}

async function main() {
  requireEnv();

  let tables = await loadSchema();
  let leadTable = findLeadTable(tables);

  if (leadTable) {
    console.log(JSON.stringify(summarizeTable(leadTable), null, 2));
    return;
  }

  try {
    const created = await createLeadTable();
    const createdTable = created?.id ? created : created?.table || created?.tables?.[0];
    if (createdTable?.id) {
      console.log(JSON.stringify(summarizeTable(createdTable), null, 2));
      return;
    }
    throw new Error("Table creation response did not include a table.");
  } catch (err) {
    console.error("Lead table not found and could not be created.");
    console.error(
      "Create a table named \"Leads\" with fields: Name, Business Name, Phone, Email, Trade, Company Website, Notes, Source, Submitted At, Status."
    );
    console.error(
      "Until then, configure the Businesses table with a long text field named \"Inbound Trial Lead JSON\" for fallback capture."
    );
    console.error(err?.message || err);
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
