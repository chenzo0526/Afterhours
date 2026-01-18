import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { EMERGENCY_DISCLAIMER, EXPECTATION_LINE, PROOF_LINE } from '../lib/copy';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
        <section>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">After-hours intake</p>
          <h1 className="mt-3 text-3xl font-semibold">
            Calm intake for after-hours and overflow calls.
          </h1>
          <p className="mt-4 text-sm text-neutral-600">{EXPECTATION_LINE}</p>
          <p className="mt-2 text-xs text-neutral-500">{EMERGENCY_DISCLAIMER}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            'Forward calls after hours',
            'Collect essential details and urgency',
            'Notify your on-call contact',
          ].map((item) => (
            <div key={item} className="rounded-lg border border-neutral-200 p-4 text-sm">
              {item}
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-neutral-200 p-6">
          <h2 className="text-base font-semibold">Proof for every call</h2>
          <p className="mt-2 text-sm text-neutral-600">{PROOF_LINE}</p>
          <p className="mt-2 text-xs text-neutral-500">
            Recording link or reference is included when enabled.
          </p>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
