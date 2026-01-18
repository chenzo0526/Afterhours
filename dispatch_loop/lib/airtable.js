// lib/airtable.js (CommonJS)
const Airtable = require("airtable");

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_BUSINESSES = "Businesses",
  AIRTABLE_TABLE_CALLS = "Calls",
  AIRTABLE_TABLE_DISPATCH_EVENTS = "Dispatch Events",
  AIRTABLE_TABLE_ONCALL = "On-Call Roster",
} = process.env;

// ========= Dispatch Events field names (match Airtable column names) =========
const EVENT_EVENT_ID = "Event ID";
const EVENT_CALL_ID = "Call Id"; // matches your screenshot
const EVENT_MESSAGE_SID = "Message SID";
const EVENT_METHOD = "Method";
const EVENT_SENT_AT = "Sent At";
const EVENT_DELIVERY_STATUS = "Delivery Status";
const EVENT_ACKNOWLEDGED = "Acknowledged";
const EVENT_NOTES = "Notes";
const EVENT_DELIVERY_ERROR_CODE = "Delivery Error Code";
const EVENT_CREATE_AT = "Create At";

// Candidates we *want* to use if present
const DISPATCH_EVENT_CANDIDATES = [
  EVENT_EVENT_ID,
  EVENT_CALL_ID,
  EVENT_MESSAGE_SID,
  EVENT_METHOD,
  EVENT_SENT_AT,
  EVENT_DELIVERY_STATUS,
  EVENT_ACKNOWLEDGED,
  EVENT_NOTES,
  EVENT_DELIVERY_ERROR_CODE,
  // Create At is created-time and not writable; do not probe it
];

let base;
let tableFieldCache = {
  [AIRTABLE_TABLE_DISPATCH_EVENTS]: [],
  [AIRTABLE_TABLE_BUSINESSES]: [],
  [AIRTABLE_TABLE_CALLS]: [],
  [AIRTABLE_TABLE_ONCALL]: [],
};

function maskId(id) {
  if (!id || id.length < 10) return id || "";
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function getBase() {
  if (!AIRTABLE_API_KEY) throw new Error("Missing AIRTABLE_API_KEY in .env");
  if (!AIRTABLE_BASE_ID) throw new Error("Missing AIRTABLE_BASE_ID in .env");

  if (!base) {
    Airtable.configure({ apiKey: AIRTABLE_API_KEY });
    base = Airtable.base(AIRTABLE_BASE_ID);
  }
  return base;
}

// Create + delete a probe record to verify field exists and is writable
async function probeWritableFields(tableName, candidateFields) {
  const b = getBase();
  const t = b(tableName);

  const found = [];
  let probeRecordId = null;

  for (const f of candidateFields) {
    try {
      // Create a record using ONLY this field
      const created = await t.create([{ fields: { [f]: "__probe__" } }]);
      probeRecordId = created && created[0] && created[0].id;

      found.push(f);

      // Delete the probe record immediately
      if (probeRecordId) {
        await t.destroy([probeRecordId]);
      }
      probeRecordId = null;
    } catch (err) {
      // Field doesn't exist or isn't writable (or validation failed) — ignore and continue
      try {
        if (probeRecordId) await t.destroy([probeRecordId]);
      } catch (_) {}
      probeRecordId = null;
      continue;
    }
  }

  return found;
}

async function initializeTableFields() {
  getBase(); // validates env + creates base

  const dispatchWritable = await probeWritableFields(
    AIRTABLE_TABLE_DISPATCH_EVENTS,
    DISPATCH_EVENT_CANDIDATES
  );

  tableFieldCache[AIRTABLE_TABLE_DISPATCH_EVENTS] = dispatchWritable;

  console.log(
    `[Startup] Airtable base: ${maskId(AIRTABLE_BASE_ID)} | Tables: Businesses="${AIRTABLE_TABLE_BUSINESSES}", Calls="${AIRTABLE_TABLE_CALLS}", Dispatch Events="${AIRTABLE_TABLE_DISPATCH_EVENTS}", On-Call Roster="${AIRTABLE_TABLE_ONCALL}"`
  );
  console.log(
    `[Airtable] Dispatch Events writable fields detected (probe):`,
    dispatchWritable.length ? dispatchWritable : ["<none>"]
  );
}

// Helper: returns only fields that are actually writable in this base/table
function filterToWritable(tableName, payload) {
  const allowed = new Set(tableFieldCache[tableName] || []);
  const out = {};
  for (const k of Object.keys(payload || {})) {
    const v = payload[k];
    if (allowed.has(k) && v !== undefined) out[k] = v;
  }
  return out;
}

async function createDispatchEvent(fields) {
  const b = getBase();
  const tableName = AIRTABLE_TABLE_DISPATCH_EVENTS;

  const writable = tableFieldCache[tableName] || [];
  if (!writable.length) {
    console.log(
      `[Airtable] Dispatch Events has no writable fields (probe found none) — skipping create`
    );
    return null;
  }

  const payload = filterToWritable(tableName, fields);

  if (!Object.keys(payload).length) {
    console.log(`[Airtable] No writable fields present in payload — skipping create`);
    return null;
  }

  try {
    const created = await b(tableName).create([{ fields: payload }]);
    console.log(`[Airtable] Dispatch Event created`);
    return (created && created[0]) || null;
  } catch (err) {
    console.log(`[Airtable] Dispatch Event create FAILED`);
    console.log(`message:`, err && err.message);
    console.log(`statusCode:`, err && err.statusCode);
    console.log(`error:`, err && err.error);
    console.log(`type:`, err && err.type);
    console.log(`rawError:`, err);
    throw err;
  }
}

async function updateDispatchEventByMessageSid(messageSid, fields) {
  const b = getBase();
  const tableName = AIRTABLE_TABLE_DISPATCH_EVENTS;

  const writable = tableFieldCache[tableName] || [];
  if (!writable.length) return null;

  const payload = filterToWritable(tableName, fields);
  if (!Object.keys(payload).length) return null;

  // Only try if Message SID is writable/existent
  if (!new Set(writable).has(EVENT_MESSAGE_SID)) return null;

  const table = b(tableName);
  const records = await table
    .select({
      maxRecords: 1,
      filterByFormula: `{${EVENT_MESSAGE_SID}} = "${messageSid}"`,
    })
    .firstPage();

  if (!records || !records.length) return null;

  await table.update([{ id: records[0].id, fields: payload }]);
  console.log(`[Airtable] Dispatch Event updated by Message SID`);
  return true;
}

module.exports = {
  // init
  initializeTableFields,

  // ops
  createDispatchEvent,
  updateDispatchEventByMessageSid,

  // export constants if other files use them
  EVENT_EVENT_ID,
  EVENT_CALL_ID,
  EVENT_MESSAGE_SID,
  EVENT_METHOD,
  EVENT_SENT_AT,
  EVENT_DELIVERY_STATUS,
  EVENT_ACKNOWLEDGED,
  EVENT_NOTES,
  EVENT_DELIVERY_ERROR_CODE,
  EVENT_CREATE_AT,
};
