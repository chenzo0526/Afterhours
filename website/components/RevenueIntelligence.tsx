'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { REVENUE_INTELLIGENCE } from '@/lib/marketingCopy';

/**
 * Revenue Intelligence — Automated Morning Digest.
 *
 * TECH: We will use advanced analysis to process call transcripts from our secure CRM
 * to generate these summaries automatically (hot leads, revenue opportunity, spam blocked).
 */
export default function RevenueIntelligence() {
  const handleStartTrial = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0070f3', '#10b981', '#f59e0b', '#ef4444'],
    });
    const target = document.getElementById('start-trial');
    if (target) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (window.location.hash !== '#start-trial') {
        window.history.replaceState(null, '', window.location.pathname + '#start-trial');
      }
    }
  }, []);

  return (
    <section
      className="border-t border-border/50 bg-[#050505] py-16 sm:py-20 lg:py-24"
      aria-labelledby="revenue-intelligence-heading"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">{REVENUE_INTELLIGENCE.eyebrow}</p>
          <h2 id="revenue-intelligence-heading" className="mt-3 text-3xl font-semibold sm:text-4xl text-foreground">
            {REVENUE_INTELLIGENCE.heading}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {REVENUE_INTELLIGENCE.body}
          </p>
        </div>

        {/* iPhone mockup — simple Tailwind frame */}
        <div className="flex justify-center mb-12">
          <div
            className="relative w-[280px] sm:w-[320px] rounded-[2.5rem] border-[10px] border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
            aria-hidden
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-xl z-10" />
            {/* Screen */}
            <div className="relative pt-8 pb-6 px-4 min-h-[420px] bg-zinc-950">
              {/* SMS bubble */}
              <div className="rounded-2xl rounded-tl-md bg-emerald-600/20 border border-emerald-500/30 p-4 text-left">
                <p className="text-xs text-emerald-400/80 mb-2">Afterhours</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {REVENUE_INTELLIGENCE.smsBubble}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="text-base sm:text-lg px-8 py-6"
            onClick={handleStartTrial}
          >
            {REVENUE_INTELLIGENCE.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
