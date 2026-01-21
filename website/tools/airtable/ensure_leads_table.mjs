import fetch from "node-fetch";

const AIRTABLE_API_KEY = process.env.AIRTABLE_ACCESS_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !BASE_ID) {
  console.error("Missing AIRTABLE_ACCESS_TOKEN or AIRTABLE_BASE_ID");
  process.exit(1);
}

const API_BASE = `https://api.airtable.com/v0/meta/bases/${BASE_ID}`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

async function getTables() {
  const res = await fetch(`${API_BASE}/tables`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createLeadsTable() {
  const body = {
    name: "Leads",
    fields: [
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
        options: { choices: [{ name: "New" }, { name: "Contacted" }, { name: "Qualified" }, { name: "Disqualified" }] },
      },
      { name: "Created At", type: "singleLineText" },
    ],
  };
  const res = await fetch(`${API_BASE}/tables`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
}

async function main() {
  const data = await getTables();
  if (data.tables.find(t => t.name === "Leads")) return;
  await createLeadsTable();
}

main().catch(e => { console.error(e); process.exit(1); });
