#!/usr/bin/env node
/**
 * Afterhours Airtable Base Creator
 * 
 * Creates "Afterhours — Ops & Dispatch" base with all required tables and fields.
 * 
 * Usage:
 *   AIRTABLE_ACCESS_TOKEN=your_token node create_afterhours_base.js
 *   AIRTABLE_ACCESS_TOKEN=your_token AIRTABLE_BASE_ID=existing_base_id node create_afterhours_base.js
 */

const BASE_NAME = "Afterhours — Ops & Dispatch";
const OUTPUT_FILE = "airtable_schema_output.json";

// Airtable API endpoints
const METADATA_API_BASE = "https://api.airtable.com/v0/meta/bases";
const BASE_API_BASE = "https://api.airtable.com/v0";

/**
 * Schema definitions for all tables
 */
const TABLE_SCHEMAS = {
  "Businesses": {
    fields: [
      { name: "Business Name", type: "singleLineText" },
      { 
        name: "Trade", 
        type: "singleSelect",
        options: {
          choices: [
            { name: "Plumbing" },
            { name: "HVAC" },
            { name: "Electrical" },
            { name: "Other" }
          ]
        }
      },
      { name: "City", type: "singleLineText" },
      { name: "State", type: "singleLineText" },
      {
        name: "Timezone",
        type: "singleSelect",
        options: {
          choices: [
            { name: "America/Los_Angeles" },
            { name: "America/Chicago" },
            { name: "America/New_York" },
            { name: "America/Denver" }
          ]
        }
      },
      { name: "Afterhours Active", type: "checkbox" },
      { name: "Primary Phone", type: "phoneNumber" },
      { name: "Emergency Keywords", type: "multilineText" },
      { name: "Notes", type: "multilineText" }
    ]
  },
  "On-Call Roster": {
    fields: [
      {
        name: "Business",
        type: "multipleRecordLinks",
        options: {
          linkedTableId: "Businesses" // Will be replaced with actual table ID
        }
      },
      { name: "Name", type: "singleLineText" },
      {
        name: "Role",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Owner" },
            { name: "Tech" },
            { name: "Dispatcher" }
          ]
        }
      },
      { name: "Phone", type: "phoneNumber" },
      { name: "Priority", type: "number", options: { precision: 0 } },
      { name: "Backup Contact", type: "checkbox" },
      { name: "Active", type: "checkbox" },
      { name: "Notes", type: "multilineText" }
    ]
  },
  "Calls": {
    fields: [
      { name: "Call ID", type: "singleLineText" },
      {
        name: "Business",
        type: "multipleRecordLinks",
        options: {
          linkedTableId: "Businesses"
        }
      },
      { name: "Call Timestamp", type: "dateTime", options: { timeZone: "UTC" } },
      { name: "Caller Phone", type: "phoneNumber" },
      { name: "City", type: "singleLineText" },
      {
        name: "Emergency Level",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Emergency" },
            { name: "Non-Emergency" },
            { name: "Unknown" }
          ]
        }
      },
      { name: "Issue Summary", type: "multilineText" },
      { name: "Agent Confidence", type: "number", options: { precision: 0 } },
      { name: "Transcript", type: "multilineText" },
      { name: "Dispatch Required", type: "checkbox" },
      {
        name: "Status",
        type: "singleSelect",
        options: {
          choices: [
            { name: "New" },
            { name: "Dispatched" },
            { name: "Failed" },
            { name: "Resolved" }
          ]
        }
      }
    ]
  },
  "Dispatch Events": {
    fields: [
      {
        name: "Call",
        type: "multipleRecordLinks",
        options: {
          linkedTableId: "Calls"
        }
      },
      {
        name: "Contact",
        type: "multipleRecordLinks",
        options: {
          linkedTableId: "On-Call Roster"
        }
      },
      {
        name: "Method",
        type: "singleSelect",
        options: {
          choices: [
            { name: "SMS" },
            { name: "Call" },
            { name: "Both" }
          ]
        }
      },
      { name: "Sent At", type: "dateTime", options: { timeZone: "UTC" } },
      {
        name: "Delivery Status",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Sent" },
            { name: "Failed" },
            { name: "Unknown" }
          ]
        }
      },
      { name: "Acknowledged", type: "checkbox" },
      { name: "Notes", type: "multilineText" }
    ]
  },
  "Issues / Bugs": {
    fields: [
      {
        name: "Related Call",
        type: "multipleRecordLinks",
        options: {
          linkedTableId: "Calls"
        }
      },
      {
        name: "Severity",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Low" },
            { name: "Medium" },
            { name: "High" },
            { name: "Critical" }
          ]
        }
      },
      { name: "Description", type: "multilineText" },
      { name: "Root Cause", type: "multilineText" },
      { name: "Fixed", type: "checkbox" },
      { name: "Fix Notes", type: "multilineText" }
    ]
  }
};

/**
 * Helper function to make API requests
 */
async function apiRequest(url, options = {}) {
  const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
  const debug = process.env.DEBUG === "1";
  
  if (!accessToken) {
    throw new Error("AIRTABLE_ACCESS_TOKEN environment variable is required");
  }

  const method = options.method || "GET";
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  if (debug) {
    console.log(`[DEBUG] ${method} ${url}`);
    if (options.body) {
      console.log(`[DEBUG] Body: ${typeof options.body === 'string' ? options.body : JSON.stringify(options.body)}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    if (debug) {
      const errorPreview = JSON.stringify(errorData).substring(0, 500);
      console.log(`[DEBUG] Error ${response.status}: ${errorPreview}`);
    }
    
    const error = new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const result = await response.json();
  
  if (debug) {
    console.log(`[DEBUG] ${method} ${url} => ${response.status}`);
    const resultPreview = JSON.stringify(result).substring(0, 200);
    console.log(`[DEBUG] Response: ${resultPreview}...`);
  }

  return result;
}

/**
 * List all bases to check if one with the name already exists
 */
async function listBases() {
  try {
    const response = await apiRequest(`${METADATA_API_BASE}`, {
      method: "GET"
    });
    return response.bases || [];
  } catch (error) {
    if (error.status === 403 || error.status === 401) {
      console.log("⚠ Cannot list bases (API limitation - this is normal)");
      return null;
    }
    throw error;
  }
}

/**
 * Validate base ID by attempting to get tables (Meta API doesn't have GET /bases/{id})
 */
async function validateBaseId(baseId) {
  try {
    // Test by getting tables - this endpoint works and validates the base exists
    await apiRequest(`${METADATA_API_BASE}/${baseId}/tables`, {
      method: "GET"
    });
    return true;
  } catch (error) {
    if (error.status === 404 || error.status === 403) {
      return false;
    }
    throw error;
  }
}

/**
 * Try to find existing base by name
 */
async function findBaseByName(baseName) {
  const bases = await listBases();
  if (!bases) return null;
  
  return bases.find(base => base.name === baseName) || null;
}

/**
 * Create a new base (may require Enterprise API - will fail gracefully)
 */
async function createBase(baseName, workspaceId = null) {
  try {
    const payload = { name: baseName };
    if (workspaceId) {
      payload.workspaceId = workspaceId;
    }

    const response = await apiRequest(`${METADATA_API_BASE}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return response;
  } catch (error) {
    if (error.status === 403 || error.status === 401) {
      throw new Error("Base creation requires Enterprise API access. Please use an existing base with AIRTABLE_BASE_ID.");
    }
    throw error;
  }
}

/**
 * Get all tables in a base (includes fields)
 */
async function getTables(baseId) {
  const response = await apiRequest(`${METADATA_API_BASE}/${baseId}/tables`, {
    method: "GET"
  });
  return response.tables || [];
}

/**
 * Get a single table with fields
 */
async function getTable(baseId, tableId) {
  const response = await apiRequest(`${METADATA_API_BASE}/${baseId}/tables/${tableId}`, {
    method: "GET"
  });
  return response;
}

/**
 * Find table by name
 */
function findTableByName(tables, tableName) {
  return tables.find(table => table.name === tableName) || null;
}

/**
 * Get primary field name for table (always singleLineText)
 */
function getPrimaryFieldName(tableName) {
  const primaryFieldMap = {
    "On-Call Roster": "Roster Entry",
    "Dispatch Events": "Event ID",
    "Issues / Bugs": "Issue ID"
  };
  
  return primaryFieldMap[tableName] || "Name";
}

/**
 * Create a table in a base with initial singleLineText field
 */
async function createTable(baseId, tableName, primaryFieldName, description = "") {
  // Always use singleLineText for primary field
  const apiPrimaryField = {
    name: primaryFieldName,
    type: "singleLineText"
  };

  const payload = {
    name: tableName,
    fields: [apiPrimaryField]
  };

  if (description) {
    payload.description = description;
  }

  const response = await apiRequest(`${METADATA_API_BASE}/${baseId}/tables`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response;
}

/**
 * Create a field in a table with proper options
 */
async function createField(baseId, tableId, fieldDefinition) {
  // Add options for checkbox fields
  if (fieldDefinition.type === "checkbox") {
    if (!fieldDefinition.options) {
      fieldDefinition.options = {};
    }
    fieldDefinition.options.icon = "check";
    fieldDefinition.options.color = "greenBright";
  }
  
  // Add options for dateTime fields
  if (fieldDefinition.type === "dateTime") {
    if (!fieldDefinition.options) {
      fieldDefinition.options = {};
    }
    // Set proper dateTime options
    fieldDefinition.options.dateFormat = { name: "local", format: "l" };
    fieldDefinition.options.timeFormat = { name: "12hour", format: "h:mma" };
    fieldDefinition.options.timeZone = "client";
  }
  
  const response = await apiRequest(
    `${METADATA_API_BASE}/${baseId}/tables/${tableId}/fields`,
    {
      method: "POST",
      body: JSON.stringify(fieldDefinition)
    }
  );
  return response;
}

/**
 * Resolve linked table IDs in field definitions
 */
function resolveLinkedTableIds(fieldDef, tableNameToIdMap) {
  if (fieldDef.type === "multipleRecordLinks" && fieldDef.options?.linkedTableId) {
    const linkedTableName = fieldDef.options.linkedTableId;
    const linkedTableId = tableNameToIdMap[linkedTableName];
    if (!linkedTableId) {
      throw new Error(`Cannot resolve linked table: ${linkedTableName}`);
    }
    return {
      ...fieldDef,
      options: {
        ...fieldDef.options,
        linkedTableId: linkedTableId
      }
    };
  }
  return fieldDef;
}

/**
 * Main execution function
 */
async function main() {
  console.log("=" .repeat(70));
  console.log("Afterhours Airtable Base Creator");
  console.log("=" .repeat(70));
  console.log();

  const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
  const existingBaseId = process.env.AIRTABLE_BASE_ID;
  const workspaceId = process.env.AIRTABLE_WORKSPACE_ID || null;

  if (!accessToken) {
    console.error("❌ ERROR: AIRTABLE_ACCESS_TOKEN environment variable is required");
    console.error("\nSet it with:");
    console.error("  export AIRTABLE_ACCESS_TOKEN=your_token_here");
    process.exit(1);
  }

  let baseId;
  let baseInfo;

  // Step 1: Get or create base
  console.log("Step 1: Finding or creating base...");
  
  if (existingBaseId) {
    console.log(`  Using existing base ID: ${existingBaseId}`);
    const isValid = await validateBaseId(existingBaseId);
    if (!isValid) {
      console.error(`❌ ERROR: Base with ID ${existingBaseId} not found or not accessible`);
      console.error(`   Verify the base ID and that your PAT has access to it.`);
      process.exit(1);
    }
    baseId = existingBaseId;
    baseInfo = { id: baseId, name: BASE_NAME }; // Use base name as fallback since we can't get it via API
    console.log(`  ✓ Base ID validated: ${baseId}`);
  } else {
    // Try to find existing base by name
    console.log(`  Checking for existing base: "${BASE_NAME}"...`);
    const existingBase = await findBaseByName(BASE_NAME);
    
    if (existingBase) {
      console.log(`  ✓ Found existing base: "${BASE_NAME}" (${existingBase.id})`);
      baseId = existingBase.id;
      baseInfo = existingBase;
    } else {
      console.log(`  Creating new base: "${BASE_NAME}"...`);
      try {
        baseInfo = await createBase(BASE_NAME, workspaceId);
        baseId = baseInfo.id;
        console.log(`  ✓ Created base: "${BASE_NAME}" (${baseId})`);
      } catch (error) {
        console.error(`  ❌ Failed to create base: ${error.message}`);
        console.error("\n💡 SOLUTION: Use an existing base ID");
        console.error("  1. Create a base manually in Airtable");
        console.error("  2. Get the Base ID from the URL: https://airtable.com/appXXXXXXXXXXXXXX");
        console.error("  3. Run: AIRTABLE_ACCESS_TOKEN=your_token AIRTABLE_BASE_ID=appXXXXX node create_afterhours_base.js");
        process.exit(1);
      }
    }
  }

  console.log();

  // Step 2: Get existing tables
  console.log("Step 2: Checking existing tables...");
  const existingTables = await getTables(baseId);
  const tableNameToIdMap = {};
  existingTables.forEach(table => {
    tableNameToIdMap[table.name] = table.id;
  });
  console.log(`  Found ${existingTables.length} existing table(s)`);
  console.log();

  // Step 3: Create tables and fields
  console.log("Step 3: Creating tables and fields...");
  const tableOrder = ["Businesses", "On-Call Roster", "Calls", "Dispatch Events", "Issues / Bugs"];
  const createdTables = [];
  let tableCreateFailures = 0;
  let fieldCreateFailures = 0;

  for (const tableName of tableOrder) {
    const schema = TABLE_SCHEMAS[tableName];
    if (!schema) {
      console.log(`  ⚠ Skipping unknown table: ${tableName}`);
      continue;
    }

    console.log(`  Processing table: "${tableName}"...`);
    
    // Check if table exists
    let table = findTableByName(existingTables, tableName);
    let primaryFieldName = null;
    
    if (!table) {
      // Always use singleLineText primary field (never use linked-record fields)
      const primaryFieldNameForTable = getPrimaryFieldName(tableName);
      try {
        table = await createTable(baseId, tableName, primaryFieldNameForTable);
        primaryFieldName = primaryFieldNameForTable;
        console.log(`    ✓ Created table: "${tableName}" (${table.id}) with primary field "${primaryFieldNameForTable}"`);
      } catch (error) {
        console.error(`    ❌ Failed to create table: ${error.message}`);
        tableCreateFailures++;
        continue;
      }
    } else {
      console.log(`    ✓ Table already exists: "${tableName}" (${table.id})`);
    }

    tableNameToIdMap[tableName] = table.id;
    
    // Get full table info with fields (if table was just created, fetch details)
    let tableWithFields = table;
    if (!table.fields || table.fields.length === 0) {
      try {
        tableWithFields = await getTable(baseId, table.id);
      } catch (error) {
        console.log(`      ⚠ Could not fetch table details, continuing...`);
        tableWithFields = table;
      }
    }
    
    const tableData = {
      name: tableName,
      id: table.id,
      fields: []
    };

    // Get existing fields
    const existingFields = tableWithFields.fields || [];
    const existingFieldNames = new Set(existingFields.map(f => f.name));

    // Create remaining fields (skip primary field if it was just created)
    for (const fieldDef of schema.fields) {
      // Skip primary field if it was just created with the table (will be added after loop)
      if (primaryFieldName && fieldDef.name === primaryFieldName) {
        continue;
      }

      if (existingFieldNames.has(fieldDef.name)) {
        console.log(`      ⏭ Field already exists: "${fieldDef.name}"`);
        const existingField = existingFields.find(f => f.name === fieldDef.name);
        tableData.fields.push({
          name: existingField.name,
          id: existingField.id,
          type: existingField.type,
          options: existingField.options
        });
        continue;
      }

      try {
        // Resolve linked table IDs
        const resolvedFieldDef = resolveLinkedTableIds(fieldDef, tableNameToIdMap);
        
        // Build field definition for API
        const apiFieldDef = {
          name: resolvedFieldDef.name,
          type: resolvedFieldDef.type
        };

        if (resolvedFieldDef.options) {
          apiFieldDef.options = resolvedFieldDef.options;
        }

        const createdField = await createField(baseId, table.id, apiFieldDef);
        console.log(`      ✓ Created field: "${fieldDef.name}" (${createdField.id})`);
        
        tableData.fields.push({
          name: createdField.name,
          id: createdField.id,
          type: createdField.type,
          options: createdField.options
        });
      } catch (error) {
        console.error(`      ❌ Failed to create field "${fieldDef.name}": ${error.message}`);
        if (error.data) {
          console.error(`         Details: ${JSON.stringify(error.data, null, 2)}`);
        }
        fieldCreateFailures++;
      }
    }

    // Add primary field to tableData if it was created with the table
    if (primaryFieldName) {
      const primaryField = existingFields.find(f => f.name === primaryFieldName);
      if (primaryField) {
        // Insert at beginning to match schema order
        tableData.fields.unshift({
          name: primaryField.name,
          id: primaryField.id,
          type: primaryField.type,
          options: primaryField.options
        });
      }
    }

    createdTables.push(tableData);
  }

  console.log();

  // Step 4: Print summary and check for failures
  if (tableCreateFailures > 0) {
    console.log("=" .repeat(70));
    console.log(`❌ FAILED: ${tableCreateFailures} table(s) not created`);
    if (fieldCreateFailures > 0) {
      console.log(`   ${fieldCreateFailures} field(s) failed to create`);
    }
    console.log("=" .repeat(70));
    process.exit(1);
  }

  console.log("=" .repeat(70));
  console.log("✓ SUCCESS: Base setup complete!");
  if (fieldCreateFailures > 0) {
    console.log(`   Note: ${fieldCreateFailures} field(s) failed to create (but tables were created)`);
  }
  console.log("=" .repeat(70));
  console.log();
  console.log("Base Information:");
  console.log(`  Base ID: ${baseId}`);
  console.log(`  Base Name: "${baseInfo.name}"`);
  console.log(`  Base URL: https://airtable.com/${baseId}`);
  console.log();
  console.log("Tables Created/Updated:");
  
  const summary = {
    baseId: baseId,
    baseName: baseInfo.name,
    tables: createdTables
  };

  createdTables.forEach(table => {
    console.log(`  • ${table.name} (${table.id})`);
    console.log(`    Fields: ${table.fields.length}`);
    table.fields.forEach(field => {
      console.log(`      - ${field.name} (${field.id}) [${field.type}]`);
    });
  });

  console.log();

  // Step 5: Save output JSON
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(process.cwd(), OUTPUT_FILE);
  
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`✓ Schema saved to: ${outputPath}`);
  console.log();

  return 0;
}

// Run main function
main().catch(error => {
  console.error();
  console.error("=" .repeat(70));
  console.error("❌ ERROR: Script failed");
  console.error("=" .repeat(70));
  console.error(`Error: ${error.message}`);
  if (error.stack) {
    console.error();
    console.error("Stack trace:");
    console.error(error.stack);
  }
  process.exit(1);
});
