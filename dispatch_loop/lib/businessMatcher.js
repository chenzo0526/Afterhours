const { findBusinessByTwilioNumber, getAllBusinesses, findBusinessById } = require('./airtable');

/**
 * Business matching logic (schema-adaptive)
 * Priority order:
 * 1. Match by Twilio DID (toNumber or twilioToNumber) → Businesses."Twilio DID"
 * 2. If only ONE business exists, auto-select it
 * 3. If multi-location with shared DID, match by IVR selection
 * 4. Else mark NEEDS_REVIEW and alert owner
 */
async function matchBusiness(callData) {
  const { twilioToNumber, toNumber, city, zip, ivrSelection } = callData;
  
  // Priority 1: Match by Twilio DID (try both field names)
  const didNumber = twilioToNumber || toNumber;
  if (didNumber) {
    const business = await findBusinessByTwilioNumber(didNumber);
    if (business) {
      return {
        businessId: business.id,
        business: business,
        matchMethod: 'TWILIO_DID',
        confidence: 'HIGH',
        needsReview: false,
      };
    }
  }
  
  // Priority 2: If Twilio DID match failed, query Businesses table (max 2 records)
  // If exactly 1 business exists, auto-select it
  const businesses = await getAllBusinesses();
  if (businesses.length === 1) {
    return {
      businessId: businesses[0].id,
      business: businesses[0],
      matchMethod: 'SINGLE_BUSINESS',
      confidence: 'MEDIUM',
      needsReview: false,
    };
  }
  
  // Priority 3: IVR selection (if provided in call data)
  if (ivrSelection && callData.businessId) {
    const business = await findBusinessById(callData.businessId);
    if (business) {
      return {
        businessId: business.id,
        business: business,
        matchMethod: 'IVR_SELECTION',
        confidence: 'HIGH',
        needsReview: false,
      };
    }
  }
  
  // Priority 4: No match found
  return {
    businessId: null,
    business: null,
    matchMethod: 'NONE',
    confidence: 'NONE',
    needsReview: true,
  };
}

module.exports = {
  matchBusiness,
};
