import Link from "next/link";
import Bullets from "@/components/marketing/Bullets";
import Hero from "@/components/marketing/Hero";
import Section from "@/components/marketing/Section";
import ScrollSection from "@/components/visual/ScrollSection";
import SignalWave from "@/components/visual/SignalWave";
import SummaryCard from "@/components/visual/SummaryCard";
import MotionContainer from "@/components/visual/MotionContainer";
import CallFlowDemo from "@/components/CallFlowDemo";
import { Button } from "@/components/ui/button";

const callFlowSteps = [
  {
    speaker: "caller",
    text: "Hey, sorry — our basement is flooding. The water heater just dumped everywhere.",
  },
  {
    speaker: "afterhours",
    text: "This is [Company] — we handle your calls when the office is closed. I understand you have active flooding from the water heater. Let me get your details and notify the on-call technician right away.",
  },
  {
    speaker: "caller",
    text: "I tried the valve but it won’t move. We’ve got towels down but it’s still spreading.",
  },
  {
    speaker: "afterhours",
    text: "I understand. What's the service address and best number to reach you?",
  },
  {
    speaker: "caller",
    text: "We’re at 1120 Ridge Ave, back unit. Call my cell, 555-0142.",
  },
  {
    speaker: "afterhours",
    text: "I'll notify the on-call technician now. They'll call you back when they can. I can't provide an arrival time, but they'll be in touch shortly. If anything changes or gets worse, please call back immediately.",
  },
] as const;

// TODO(PASS-6): add industry-specific datasets here.
// TODO(PASS-6): wire this dataset to real call intake data.

export default function InboundCallsHandledPage() {
  return (
    <div className="bg-background text-foreground">
      <ScrollSection className="py-0" withContainer={false}>
        <MotionContainer fadeInOnScroll subtleTranslateY>
          {/* Motion begins on scroll intersection to keep the hero restrained. */}
          <Hero
            title="Inbound calls are where most service businesses quietly lose work."
            subtitle="Not because demand isn't there. Because when calls come in and no one is immediately available, the handling breaks down."
            ctaLabel="See how calls are handled"
            ctaHref="/?source=inbound-diagnostic"
            ctaNote="Answer a few questions."
          />
        </MotionContainer>
      </ScrollSection>

      <ScrollSection className="py-8 sm:py-10">
        <MotionContainer fadeInOnScroll blurToClear>
          <SignalWave intensity="medium" className="mx-auto max-w-3xl" />
        </MotionContainer>
      </ScrollSection>

      <ScrollSection className="py-0" withContainer={false}>
        <MotionContainer fadeInOnScroll subtleTranslateY>
          {/* Frame 2: breakdown text-only with restrained fades. */}
          <Section tone="muted" title="What actually goes wrong">
            <div className="max-w-3xl space-y-5 text-base text-muted-foreground">
              <p>
                Through research and direct conversations with service businesses, the same patterns show
                up again and again:
              </p>
              <Bullets
                items={[
                  "Calls roll to voicemail when techs are busy",
                  "Callers don't leave complete or usable information",
                  "Urgency isn't assessed consistently",
                  "On-call staff receive vague or delayed messages",
                  "Jobs that should be surfaced never are",
                ]}
              />
              <p>
                None of this feels catastrophic in the moment.
                <br />
                But over time, it compounds.
              </p>
            </div>
          </Section>
        </MotionContainer>
      </ScrollSection>

      <ScrollSection className="py-0" withContainer={false}>
        <MotionContainer fadeInOnScroll blurToClear>
          {/* Frame 2 continues. */}
          <Section tone="default" title="How inbound calls are handled differently">
            <div className="max-w-3xl space-y-5 text-base text-muted-foreground">
              <p>
                When an inbound call comes in, the system answers immediately, collects the information
                that actually matters, and determines urgency based on the situation.
              </p>
              <ol className="space-y-3 text-base text-muted-foreground">
                <li>1. Answers the call immediately</li>
                <li>2. Collects the information that actually matters</li>
                <li>3. Determines urgency based on the situation</li>
                <li>4. Delivers a clean, structured summary</li>
                <li>5. Ensures nothing disappears or gets misinterpreted</li>
              </ol>
              <p>
                No scripts to manage. No inboxes to monitor. No extra operational overhead.
                <br />
                It fits into how your operation already runs.
              </p>
            </div>
          </Section>
        </MotionContainer>
      </ScrollSection>

      <ScrollSection className="py-0" withContainer={false}>
        <Section tone="muted" title="What this looks like in practice">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5 text-base text-muted-foreground">
              <MotionContainer fadeInOnScroll subtleTranslateY>
                {/* Frame 3: summary reveal stays calm and operational. */}
                <Bullets
                  items={[
                    "Every caller is spoken to, not sent away",
                    "Key details are captured the same way every time",
                    "Urgent situations are clearly flagged",
                    "Non-urgent calls are organized for follow-up",
                    "Your team sees exactly what came in - without guessing",
                  ]}
                />
                <p>
                  You're not reacting blindly the next morning.
                  <br />
                  You're making informed decisions.
                </p>
              </MotionContainer>
            </div>
            <MotionContainer fadeInOnScroll blurToClear>
              <SummaryCard
                caller="Caller: Amanda L."
                issue="Issue: Water heater leak"
                urgency="Urgency: High"
                address="Address: Oak Ridge Dr (shared)"
                nextAction="Next action: Notify on-call"
              />
            </MotionContainer>
          </div>
        </Section>
      </ScrollSection>

      <ScrollSection className="py-0" withContainer={false}>
        <MotionContainer fadeInOnScroll subtleTranslateY>
          {/* Frame 4: outcome + CTA, no aggressive motion. */}
          <Section tone="default" title="What this eliminates">
            <Bullets
              items={[
                "Missed opportunities that never show up on reports",
                "Morning call-back chaos",
                '"Did anyone handle this?" conversations',
                "Voicemail roulette",
                "Stress around coverage gaps",
              ]}
            />
            <p className="mt-5 max-w-3xl text-base text-muted-foreground">
              And replaces it with clarity.
            </p>
          </Section>
        </MotionContainer>
      </ScrollSection>

      <ScrollSection>
        <CallFlowDemo steps={[...callFlowSteps]} />
      </ScrollSection>

      <ScrollSection className="py-0" withContainer={false}>
        <MotionContainer fadeInOnScroll blurToClear>
          <Section tone="muted" title="Who this is for">
            <div className="max-w-3xl space-y-5 text-base text-muted-foreground">
              <Bullets
                items={[
                  "Rely on inbound calls to generate work",
                  "Have moments when staff can't answer immediately",
                  "Care about capturing opportunities cleanly",
                  "Want automation without added management complexity",
                ]}
              />
              <p>If inbound calls matter to your revenue, this matters.</p>
            </div>
          </Section>
        </MotionContainer>
      </ScrollSection>

      <ScrollSection className="py-0" withContainer={false}>
        <MotionContainer fadeInOnScroll subtleTranslateY>
          <Section tone="default" title="Get started" align="center">
            <div className="mt-8">
              <Link href="/?source=inbound-calls-handled">
                <Button variant="primary">
                  Run a live call on your number
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Short setup. No obligation.</p>
          </Section>
        </MotionContainer>
      </ScrollSection>
    </div>
  );
}
