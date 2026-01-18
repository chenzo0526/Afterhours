/**
 * Urgency classification system
 * Classifies calls as LOW, MEDIUM, or HIGH based on:
 * - Agent-captured emergencyLevel (if present)
 * - Transcript keywords
 * - Business-specific emergency keywords
 */

const EMERGENCY_KEYWORDS = [
  // Plumbing
  'no water',
  'water leak',
  'burst pipe',
  'flooding',
  'sewage backup',
  'sewer backup',
  'sewage smell',
  'gas smell',
  'gas leak',
  'no heat',
  'frozen pipe',
  'water damage',
  
  // HVAC
  'no heat',
  'no air',
  'furnace broken',
  'ac broken',
  'gas smell',
  'carbon monoxide',
  
  // Electrical
  'sparking',
  'electrical fire',
  'power outage',
  'circuit breaker',
  'smoke',
  'burning smell',
  
  // General
  'emergency',
  'urgent',
  'asap',
  'immediately',
  'right now',
];

const HIGH_URGENCY_PATTERNS = [
  /no (water|heat|air)/i,
  /(burst|broken|leaking) (pipe|line|main)/i,
  /(flood|flooding)/i,
  /(sewage|sewer) (backup|smell|overflow)/i,
  /gas (smell|leak)/i,
  /(spark|sparking)/i,
  /(fire|smoke|burning)/i,
  /carbon monoxide/i,
];

/**
 * Classify urgency from call data
 */
function classifyUrgency(callData, businessEmergencyKeywords = []) {
  // Priority 1: Use agent-captured emergencyLevel if present
  if (callData.emergencyLevel) {
    const level = callData.emergencyLevel.toUpperCase();
    if (['HIGH', 'EMERGENCY', 'CRITICAL'].includes(level)) {
      return {
        urgency: 'HIGH',
        confidence: 'HIGH',
        reason: 'Agent-captured emergency level',
      };
    } else if (['LOW', 'NON-EMERGENCY'].includes(level)) {
      return {
        urgency: 'LOW',
        confidence: 'HIGH',
        reason: 'Agent-captured non-emergency',
      };
    }
  }
  
  // Priority 2: Check transcript/keywords
  const textToCheck = [
    callData.transcript || '',
    callData.issueSummary || '',
    callData.emergencyReason || '',
  ].join(' ').toLowerCase();
  
  if (!textToCheck.trim()) {
    return {
      urgency: 'MEDIUM',
      confidence: 'LOW',
      reason: 'No text available for classification',
    };
  }
  
  // Check business-specific keywords first
  if (businessEmergencyKeywords.length > 0) {
    for (const keyword of businessEmergencyKeywords) {
      if (textToCheck.includes(keyword.toLowerCase())) {
        return {
          urgency: 'HIGH',
          confidence: 'HIGH',
          reason: `Business-specific emergency keyword: ${keyword}`,
        };
      }
    }
  }
  
  // Check high-urgency patterns
  for (const pattern of HIGH_URGENCY_PATTERNS) {
    if (pattern.test(textToCheck)) {
      return {
        urgency: 'HIGH',
        confidence: 'MEDIUM',
        reason: `Pattern match: ${pattern.toString()}`,
      };
    }
  }
  
  // Check emergency keywords
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (textToCheck.includes(keyword.toLowerCase())) {
      return {
        urgency: 'HIGH',
        confidence: 'MEDIUM',
        reason: `Emergency keyword: ${keyword}`,
      };
    }
  }
  
  // Default to MEDIUM if no indicators found
  return {
    urgency: 'MEDIUM',
    confidence: 'LOW',
    reason: 'No emergency indicators found',
  };
}

module.exports = {
  classifyUrgency,
  EMERGENCY_KEYWORDS,
  HIGH_URGENCY_PATTERNS,
};
