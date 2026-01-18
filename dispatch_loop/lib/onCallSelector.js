const { getOnCallRoster, FIELDS } = require('./airtable');

/**
 * On-call selection logic
 * Selects the appropriate on-call person based on:
 * - Business ID
 * - Trade type
 * - Current time
 * - Roster entries with schedule windows and priority
 */
async function selectOnCallPerson(businessId, trade = null, now = new Date()) {
  try {
    // Get available roster entries (already sorted by Priority in getOnCallRoster)
    const roster = await getOnCallRoster(businessId, trade, now);
    
    if (roster.length === 0) {
      // No roster entries found - return empty result (dispatch will handle UNASSIGNED status)
      return {
        contactId: null,
        contact: null,
        phone: null,
        name: null,
        method: 'FALLBACK',
        reason: 'No on-call roster entries found',
      };
    }
    
    // Roster is already sorted by Priority (ascending, 1 = highest)
    // Select first entry (highest priority)
    const selected = roster[0];
    
    // Use .get() method for consistency (works with Airtable records)
    const phone = selected.get(FIELDS.ROSTER_PHONE) || selected.get('Phone') || null;
    const name = selected.get(FIELDS.ROSTER_NAME) || selected.get('Name') || 'Unknown';
    const role = selected.get(FIELDS.ROSTER_ROLE) || selected.get('Role') || null;
    const priority = selected.get(FIELDS.ROSTER_PRIORITY) || selected.get('Priority') || 999;
    
    return {
      contactId: selected.id,
      contact: selected,
      phone: phone,
      name: name,
      role: role,
      priority: priority,
      method: 'ROSTER',
      reason: 'Selected from on-call roster',
    };
  } catch (error) {
    console.error('[OnCallSelector] Error selecting on-call person:', error);
    return {
      contactId: null,
      contact: null,
      phone: null,
      name: null,
      method: 'ERROR',
      reason: error.message,
    };
  }
}

/**
 * Get backup contacts (for escalation)
 */
async function getBackupContacts(businessId, trade = null, excludeContactId = null, now = new Date()) {
  try {
    const roster = await getOnCallRoster(businessId, trade, now);
    
    // Filter out excluded contact (roster already sorted by Priority)
    const available = roster.filter(entry => entry.id !== excludeContactId);
    
    return available.map(entry => {
      // Use .get() method for consistency
      const phone = entry.get(FIELDS.ROSTER_PHONE) || entry.get('Phone') || null;
      const name = entry.get(FIELDS.ROSTER_NAME) || entry.get('Name') || 'Unknown';
      const priority = entry.get(FIELDS.ROSTER_PRIORITY) || entry.get('Priority') || 999;
      
      return {
        contactId: entry.id,
        contact: entry,
        phone: phone,
        name: name,
        priority: priority,
      };
    });
  } catch (error) {
    console.error('[OnCallSelector] Error getting backup contacts:', error);
    return [];
  }
}

module.exports = {
  selectOnCallPerson,
  getBackupContacts,
};
