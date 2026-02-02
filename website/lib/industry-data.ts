export interface IndustryData {
  slug: string;
  name: string;
  displayName: string;
  h1: string;
  metaDescription: string;
  benefits: string[];
  emergencyKeywords: string[];
  commonIssues: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  serviceAreas?: string[];
}

export const industries: Record<string, IndustryData> = {
  plumbers: {
    slug: 'plumbers',
    name: 'Plumbing',
    displayName: 'Plumbers',
    h1: 'AI Answering Service for Plumbers',
    metaDescription:
      'Never miss an emergency plumbing call. Afterhours AI answers in <1 second, triages burst pipes and sewer backups, and syncs directly to your CRM. Flat-rate pricing, zero hold time.',
    benefits: [
      'Instant detection of high-stakes keywords like "burst pipe", "sewer backup", or "water leak"',
      '24/7 emergency triage that distinguishes urgent calls from routine maintenance',
      'Automatic capture of address, callback number, and issue description',
      'Direct sync to Airtable and Twilio for instant lead capture',
      'Smart filtering eliminates robocalls and spam before they reach your bill',
      'Morning digest of non-urgent calls for efficient follow-up',
    ],
    emergencyKeywords: [
      'burst pipe',
      'water leak',
      'sewer backup',
      'no water',
      'flooding',
      'gas leak',
      'water heater leak',
    ],
    commonIssues: [
      'Active water leaks',
      'Burst pipes',
      'Sewer backups',
      'Toilet clogs',
      'Water heater failures',
      'Drain clogs',
      'Frozen pipes',
    ],
    faqs: [
      {
        question: 'How does AI handle emergency plumbing calls?',
        answer:
          'Our AI instantly detects emergency keywords like "burst pipe" or "sewer backup" and immediately flags the call as urgent. It collects the address, callback number, and issue details, then sends an instant alert to your on-call plumber via SMS and email. The AI is trained to distinguish between true emergencies (active water flow) and routine issues (no hot water) to ensure urgent calls get immediate attention.',
      },
      {
        question: 'Can the AI answer service handle plumbing emergencies when your office is closed?',
        answer:
          'Yes. Afterhours is specifically designed for 24/7 emergency plumbing calls. Our AI answers in less than 1 second with zero hold time, captures all critical information, and immediately notifies your on-call team. Unlike traditional answering services, there\'s no per-minute fee and no human error in message taking.',
      },
      {
        question: 'How does Afterhours compare to Ruby Receptionist for plumbers?',
        answer:
          'Afterhours offers flat-rate pricing with zero hold time, while Ruby charges per-minute fees with typical 15-30 second hold times. Our AI instantly triages emergencies and syncs directly to your CRM, while Ruby requires manual data entry. Afterhours also filters spam calls automatically, saving you money on robocall charges.',
      },
      {
        question: 'Does the AI understand plumbing terminology?',
        answer:
          'Yes. Our AI is trained on plumbing-specific terminology and can accurately identify issues like sewer backups, water heater failures, and drain clogs. It understands urgency levels and knows that a "burst pipe" requires immediate attention while "no hot water" can wait until morning.',
      },
      {
        question: 'How quickly will my on-call plumber be notified?',
        answer:
          'Your on-call plumber receives an instant SMS and email notification within seconds of an emergency call. The notification includes the caller\'s name, address, callback number, issue description, and urgency level. All information is also automatically synced to your CRM for tracking.',
      },
    ],
    serviceAreas: [
      'Emergency plumbing repairs',
      'Burst pipe response',
      'Sewer backup cleanup',
      'Water leak detection',
      'Drain cleaning',
      'Water heater service',
    ],
  },
  hvac: {
    slug: 'hvac',
    name: 'HVAC',
    displayName: 'HVAC Contractors',
    h1: 'AI Answering Service for HVAC Contractors',
    metaDescription:
      'Stop losing AC and heating emergency calls. Afterhours AI answers instantly, triages "AC out" and "no heat" emergencies, and captures leads 24/7. Flat-rate pricing beats per-minute answering services.',
    benefits: [
      'Instant detection of HVAC emergencies like "AC out", "no heat", or "furnace not working"',
      '24/7 emergency triage that prioritizes comfort emergencies during extreme weather',
      'Automatic capture of address, callback preference, and system type',
      'Direct CRM sync for instant lead capture and follow-up',
      'Smart spam filtering eliminates robocalls before they cost you money',
      'Morning digest organizes non-urgent calls for efficient scheduling',
    ],
    emergencyKeywords: [
      'ac out',
      'no heat',
      'furnace not working',
      'air conditioning broken',
      'heating system down',
      'emergency hvac',
      'system failure',
    ],
    commonIssues: [
      'AC not cooling',
      'Furnace not heating',
      'System not working',
      'Emergency repairs',
      'Refrigerant leaks',
      'Compressor failure',
      'Thermostat issues',
    ],
    faqs: [
      {
        question: 'How does AI handle emergency HVAC calls?',
        answer:
          'Our AI instantly recognizes HVAC emergency keywords like "AC out" or "no heat" and immediately flags these as urgent calls, especially during extreme weather. It collects the address, callback number, system type, and issue description, then sends an instant alert to your on-call technician. The AI understands that a broken AC in 100°F weather is more urgent than a routine maintenance request.',
      },
      {
        question: 'Can the AI answer service handle HVAC emergencies when your office is closed?',
        answer:
          'Absolutely. Afterhours is built for 24/7 HVAC emergency response. Our AI answers in less than 1 second with zero hold time, captures all critical information, and immediately notifies your on-call team. Unlike traditional answering services, there\'s no per-minute fee and no risk of human error in taking down addresses or callback numbers.',
      },
      {
        question: 'How does Afterhours compare to Smith.ai for HVAC contractors?',
        answer:
          'Afterhours offers flat-rate pricing with zero hold time, while Smith.ai charges per-minute fees with typical hold times. Our AI instantly triages emergencies and syncs directly to your CRM, while Smith.ai requires manual data entry. Afterhours also automatically filters spam calls, saving you money on robocall charges.',
      },
      {
        question: 'Does the AI understand HVAC system types and terminology?',
        answer:
          'Yes. Our AI is trained on HVAC-specific terminology and can identify different system types (central air, heat pump, furnace) and common issues. It understands urgency levels and knows that "no heat" in winter or "AC out" in summer requires immediate attention.',
      },
      {
        question: 'How quickly will my on-call HVAC technician be notified?',
        answer:
          'Your on-call technician receives an instant SMS and email notification within seconds of an emergency call. The notification includes the caller\'s name, address, callback number, system type, issue description, and urgency level. All information is automatically synced to your CRM for tracking and follow-up.',
      },
    ],
    serviceAreas: [
      'Emergency AC repair',
      'Emergency heating repair',
      'System breakdowns',
      'Refrigerant leaks',
      'Compressor failures',
      'Thermostat issues',
    ],
  },
  restoration: {
    slug: 'restoration',
    name: 'Restoration',
    displayName: 'Restoration Contractors',
    h1: 'AI Answering Service for Restoration Contractors',
    metaDescription:
      'Never miss a water damage or fire restoration emergency. Afterhours AI answers instantly, triages urgent restoration calls, and captures critical details 24/7. Flat-rate pricing, zero hold time.',
    benefits: [
      'Instant detection of restoration emergencies like "water damage", "fire damage", or "flood"',
      '24/7 emergency triage that prioritizes time-sensitive restoration work',
      'Automatic capture of property address, damage type, and insurance information',
      'Direct CRM sync for instant lead capture and job tracking',
      'Smart spam filtering eliminates robocalls before they reach your bill',
      'Morning digest organizes non-urgent calls for efficient scheduling',
    ],
    emergencyKeywords: [
      'water damage',
      'fire damage',
      'flood',
      'water leak',
      'mold',
      'sewage backup',
      'storm damage',
    ],
    commonIssues: [
      'Water damage restoration',
      'Fire damage cleanup',
      'Flood restoration',
      'Mold remediation',
      'Sewage cleanup',
      'Storm damage',
      'Emergency board-up',
    ],
    faqs: [
      {
        question: 'How does AI handle emergency restoration calls?',
        answer:
          'Our AI instantly recognizes restoration emergency keywords like "water damage", "fire damage", or "flood" and immediately flags these as urgent calls. It collects the property address, damage type, insurance information, and callback number, then sends an instant alert to your on-call team. The AI understands that time-sensitive restoration work requires immediate response.',
      },
      {
        question: 'Can the AI answer service handle restoration emergencies when your office is closed?',
        answer:
          'Yes. Afterhours is specifically designed for 24/7 restoration emergency response. Our AI answers in less than 1 second with zero hold time, captures all critical information including insurance details, and immediately notifies your on-call team. Unlike traditional answering services, there\'s no per-minute fee and no risk of human error in taking down property addresses or insurance information.',
      },
      {
        question: 'How does Afterhours compare to Ruby Receptionist for restoration contractors?',
        answer:
          'Afterhours offers flat-rate pricing with zero hold time, while Ruby charges per-minute fees with typical 15-30 second hold times. Our AI instantly triages emergencies and syncs directly to your CRM, while Ruby requires manual data entry. Afterhours also automatically filters spam calls, saving you money on robocall charges.',
      },
      {
        question: 'Does the AI capture insurance information for restoration calls?',
        answer:
          'Yes. Our AI is trained to ask for and capture insurance information, claim numbers, and policy details when relevant. It understands that restoration work often involves insurance claims and ensures all necessary information is collected for your team to follow up effectively.',
      },
      {
        question: 'How quickly will my on-call restoration team be notified?',
        answer:
          'Your on-call restoration team receives an instant SMS and email notification within seconds of an emergency call. The notification includes the property address, damage type, insurance information, callback number, and urgency level. All information is automatically synced to your CRM for job tracking and follow-up.',
      },
    ],
    serviceAreas: [
      'Water damage restoration',
      'Fire damage cleanup',
      'Flood restoration',
      'Mold remediation',
      'Sewage cleanup',
      'Storm damage repair',
    ],
  },
};

export function getIndustryData(slug: string): IndustryData | null {
  return industries[slug] || null;
}

export function getAllIndustrySlugs(): string[] {
  return Object.keys(industries);
}
