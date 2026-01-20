import process from "node:process";

const { AIRTABLE_ACCESS_TOKEN, AIRTABLE_BASE_ID } = process.env;
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

async function main() {
  requireEnv();

  const data = await fetchJson(
    `${AIRTABLE_META_BASE}/bases/${AIRTABLE_BASE_ID}/tables`
  );

  const tables = (data?.tables || []).map((table) => ({
    id: table.id,
    name: table.name,
    fields: (table.fields || []).map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
    })),
  }));

  const output = { tables };
  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
