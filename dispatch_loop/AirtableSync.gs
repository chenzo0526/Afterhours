/**
 * AirtableSync.gs - Syncs QUEUE sheet to Airtable Businesses table
 * 
 * Logic:
 * - Syncs from QUEUE to Airtable Businesses
 * - Maps: Company->Business Name, Trade->Trade, City->City, State->State, Notes->Notes, Afterhours Active=false
 * - Uses AirtableStatus column to track sync status
 * - Sets AirtableStatus="SYNCED" on success
 * - Should run every 15 minutes (time-based trigger)
 */

/**
 * Main function to sync QUEUE to Airtable
 * Should be triggered every 15 minutes
 */
function syncToAirtable() {
  log('Starting syncToAirtable()', 'INFO');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QUEUE');
    if (!sheet) {
      throw new Error('QUEUE sheet not found');
    }
    
    // Ensure AirtableStatus column exists
    ensureColumn(sheet, 'AirtableStatus');
    
    const headerMap = getHeaderMap();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      log('No data rows to sync', 'INFO');
      return;
    }
    
    const token = getAirtableToken();
    const baseId = CONFIG.AIRTABLE_BASE_ID;
    const tableName = CONFIG.AIRTABLE_TABLE;
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process rows from 2 to lastRow
    for (let row = 2; row <= lastRow; row++) {
      try {
        const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
        const airtableStatus = safeGet(rowRange, headerMap, 'AirtableStatus');
        
        // Skip if already synced
        if (airtableStatus === 'SYNCED') {
          skippedCount++;
          continue;
        }
        
        // Get row data
        const company = safeGet(rowRange, headerMap, 'Company');
        const trade = safeGet(rowRange, headerMap, 'Trade');
        const city = safeGet(rowRange, headerMap, 'City');
        const state = safeGet(rowRange, headerMap, 'State');
        const notes = safeGet(rowRange, headerMap, 'Notes');
        
        // Skip if no company name
        if (!company || company.trim() === '') {
          skippedCount++;
          continue;
        }
        
        // Prepare Airtable record
        const record = {
          fields: {
            'Business Name': company,
            'Trade': trade || '',
            'City': city || '',
            'State': state || '',
            'Notes': notes || '',
            'Afterhours Active': false
          }
        };
        
        // Check if record already exists in Airtable
        const existingRecordId = findExistingRecord(token, baseId, tableName, company);
        
        let success = false;
        if (existingRecordId) {
          // Update existing record
          success = updateAirtableRecord(token, baseId, tableName, existingRecordId, record);
          log(`Row ${row}: Updated Airtable record for ${company}`, 'INFO');
        } else {
          // Create new record
          success = createAirtableRecord(token, baseId, tableName, record);
          log(`Row ${row}: Created Airtable record for ${company}`, 'INFO');
        }
        
        if (success) {
          safeSet(sheet, row, headerMap, 'AirtableStatus', 'SYNCED');
          syncedCount++;
        } else {
          errorCount++;
        }
        
        // Rate limiting: wait 200ms between API calls
        Utilities.sleep(200);
        
      } catch (error) {
        errorCount++;
        log(`Row ${row}: Error - ${error.toString()}`, 'ERROR');
      }
    }
    
    log(`syncToAirtable() complete: ${syncedCount} synced, ${skippedCount} skipped, ${errorCount} errors`, 'INFO');
    
  } catch (error) {
    log(`Fatal error in syncToAirtable(): ${error.toString()}`, 'ERROR');
    throw error;
  }
}

/**
 * Find existing Airtable record by Business Name
 * @param {string} token - Airtable access token
 * @param {string} baseId - Airtable base ID
 * @param {string} tableName - Airtable table name
 * @param {string} businessName - Business name to search for
 * @return {string|null} Record ID or null
 */
function findExistingRecord(token, baseId, tableName, businessName) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    const params = {
      filterByFormula: `{Business Name} = "${businessName.replace(/"/g, '\\"')}"`,
      maxRecords: 1
    };
    
    const queryString = Object.keys(params).map(key => 
      `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    ).join('&');
    
    const response = UrlFetchApp.fetch(`${url}?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.getResponseCode() !== 200) {
      log(`Airtable API error: ${response.getResponseCode()}`, 'ERROR');
      return null;
    }
    
    const data = JSON.parse(response.getContentText());
    if (data.records && data.records.length > 0) {
      return data.records[0].id;
    }
    
    return null;
  } catch (error) {
    log(`Error finding existing record: ${error.toString()}`, 'ERROR');
    return null;
  }
}

/**
 * Create new Airtable record
 * @param {string} token - Airtable access token
 * @param {string} baseId - Airtable base ID
 * @param {string} tableName - Airtable table name
 * @param {Object} record - Record object with fields
 * @return {boolean} True if successful
 */
function createAirtableRecord(token, baseId, tableName, record) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ records: [record] })
    });
    
    if (response.getResponseCode() === 200) {
      return true;
    } else {
      log(`Airtable create error: ${response.getResponseCode()} - ${response.getContentText()}`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`Error creating Airtable record: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Update existing Airtable record
 * @param {string} token - Airtable access token
 * @param {string} baseId - Airtable base ID
 * @param {string} tableName - Airtable table name
 * @param {string} recordId - Record ID to update
 * @param {Object} record - Record object with fields
 * @return {boolean} True if successful
 */
function updateAirtableRecord(token, baseId, tableName, recordId, record) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ fields: record.fields })
    });
    
    if (response.getResponseCode() === 200) {
      return true;
    } else {
      log(`Airtable update error: ${response.getResponseCode()} - ${response.getContentText()}`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`Error updating Airtable record: ${error.toString()}`, 'ERROR');
    return false;
  }
}

/**
 * Manual sync function (for testing)
 */
function manualSyncToAirtable() {
  syncToAirtable();
  SpreadsheetApp.getUi().alert('Airtable sync completed. Check LOG sheet for details.');
}
