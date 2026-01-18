const Airtable = require("airtable");
const dotenv = require("dotenv");

dotenv.config();

const {
  AIRTABLE_ACCESS_TOKEN,
  AIRTABLE_BASE_ID
} = process.env;

if (!AIRTABLE_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
  console.error("❌ Missing AIRTABLE_ACCESS_TOKEN or AIRTABLE_BASE_ID");
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_ACCESS_TOKEN }).base(
  AIRTABLE_BASE_ID
);

async function ensureTable(tableName, fields) {
  try {
    await base(tableName).select({ maxRecords: 1 }).firstPage();
    console.log(`✔ Table exists: ${tableName}`);
  } catch (err) {
    console.log(`✖ Table missing: ${tableName}`);
    console.log("➡ Create via CSV import using headers below:\n");
    console.table(fields.map(f => ({
      field: f.name,
      type: f.type
    })));
  }
}

async function run() {
  await ensureTable("Businesses", [
    { name: "Business Name", type: "text" },
    { name: "Trade", type: "select" },
    { name: "City", type: "text" }
  ]);

  await ensureTable("On-Call Roster", [
    { name: "Name", type: "text" },
    { name: "Business", type: "link" },
    { name: "Phone", type: "phone" },
    { name: "Priority", type: "number" }
  ]);

  await ensureTable("Dispatch Events", [
    { name: "Call ID", type: "text" },
    { name: "Channel", type: "select" },
    { name: "Status", type: "select" },
    { name: "Sent At", type: "date" }
  ]);

  console.log("\n✅ Airtable schema check complete.");
}

run().catch(err => {
  console.error("❌ Script failed:", err);
});
