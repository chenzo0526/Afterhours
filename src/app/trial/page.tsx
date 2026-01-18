import CTA from '../../components/CTA';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { EMERGENCY_DISCLAIMER, EXPECTATION_LINE } from '../../lib/copy';

export default function TrialPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <section>
          <h1 className="text-3xl font-semibold">Live trial</h1>
          <p className="mt-3 text-sm text-neutral-600">{EXPECTATION_LINE}</p>
          <p className="mt-2 text-xs text-neutral-500">{EMERGENCY_DISCLAIMER}</p>
        </section>

        <section className="rounded-lg border border-neutral-200 p-6">
          <h2 className="text-base font-semibold">What happens during the trial</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-neutral-600">
            <li>Forward after-hours and overflow calls to Afterhours.</li>
            <li>We collect essential details and urgency.</li>
            <li>We notify your primary on-call with a summary.</li>
          </ul>
        </section>

        <section className="rounded-lg border border-neutral-200 p-6">
          <h2 className="text-base font-semibold">Test call + go-live gate</h2>
          <p className="mt-2 text-sm text-neutral-600">
            A test call is required before go-live. We confirm the spoken company name, the
            question flow, and the summary format.
          </p>
        </section>

        <section className="rounded-lg border border-neutral-200 p-6">
          <h2 className="text-base font-semibold">Proof and logging</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-neutral-600">
            <li>Call summary record for every handled call.</li>
            <li>Notification attempt record with delivery status.</li>
            <li>Recording link or reference when enabled.</li>
          </ul>
        </section>

        <CTA heading="Ready to start?" buttonLabel="Start Trial" />
      </main>
      <Footer />
    </div>
  );
}
