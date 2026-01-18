import CTA from '../../components/CTA';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { EXPECTATION_LINE } from '../../lib/copy';

const tiers = [
  {
    name: 'Starter',
    description: 'Single on-call contact',
    features: [
      'After-hours and overflow intake',
      'Call summary record',
      'Notification attempt record',
    ],
  },
  {
    name: 'Team',
    description: 'Primary + backup on-call',
    features: [
      'Multi-recipient notifications',
      'Urgency-based routing rules',
      'Weekly digest summaries',
    ],
  },
  {
    name: 'Scale',
    description: 'Multi-location operations',
    features: [
      'Multiple business numbers',
      'Service area boundaries',
      'Dedicated onboarding',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <section>
          <h1 className="text-3xl font-semibold">Simple pricing</h1>
          <p className="mt-3 text-sm text-neutral-600">{EXPECTATION_LINE}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className="rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold">{tier.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">{tier.description}</p>
              <ul className="mt-4 list-disc pl-5 text-sm text-neutral-600">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <CTA heading="Start with a live trial" buttonLabel="Start Trial" />
      </main>
      <Footer />
    </div>
  );
}
