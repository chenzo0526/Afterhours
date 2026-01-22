import Bullets from "@/components/marketing/Bullets";
import Hero from "@/components/marketing/Hero";
import Section from "@/components/marketing/Section";

export default function CompleteCoveragePage() {
  return (
    <div className="bg-background text-foreground">
      <Hero
        title="You don’t need more visibility. You need better handling."
        ctaLabel="See what comes through"
        ctaHref="/start?source=complete-coverage"
      />

      <Section tone="muted">
        <p className="max-w-3xl text-base text-muted-foreground">
          Most owners don’t want dashboards. They want confidence that nothing slipped through.
        </p>
        <p className="mt-4 text-sm font-semibold text-foreground">This gives you:</p>
        <Bullets
          items={[
            "Calls handled correctly",
            "Situations categorized",
            "A clear summary, ready when you are",
          ]}
        />
        <p className="mt-6 max-w-3xl text-base text-muted-foreground">No babysitting required.</p>
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
