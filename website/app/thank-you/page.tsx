'use client';

import { Suspense } from "react";
import { CheckCircle2, Clock, Mail, PhoneCall, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const businessName = searchParams?.get('businessName') || '';

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Live Trial Confirmed
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              {businessName ? (
                <>
                  Welcome aboard, <span className="text-primary">{businessName}</span>.
                </>
              ) : (
                "You're in — your live trial is on the way."
              )}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              {businessName 
                ? "Your AI agent is warming up."
                : "We received your details. A specialist is putting together your Setup Kit now."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Check your email for the Setup Kit</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-xl border border-border bg-card/70 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">What happens next</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Next 10 minutes",
                  description:
                    "You'll receive your Setup Kit with forwarding steps + a quick test-call plan.",
                  icon: Clock,
                },
                {
                  title: "Today",
                  description:
                    "If you want it, reply with any tweaks (service area, exclusions, on-call number).",
                  icon: PhoneCall,
                },
                {
                  title: "Tomorrow morning",
                  description:
                    "You'll get your first clean call summary once forwarding is live.",
                  icon: Mail,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-background/60 p-4">
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/how-it-works" className="flex-1">
                <Button variant="primary" className="w-full">
                  Open Setup Kit
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Back to Start
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="bg-background text-foreground">
        <section className="border-b border-border">
          <div className="container mx-auto px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                You're in — your live trial is on the way.
              </h1>
            </div>
          </div>
        </section>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
