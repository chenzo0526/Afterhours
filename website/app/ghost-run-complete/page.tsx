'use client';

import { useState } from 'react';
import { CheckCircle2, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GhostRunCompletePage() {
  const price = process.env.NEXT_PUBLIC_MONTHLY_PRICE || '$249/month';
  const [confirmed, setConfirmed] = useState(false);
  const [action, setAction] = useState<'keep' | 'stop' | null>(null);

  return (
    <div className="bg-background text-foreground">
      <section className="container mx-auto px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card/80 p-8 shadow-xl shadow-black/20 sm:p-12">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Your live trial is complete. Decide whether to continue.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            You decide whether to continue after the trial. Stop here with no charge or confirm
            monthly pricing below.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Keep Afterhours running (monthly)</span>
                <span className="text-primary">{price}</span>
              </div>
              <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/40"
                />
                I confirm the monthly price shown above and want to continue.
              </label>
              <Button
                type="button"
                variant="primary"
                disabled={!confirmed}
                onClick={() => setAction('keep')}
                className="mt-4 w-full gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm monthly plan
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setAction('stop')}
              className="w-full gap-2"
            >
              <PauseCircle className="h-4 w-4" />
              Stop here (no charge)
            </Button>
          </div>

          {action && (
            <div className="mt-6 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
              {action === 'keep' ? (
                <span>
                  Thanks. We recorded your confirmation and will finalize the monthly plan.
                </span>
              ) : (
                <span>
                  All set. We will stop billing here and close out your trial.
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
