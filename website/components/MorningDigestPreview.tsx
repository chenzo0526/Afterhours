'use client';

import { Flame, DollarSign, Clock } from 'lucide-react';

/**
 * Morning Digest Preview — shows what automated reports look like to the owner.
 * Uses sample data to illustrate (A) Hot Leads, (B) Total Revenue Opportunity, (C) Non-urgent follow-ups.
 */

const sampleHotLeads = [
  {
    caller: '+1 (555) 234-5678',
    summary: 'No heat, elderly household. Ready to dispatch ASAP.',
    urgency: 'Emergency',
    recommendedAction: 'Call back within 15 min; schedule same-day.',
  },
  {
    caller: '+1 (555) 876-5432',
    summary: 'Water heater leak, basement. Asking for quote today.',
    urgency: 'High',
    recommendedAction: 'Send quote by EOD; follow up tomorrow AM.',
  },
];

const sampleRevenue = {
  amount: 4_200,
  currency: 'USD',
  breakdown: '2 emergency jobs (~$2,800) + 1 non-urgent water heater (~$1,400).',
};

const sampleFollowUps = [
  {
    caller: '+1 (555) 111-2233',
    summary: 'Annual HVAC tune-up inquiry. Not urgent.',
    suggestedFollowUp: 'Add to schedule for next week; send maintenance reminder.',
  },
];

export default function MorningDigestPreview() {
  return (
    <section
      className="border-t border-border bg-muted/20 py-16 sm:py-20 lg:py-24"
      aria-labelledby="digest-preview-heading"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Morning Digest</p>
          <h2 id="digest-preview-heading" className="mt-3 text-3xl font-semibold sm:text-4xl text-foreground">
            What you see every morning
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Automated summaries of last night&apos;s calls: hot leads, revenue opportunity, and non-urgent follow-ups.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">Sample report · Last 24h</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* A) Hot Leads */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="text-lg font-semibold text-foreground">Hot Leads</h3>
              </div>
              <ul className="space-y-4" role="list">
                {sampleHotLeads.map((lead, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border/50 bg-background/80 p-4 space-y-2"
                    role="listitem"
                  >
                    <p className="text-sm font-medium text-foreground">{lead.caller}</p>
                    <p className="text-sm text-muted-foreground">{lead.summary}</p>
                    <p className="text-xs text-primary font-medium">{lead.urgency}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">→</span> {lead.recommendedAction}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* B) Total Revenue Opportunity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="text-lg font-semibold text-foreground">Total Revenue Opportunity</h3>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/80 p-5">
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: sampleRevenue.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(sampleRevenue.amount)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{sampleRevenue.breakdown}</p>
              </div>
            </div>

            {/* C) Non-urgent follow-ups */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="text-lg font-semibold text-foreground">Non-urgent follow-ups</h3>
              </div>
              <ul className="space-y-4" role="list">
                {sampleFollowUps.map((fu, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border/50 bg-background/80 p-4 space-y-2"
                    role="listitem"
                  >
                    <p className="text-sm font-medium text-foreground">{fu.caller}</p>
                    <p className="text-sm text-muted-foreground">{fu.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">→</span> {fu.suggestedFollowUp}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
