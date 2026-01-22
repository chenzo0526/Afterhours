import Bullets from "@/components/marketing/Bullets";
import Hero from "@/components/marketing/Hero";
import Section from "@/components/marketing/Section";

export default function ClearDispatchPage() {
  return (
    <div className="bg-background text-foreground">
      <Hero
        title="Teams work better when they know what’s actually happening."
        ctaLabel="See the process"
        ctaHref="/start?source=clear-dispatch"
      />

      <Section tone="muted">
        <p className="max-w-3xl text-base text-muted-foreground">Without clear information:</p>
        <Bullets
          items={[
            "Urgent situations get delayed",
            "Minor issues interrupt the wrong people",
            "Decisions are made with half the picture",
          ]}
        />
        <p className="mt-6 max-w-3xl text-base text-muted-foreground">This fixes that.</p>
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">
          Calls are handled, urgency is determined, and your team gets clarity instead of noise.
        </p>
      </Section>

      <Section tone="muted" title="How inbound calls are actually handled">
        <div className="max-w-3xl space-y-5 text-base text-muted-foreground">
          <p>
            Inbound calls are the highest-intent moments in a service business.
            <br />
            They’re also where breakdowns are most common.
          </p>
          <p>
            Calls are missed.
            <br />
            Details are incomplete.
            <br />
            Urgency is guessed.
            <br />
            Follow-up becomes reactive instead of deliberate.
          </p>
          <p>
            The impact isn’t obvious in the moment—
            <br />
            it shows up later as lost work, delays, and frustrated customers.
          </p>
          <p>This system was designed around those realities.</p>
          <p>
            Calls are answered.
            <br />
            The situation is clarified.
            <br />
            Urgency is determined.
            <br />
            The right people are notified.
            <br />
            You receive a clear summary of what happened.
          </p>
          <p>
            Not as a workaround.
            <br />
            As a standard way of operating.
          </p>
        </div>
      </Section>
    </div>
  );
}
