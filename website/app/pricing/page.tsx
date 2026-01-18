import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include core features.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Start with the live trial (core handoff). Upgrade if you need multi-recipient notifications or advanced routing.
        </p>
        <p className="text-center text-xs text-muted-foreground mb-12">
          Afterhours answers after-hours and overflow calls, collects essential details, and notifies your on-call contact. We do not dispatch or promise arrival times.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Starter */}
          <div className="p-8 border border-border rounded-lg bg-card">
            <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
            <p className="text-muted-foreground mb-6">Best for solo operators</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'After-hours + overflow call intake',
                'Clean call summaries (text)',
                'Urgency tagging',
                'Spam filtering',
                'Business hours rules',
                'Email support',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/start#start-trial" className="block">
              <Button variant="outline" className="w-full">Start Live Trial</Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 border-2 border-primary rounded-lg bg-card relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
            <p className="text-muted-foreground mb-6">Best for small teams</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$249</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Everything in Starter, plus:</p>
            <ul className="space-y-3 mb-8">
              {[
                'Multi-recipient notifications (send summaries to multiple contacts)',
                'Conditional notifications (urgent vs non-urgent)',
                'Multi-contact on-call support',
                'Advanced business hour rules',
                'Call recording',
                'Priority support',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/start#start-trial" className="block">
              <Button className="w-full">Start Live Trial</Button>
            </Link>
          </div>

          {/* Scale */}
          <div className="p-8 border border-border rounded-lg bg-card">
            <h3 className="text-2xl font-bold text-foreground mb-2">Scale / Custom</h3>
            <p className="text-muted-foreground mb-6">Multi-location businesses</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">Custom</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Everything in Pro, plus:</p>
            <ul className="space-y-3 mb-8">
              {[
                'Multiple business numbers',
                'Multi-location notification rules',
                'Backup contact routing',
                'Call recording retention',
                'Weekly digest summaries',
                'Dedicated onboarding',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/start#start-trial" className="block">
              <Button variant="outline" className="w-full">Start Live Trial</Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Need help choosing? We're here to help.
          </p>
          <Link href="/start#start-trial">
            <Button variant="outline">Start Live Trial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
