import Link from "next/link";
import { HulyButton } from "@/components/ui/huly-button";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import MotionContainer from "@/components/visual/MotionContainer";

export default function PricingContent() {
  return (
    <div className="bg-background text-foreground">
      <section
        className="border-b border-border py-16 sm:py-20 lg:py-24"
        data-scroll-section
      >
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <MotionContainer fadeInOnScroll subtleTranslateY>
            <div className="mx-auto max-w-2xl space-y-6 text-center">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl text-foreground">
                Simple pricing for late-night coverage
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed">
                Choose the plan that fits your call volume. All plans include core features.
              </p>
            </div>
          </MotionContainer>
        </div>
      </section>

      <section
        className="border-b border-border bg-muted/20 py-16 sm:py-20 lg:py-24"
        data-scroll-section
      >
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <MotionContainer fadeInOnScroll subtleTranslateY>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-2xl font-semibold text-foreground">Starter</h3>
                <p className="mt-2 text-muted-foreground">Best for solo operators</p>
                <div className="mt-6">
                  <span className="text-4xl font-semibold text-foreground">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    "Late-night call answering",
                    "Clean call summaries (text)",
                    "Urgency tagging",
                    "Spam filtering",
                    "Business hours rules",
                    "Email support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {/* CTA rule: "Start Live Trial" uses variant=primary only. Navbar, hero, pricing, forms. */}
                <Link href="/#start-trial" className="mt-8 block">
                  <Button variant="primary" className="w-full">
                    Start Live Trial
                  </Button>
                </Link>
              </div>

              <div className="relative rounded-xl border-2 border-primary bg-card p-8">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Pro</h3>
                <p className="mt-2 text-muted-foreground">Best for small teams</p>
                <div className="mt-6">
                  <span className="text-4xl font-semibold text-foreground">$249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">Everything in Starter, plus:</p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Multi-recipient notifications (send summaries to multiple contacts)",
                    "Additional notification destinations",
                    "Advanced business hour rules",
                    "Call recording",
                    "Priority support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/#start-trial" className="mt-8 block">
                  <HulyButton variant="primary" className="w-full px-6 py-4">Start Live Trial</HulyButton>
                </Link>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-2xl font-semibold text-foreground">Scale / Custom</h3>
                <p className="mt-2 text-muted-foreground">Multi-location businesses</p>
                <div className="mt-6">
                  <span className="text-4xl font-semibold text-foreground">Custom</span>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">Everything in Pro, plus:</p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Multiple business numbers",
                    "Multi-location setup",
                    "Backup contact notifications",
                    "Call recording retention",
                    "Optional weekly digest available",
                    "Dedicated onboarding",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/#start-trial" className="mt-8 block">
                  <HulyButton variant="primary" className="w-full px-6 py-4">
                    Start Live Trial
                  </HulyButton>
                </Link>
              </div>
            </div>
          </MotionContainer>
        </div>
      </section>

      <section
        className="py-16 sm:py-20 lg:py-24"
        data-scroll-section
      >
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <MotionContainer fadeInOnScroll subtleTranslateY>
            <div className="text-center">
              <Link href="/#start-trial">
                <HulyButton variant="primary" className="px-8 py-4">Start Live Trial</HulyButton>
              </Link>
            </div>
          </MotionContainer>
        </div>
      </section>
    </div>
  );
}
