import process from "node:process";

// Run: AIRTABLE_ACCESS_TOKEN=... AIRTABLE_BASE_ID=... node tools/airtable/ensure_leads_table.mjs
const { AIRTABLE_ACCESS_TOKEN, AIRTABLE_BASE_ID } = process.env;
const AIRTABLE_TABLE_LEADS = process.env.AIRTABLE_TABLE_LEADS || "Leads";
const AIRTABLE_META_BASE = "https://api.airtable.com/v0/meta";

function requireEnv() {
  if (!AIRTABLE_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    console.error(
      "Missing env vars. Set AIRTABLE_ACCESS_TOKEN and AIRTABLE_BASE_ID before running."
    );
    process.exit(1);
  }
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
  return tables.find((table) => table.name === AIRTABLE_TABLE_LEADS);
}

function buildLeadFieldSchema() {
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
        choices: [
          { name: "New" },
          { name: "Contacted" },
          { name: "Qualified" },
          { name: "Disqualified" },
        ],
      },
    },
    { name: "Created At", type: "createdTime" },
  ];
}

async function createLeadTable() {
  const payload = {
    name: AIRTABLE_TABLE_LEADS,
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

async function createField(tableId, field) {
  return fetchJson(
    `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields`,
    {
      method: "POST",
      body: JSON.stringify(field),
    }
  );
}

async function ensureLeadFields(leadTable) {
  const existing = new Set((leadTable.fields || []).map((field) => field.name));
  const missing = buildLeadFieldSchema().filter(
    (field) => !existing.has(field.name)
  );

  if (!missing.length) {
    return;
  }

  for (const field of missing) {
    await createField(leadTable.id, field);
  }
}

async function main() {
  requireEnv();

  let tables = await loadSchema();
  let leadTable = findLeadTable(tables);

  if (leadTable) {
    await ensureLeadFields(leadTable);
    const refreshed = (await loadSchema()).find((table) => table.id === leadTable.id);
    console.log(JSON.stringify(summarizeTable(refreshed || leadTable), null, 2));
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
      `Create a table named "${AIRTABLE_TABLE_LEADS}" with fields: Name, Email, Phone, Company, Role, Website, Source, Status, Created At.`
    );
    console.error(err?.message || err);
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
