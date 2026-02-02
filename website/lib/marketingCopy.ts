/**
 * Centralized marketing copy. Iterate here for fast copy changes.
 * No layout/structure—strings and arrays only.
 */

// --- HERO ---
export const HERO = {
  headline: "Stop Bleeding Opportunities After Normal Business Hours.",
  subhead:
    "The professional intake system that knows your trade, provides immediate customer instructions, and organizes every request for seamless follow-up. More consistent than a call center, more reliable than in-house staff.",
  proof: "Built for Plumbing · HVAC · Electrical · Restoration · Locksmith · Garage Door",
  ctaDemo: "Talk to Afterhours (Live Intake Demo)",
  ctaTrial: "Start Live Trial",
  modalTitle: "Speak with Afterhours",
  modalBody:
    "Enter your phone number. Our digital intake system will qualify you as a lead—we'll follow up.",
  modalCancel: "Cancel",
  modalSubmit: "Call Me",
  modalSubmitConnecting: "Connecting…",
} as const;

// --- CTAs (shared) ---
export const CTA_START_TRIAL = "Start Live Trial";

// --- STICKY STACK (3 steps). iconKey maps to Lucide: phone | filter | zap ---
export const STICKY_STACK_STEPS = [
  {
    id: "intake",
    step: 1,
    title: "The Intake",
    subtitle: "Professionalism",
    headline: "You're answered without delay.",
    body: "No hold, no voicemail. Professional and consistent. You get straight to the point.",
    iconKey: "phone" as const,
  },
  {
    id: "triage",
    step: 2,
    title: "The Triage",
    subtitle: "Emergency Detection",
    headline: "We listen. We classify.",
    body: "We determine whether it's an emergency or something that can wait. You're told what happens next—no guessing.",
    iconKey: "filter" as const,
  },
  {
    id: "escalation",
    step: 3,
    title: "The Escalation",
    subtitle: "Action",
    headline: "Details captured. You're told what's next.",
    body: "We collect issue, address, and callback. The right person is notified. We don't dispatch or promise arrival times—you get clarity, not promises.",
    iconKey: "zap" as const,
  },
];

// --- STICKY SCROLL NARRATIVE (4 stages). iconKey: brain | target | zap | calendar ---
export const STICKY_SCROLL_STAGES = [
  {
    id: "intent",
    stage: 1,
    title: "Intent & Intelligence",
    subtitle: "Value Detection",
    headline:
      "Issue, address, callback. Structured. You get what you need to act—no guesswork, no fluff.",
    iconKey: "brain" as const,
  },
  {
    id: "triage",
    stage: 2,
    title: "Precision Triage",
    subtitle: "Urgency Detection",
    headline:
      "Emergencies vs. routine. You define what's urgent. We separate them—you see the signal, not the noise.",
    iconKey: "target" as const,
  },
  {
    id: "escalation",
    stage: 3,
    title: "Zero-Miss Escalation",
    subtitle: "Priority Routing",
    headline:
      "We alert your on-call for urgent. We pass details. We don't dispatch or promise arrival times. You stay in control.",
    iconKey: "zap" as const,
  },
  {
    id: "crm",
    stage: 4,
    title: "Total CRM Control",
    subtitle: "Where the Info Goes",
    headline:
      "Text or email alert for urgent. Morning report for the rest. Full details. You see every call—no fake integrations.",
    iconKey: "calendar" as const,
  },
];

// --- FEATURES (deliverables, FeatureGrid) ---
export const FEATURES_HEADING = "Core coverage features";
export const FEATURES = [
  {
    title: "Late-night call answering",
    description: "Every call answered when your office is closed. No voicemail, no hold—callers reach a live-style intake. Nights, weekends, overnight.",
  },
  {
    title: "Intent + escalation logic",
    description:
      "We triage by intent and urgency, not just keywords. Real emergencies → on-call alert. Everything else → morning report.",
  },
  {
    title: "Detail capture",
    description: "Issue, address, callback preference, and urgency captured and passed to your team. We don't dispatch or promise arrival times.",
  },
  {
    title: "On-call alert (text/email)",
    description: "Urgent calls trigger a short summary to your on-call contact by text or email. You decide what to do next.",
  },
  {
    title: "Morning report",
    description: "Non-urgent calls land in a single morning report with full details. You follow up when you're ready.",
  },
  {
    title: "Spam / wrong-number filtering",
    description: "Likely spam and wrong numbers filtered. They don't wake you or clutter your report; you get a count of what was blocked.",
  },
  {
    title: "Business hours rules",
    description: "You set when you're \"closed\" and who gets notified. Nights, weekends, holidays—rules are adjustable.",
  },
  {
    title: "Call review and summaries",
    description: "Call summaries and notification records available. Review and tune rules as you go.",
  },
];

// --- MICROFLOW (first 30 seconds bullets) ---
export const MICROFLOW = [
  "We answer the call",
  "qualify intent and urgency",
  "capture issue and callback details",
  "Urgent → on-call alert; else → morning report",
  "No hold music, no voicemail",
];

// --- BUILT FOR (trade strip) ---
export const BUILT_FOR = [
  "Plumbing",
  "HVAC",
  "Electrical",
  "Restoration",
  "Locksmith",
  "Garage Door",
];

// --- FAQ ---
export const FAQ_HEADING = "Quick answers before you start";
export const FAQ = [
  {
    question: "Is it really free to try?",
    answer:
      "Yes. No credit card. No auto-billing. You get a Setup Kit, forward your lines, and we typically have you live within a day. Stop anytime if it's not a fit.",
  },
  {
    question: "What happens on urgent calls?",
    answer:
      "We notify your on-call contact right away with a text/email summary. If anyone is in immediate danger, callers should hang up and dial 911.",
  },
  {
    question: "What happens when it's not urgent?",
    answer: "It goes to the morning report with full details. You follow up when you're ready.",
  },
  {
    question: "What happens in the first 30 seconds?",
    answer:
      "We answer, qualify intent and urgency, and capture issue and callback details. Urgent → on-call alert. Else → morning report. No hold music, no voicemail.",
  },
  {
    question: "How fast can we start?",
    answer:
      "Typically within a day of forwarding. You get a Setup Kit, forward your lines, we run a quick setup check, then you're live. No long onboarding.",
  },
  {
    question: "Do I need new hardware?",
    answer: "No. Use your existing number with call forwarding.",
  },
  {
    question: "What if it gets it wrong?",
    answer:
      "We use intent and escalation logic—not rigid keywords. You can adjust rules and review calls. If something's misclassified, we work with you to tighten it.",
  },
  {
    question: "Does it sound human?",
    answer:
      "Natural, professional voice. Callers get a clear greeting, a few quick questions, and a confirmation. Built for triage, not long conversations.",
  },
  {
    question: "What about angry or difficult callers?",
    answer:
      "We stay calm and collect what we can—issue, address, callback. If we can't get details, we still log the call. You see it in the morning report.",
  },
  {
    question: "Does it filter spam and solicitors?",
    answer:
      "Yes. Likely spam and robocalls are filtered so they don't wake your team or clutter your report. You get a count of what was blocked.",
  },
  {
    question: "Can I change rules or review calls?",
    answer:
      "Yes. Update when you consider calls urgent, who gets notified, and service-area rules. Call summaries and notification records are available so you can review and adjust.",
  },
  {
    question: "What about data and privacy?",
    answer:
      "We use call data only to deliver the service—summaries, alerts, morning report. We don't sell it. See our Privacy Policy for full details.",
  },
  {
    question: "Does it replace my receptionist?",
    answer:
      "No. Afterhours handles calls when your office is closed. Business hours, your team answers. We're built for nights, weekends, and holidays.",
  },
  {
    question: "Does it work for my trade?",
    answer:
      "We're built for home-services and field-service: plumbing, HVAC, electrical, restoration, locksmith, garage door. If you take emergency calls outside business hours, we can tailor the flow.",
  },
];

// --- REVENUE INTELLIGENCE (Automated Morning Digest) ---
export const REVENUE_INTELLIGENCE = {
  eyebrow: "Revenue Intelligence",
  heading: "Automated Morning Digest",
  body: "Each morning you get a concise summary—by text or email—of overnight calls: leads captured, spam blocked, rest in one place. No manual logging. Typically live within a day of forwarding.",
  smsBubble: "Good morning. 3 emergency leads captured overnight. Spam blocked: 12. Full details in your morning report.",
  cta: CTA_START_TRIAL,
} as const;

// --- MORNING DIGEST (InteractiveMorningDigest). type: urgent | scheduling | spam ---
export const MORNING_DIGEST = {
  eyebrow: "Morning Digest",
  heading: "Wake up to a full revenue report",
  subhead:
    "Every lead qualified, every emergency handled. You get a single report each morning—no manual logging, no chasing voicemails.",
  dashboardTitle: "Your Morning Digest",
  items: [
    {
      id: "urgent-1",
      type: "urgent" as const,
      title: "Urgent Intake: Main Water Leak ($1,200 Est.)",
      action: "Escalated to On-Call Tech.",
      details: {
        caller: "+1 (555) 234-5678",
        timestamp: "2:34 AM",
        location: "123 Main St, Apt 4B",
        issue: "Burst pipe in kitchen, water spreading to living room",
        estimatedValue: "$1,200",
        status: "On-call tech notified via text/email summary",
      },
    },
    {
      id: "scheduling-1",
      type: "scheduling" as const,
      title: "Scheduling: Leaky Faucet Repair",
      action: "Scheduled for Monday, 10 AM.",
      details: {
        caller: "+1 (555) 876-5432",
        timestamp: "11:22 PM",
        location: "456 Oak Ave",
        issue: "Leaky faucet in kitchen, not urgent",
        estimatedValue: "$150",
        status: "Scheduled for Monday, 10:00 AM",
      },
    },
    {
      id: "spam-1",
      type: "spam" as const,
      title: "Spam/Robocall",
      action: "Filtered & Blocked.",
      details: {
        caller: "+1 (555) 000-0000",
        timestamp: "3:15 AM",
        location: "N/A",
        issue: "Automated telemarketing call detected",
        estimatedValue: "$0",
        status: "Blocked before reaching your team, no charge",
      },
    },
  ],
} as const;

// --- REVENUE CALCULATOR ---
export const REVENUE_CALCULATOR = {
  headline: "One emergency job a month pays for the service. Everything else is profit.",
  subhead: "Stop losing calls when you're closed. See how much revenue you're leaving on voicemail.",
  labelJobValue: "Average Job Value",
  labelMissedCalls: "Missed Calls per Month",
  ariaJobValue: "Average emergency job value in dollars",
  ariaMissedCalls: "Missed calls when your office is closed, per month",
  annualSavings: "Annual Savings",
  callCaptureRate: "100% Lead Capture",
  cta: "Start Your 7-Day Trial or First 10 Calls",
  microcopy:
    "No credit card. No auto-billing. Setup Kit → forward your lines → typically live within a day. Stop anytime if it's not a fit.",
} as const;

// --- START TRIAL SECTION (home) ---
export const START_TRIAL_SECTION = {
  eyebrow: "Live Trial",
  heading: "Try us for 7 days or your first 10 calls—completely free.",
  subhead:
    "No credit card required. We handle your first 10 calls or 7 days (whichever comes first) at zero cost. At the end of your trial, we'll review the revenue captured together to see if you want to keep the system active.",
} as const;

// --- START TRIAL FORM ---
export const START_TRIAL_FORM = {
  submitLabel: CTA_START_TRIAL,
  submittingLabel: "Submitting...",
} as const;

// --- SEO metadata by route ---
export const SEO = {
  home: {
    title: "Stop Losing Calls When Closed — Intake System for Home Services | Afterhours",
    description:
      "Missed calls outside business hours? Professional intake system for plumbers, HVAC, electrical, restoration & more. Emergency call triage, on-call alerts, morning report. Stop losing calls when closed. Setup Kit → forward lines → typically live in a day. Start a live trial.",
  },
  howItWorks: {
    title: "How It Works — Intake System & Emergency Triage | Afterhours",
    description:
      "We answer calls when your office is closed, triage intent and urgency, alert on-call for emergencies, morning report for the rest. Professional intake system for home services. Typically live within a day of forwarding.",
    descriptionShort:
      "We answer off-hours calls, triage intent and urgency, alert on-call for emergencies, morning report for the rest. Typically live within a day of forwarding.",
  },
  pricing: {
    title: "Pricing — Intake System for Home Services | Afterhours",
    description:
      "Simple pricing for call handling when you're closed. Plans for solo operators and teams. Setup Kit, forward lines, typically live in a day. Stop losing calls when closed. Start a live trial—no credit card.",
    descriptionShort:
      "Simple pricing. Setup Kit, forward lines, typically live in a day. Start a live trial—no credit card. Pick a plan after your trial based on call volume.",
  },
  faq: {
    title: "Frequently Asked Questions | Afterhours",
    description:
      "Common questions about Afterhours call handling service. Learn about setup, pricing, how it works, and more.",
  },
} as const;
