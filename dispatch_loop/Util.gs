/**
 * Util.gs - Shared utilities for Afterhours QUEUE automation
 * 
 * Provides:
 * - Header mapping for QUEUE sheet
 * - Safe get/set operations
 * - Logging utilities
 */

// Configuration constants
const CONFIG = {
  SHEET_NAME: 'QUEUE',
  AIRTABLE_BASE_ID: 'appMJsHP71wkLODeW',
  AIRTABLE_TABLE: 'Businesses',
  GMAIL_LABEL: 'AFTERHOURS_INBOUND',
  AFTERHOURS_DEMO_NUMBER: '+1XXXXXXXXXX',
  SENDER_NAME: 'Vince'
};

/**
 * Get header map for QUEUE sheet
 * Returns object mapping header names to column indices (1-based)
 */
function getHeaderMap() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerMap = {};
  
  headers.forEach((header, index) => {
    if (header && header.toString().trim()) {
      headerMap[header.toString().trim()] = index + 1;
    }
  });
  
  return headerMap;
}

/**
 * Safe get cell value by header name
 * @param {Range} rowRange - Range object for the row
 * @param {Object} headerMap - Header map from getHeaderMap()
 * @param {string} headerName - Name of the header column
 * @return {string} Cell value or empty string
 */
function safeGet(rowRange, headerMap, headerName) {
  const colIndex = headerMap[headerName];
  if (!colIndex) {
    return '';
  }
  const values = rowRange.getValues()[0];
  const value = values[colIndex - 1];
  return value ? value.toString().trim() : '';
}

/**
 * Safe set cell value by header name
 * @param {Sheet} sheet - Sheet object
 * @param {number} rowNum - Row number (1-based)
 * @param {Object} headerMap - Header map from getHeaderMap()
 * @param {string} headerName - Name of the header column
 * @param {*} value - Value to set
 */
function safeSet(sheet, rowNum, headerMap, headerName, value) {
  const colIndex = headerMap[headerName];
  if (!colIndex) {
    // Try to create column if it doesn't exist
    const lastCol = sheet.getLastColumn();
    sheet.getRange(1, lastCol + 1).setValue(headerName);
    const newColIndex = lastCol + 1;
    sheet.getRange(rowNum, newColIndex).setValue(value);
    return;
  }
  sheet.getRange(rowNum, colIndex).setValue(value);
}

/**
 * Ensure column exists, create if missing
 * @param {Sheet} sheet - Sheet object
 * @param {string} headerName - Name of the header column
 * @return {number} Column index (1-based)
 */
function ensureColumn(sheet, headerName) {
  const headerMap = getHeaderMap();
  if (headerMap[headerName]) {
    return headerMap[headerName];
  }
  
  // Create column
  const lastCol = sheet.getLastColumn();
  sheet.getRange(1, lastCol + 1).setValue(headerName);
  return lastCol + 1;
}

/**
 * Log message to script execution log
 * @param {string} message - Message to log
 * @param {string} level - Log level (INFO, WARN, ERROR)
 */
function log(message, level) {
  level = level || 'INFO';
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Optionally write to a LOG sheet if it exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('LOG');
    if (!logSheet) {
      logSheet = ss.insertSheet('LOG');
      logSheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Level', 'Message']]);
    }
    logSheet.appendRow([timestamp, level, message]);
  } catch (e) {
    // Ignore logging errors
  }
}

/**
 * Get Airtable access token from Script Properties
 * @return {string} Access token
 */
function getAirtableToken() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('AIRTABLE_ACCESS_TOKEN');
  if (!token) {
    throw new Error('AIRTABLE_ACCESS_TOKEN not found in Script Properties');
  }
  return token;
}

/**
 * Format date for Airtable (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @return {string} Formatted date string
 */
function formatDateForAirtable(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
