const defaultSteps = [
  { speaker: 'Caller', text: "Hi, I've got water leaking under my sink." },
  { speaker: 'Afterhours', text: "This is [Company] — we handle your calls when the office is closed. I understand you have a leak. Is water actively flowing right now?" },
  { speaker: 'Caller', text: "Yes, it's still dripping." },
  {
    speaker: 'Afterhours',
    text: 'I understand. Let me get your details and notify the on-call technician.',
  },
  {
    speaker: 'Afterhours',
    text: "What's the service address and best number to reach you?",
  },
];

type CallStep = { speaker: string; text: string; meta?: { urgency?: string } };

type CallFlowDemoProps = {
  steps?: CallStep[];
};

export default function CallFlowDemo({ steps }: CallFlowDemoProps) {
  const items = steps != null && steps.length > 0 ? steps : defaultSteps;

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24" data-scroll-section>
      <div className="mb-12">
        <h2 className="text-3xl font-semibold tracking-tight">
          What actually happens on a call
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          How calls are handled.
        </p>
      </div>
      <div className="space-y-6">
        {items.map((line, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card/70 p-5"
          >
            <p className="text-xs uppercase tracking-widest text-primary">
              {line.speaker}
            </p>
            <p className="mt-2 text-sm">{line.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
