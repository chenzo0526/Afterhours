'use client';

import { Phone, Filter, Zap } from 'lucide-react';
import { STICKY_STACK_STEPS } from '@/lib/marketingCopy';

const iconMap = { phone: Phone, filter: Filter, zap: Zap } as const;

/**
 * Narrative of Certainty — 3-step sticky stack. Each step slides over the previous as you scroll.
 * High-contrast typography. No AI buzzwords.
 */
export default function StickyStack() {
  return (
    <div className="relative [contain:layout]" role="presentation">
      {STICKY_STACK_STEPS.map(({ id, step, title, subtitle, headline, body, iconKey }) => {
        const Icon = iconMap[iconKey];
        return (
        <section
          key={id}
          className="sticky top-[7rem] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#050505] [backface-visibility:hidden]"
          aria-labelledby={`narrative-${id}-title`}
        >
          <div className="max-w-4xl mx-auto w-full">
            <div className="rounded-2xl border border-border/40 bg-[#0a0a0a] p-8 sm:p-10 lg:p-14">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Step {step}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {subtitle}
                </span>
              </div>
              <h2
                id={`narrative-${id}-title`}
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/80 mb-6"
              >
                {title}
              </h2>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter text-white leading-tight mb-4">
                    {headline}
                  </p>
                  <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
                    {body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        );
      })}
    </div>
  );
}
