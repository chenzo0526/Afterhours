import { EMERGENCY_DISCLAIMER, EXPECTATION_LINE } from '../lib/copy';

type CTAProps = {
  heading?: string;
  buttonLabel?: string;
};

export default function CTA({
  heading = 'Start a live trial',
  buttonLabel = 'Start Trial',
}: CTAProps) {
  return (
    <section className="rounded-lg border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900">{heading}</h2>
      <p className="mt-2 text-sm text-neutral-600">{EXPECTATION_LINE}</p>
      <p className="mt-2 text-xs text-neutral-500">{EMERGENCY_DISCLAIMER}</p>
      <a
        className="mt-4 inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
        href="/trial"
      >
        {buttonLabel}
      </a>
    </section>
  );
}
