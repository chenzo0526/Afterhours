"use client";

import Link from "next/link";
import { easeOut, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

type Industry = "plumbing" | "hvac" | "electrical";

const transcriptByIndustry: Record<Industry, Array<{ speaker: string; text: string }>> = {
  plumbing: [
    { speaker: "Caller", text: "Hi, our water heater is leaking and we can’t shut it off." },
    { speaker: "Afterhours", text: "Got it. Are you seeing active water flow right now?" },
    { speaker: "Caller", text: "Yes, it’s dripping fast and pooling." },
    { speaker: "Afterhours", text: "Thanks. I’ll mark this urgent and alert the on-call tech." },
    { speaker: "Afterhours", text: "What’s the address and best callback number?" },
    { speaker: "Caller", text: "1120 Ridge Ave, and call 555-0142." },
  ],
  hvac: [
    { speaker: "Caller", text: "Our furnace stopped and the house is dropping below 60." },
    { speaker: "Afterhours", text: "Understood. Is anyone in the home elderly or an infant?" },
    { speaker: "Caller", text: "Yes, we have a newborn." },
    { speaker: "Afterhours", text: "Thanks. I’m escalating this as urgent." },
    { speaker: "Afterhours", text: "What’s the service address and best callback number?" },
    { speaker: "Caller", text: "4 Maple Court, phone is 555-0196." },
  ],
  electrical: [
    { speaker: "Caller", text: "We lost power in half the house and it smells hot." },
    { speaker: "Afterhours", text: "Thanks for calling. Any visible sparks or smoke?" },
    { speaker: "Caller", text: "No smoke, but the panel feels warm." },
    { speaker: "Afterhours", text: "Understood. I’m marking this urgent and alerting on-call." },
    { speaker: "Afterhours", text: "What’s the address and best callback number?" },
    { speaker: "Caller", text: "78 Elm Street, 555-0173." },
  ],
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const resolutionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: resolutionProgress } = useScroll({
    target: resolutionRef,
    offset: ["start start", "end start"],
  });

  const coreScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const coreScaleMobile = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);
  const coreOpacityMobile = useTransform(scrollYProgress, [0, 0.6], [1, 0.7]);

  const callerX = useTransform(scrollYProgress, [0.15, 0.6], [0, -180]);
  const callerY = useTransform(scrollYProgress, [0.15, 0.6], [0, -120]);
  const callerOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.8], [0, 1, 0.2]);
  const callerYMobile = useTransform(scrollYProgress, [0.2, 0.7], [0, 40]);
  const callerOpacityMobile = useTransform(scrollYProgress, [0.1, 0.35, 0.8], [0, 1, 0.4]);

  const issueX = useTransform(scrollYProgress, [0.2, 0.65], [0, 210]);
  const issueY = useTransform(scrollYProgress, [0.2, 0.65], [0, -80]);
  const issueOpacity = useTransform(scrollYProgress, [0.15, 0.45, 0.85], [0, 1, 0.2]);
  const issueYMobile = useTransform(scrollYProgress, [0.25, 0.75], [0, 50]);
  const issueOpacityMobile = useTransform(scrollYProgress, [0.15, 0.4, 0.85], [0, 1, 0.4]);

  const urgencyX = useTransform(scrollYProgress, [0.25, 0.7], [0, -160]);
  const urgencyY = useTransform(scrollYProgress, [0.25, 0.7], [0, 160]);
  const urgencyOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.9], [0, 1, 0.2]);
  const urgencyYMobile = useTransform(scrollYProgress, [0.3, 0.8], [0, 60]);
  const urgencyOpacityMobile = useTransform(scrollYProgress, [0.2, 0.45, 0.9], [0, 1, 0.4]);

  const outcomeX = useTransform(scrollYProgress, [0.3, 0.75], [0, 180]);
  const outcomeY = useTransform(scrollYProgress, [0.3, 0.75], [0, 180]);
  const outcomeOpacity = useTransform(scrollYProgress, [0.25, 0.55, 1], [0, 1, 0.2]);
  const outcomeYMobile = useTransform(scrollYProgress, [0.35, 0.85], [0, 70]);
  const outcomeOpacityMobile = useTransform(scrollYProgress, [0.25, 0.5, 1], [0, 1, 0.4]);

  const copyIntroOpacity = useTransform(scrollYProgress, [0, 0.2, 0.35], [1, 1, 0]);
  const copyCallerOpacity = useTransform(scrollYProgress, [0.2, 0.35, 0.5], [0, 1, 0]);
  const copyIssueOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
  const copyUrgencyOpacity = useTransform(scrollYProgress, [0.5, 0.65, 0.8], [0, 1, 0]);
  const copyOutcomeOpacity = useTransform(scrollYProgress, [0.65, 0.8, 1], [0, 1, 0]);

  const blockCallerX = useTransform(resolutionProgress, [0, 0.7], [-60, 0]);
  const blockCallerY = useTransform(resolutionProgress, [0, 0.7], [60, 0]);
  const blockCallerOpacity = useTransform(resolutionProgress, [0, 0.3, 1], [0, 1, 1]);

  const blockIssueX = useTransform(resolutionProgress, [0.1, 0.75], [80, 0]);
  const blockIssueY = useTransform(resolutionProgress, [0.1, 0.75], [70, 0]);
  const blockIssueOpacity = useTransform(resolutionProgress, [0.1, 0.35, 1], [0, 1, 1]);

  const blockUrgencyX = useTransform(resolutionProgress, [0.2, 0.8], [-70, 0]);
  const blockUrgencyY = useTransform(resolutionProgress, [0.2, 0.8], [-70, 0]);
  const blockUrgencyOpacity = useTransform(resolutionProgress, [0.2, 0.45, 1], [0, 1, 1]);

  const blockOutcomeX = useTransform(resolutionProgress, [0.3, 0.85], [70, 0]);
  const blockOutcomeY = useTransform(resolutionProgress, [0.3, 0.85], [-60, 0]);
  const blockOutcomeOpacity = useTransform(resolutionProgress, [0.3, 0.55, 1], [0, 1, 1]);

  const resolutionCopyOpacity = useTransform(resolutionProgress, [0.2, 0.6], [0, 1]);

  const [industry, setIndustry] = useState<Industry>("plumbing");
  const [lineIndex, setLineIndex] = useState(0);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

  const transcript = useMemo(() => transcriptByIndustry[industry], [industry]);
  const progress = useMemo(
    () => Math.min(100, ((lineIndex + 1) / transcript.length) * 100),
    [lineIndex, transcript.length],
  );

  useEffect(() => {
    setLineIndex(0);
    lineRefs.current = [];
  }, [industry]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % transcript.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [transcript.length]);

  useEffect(() => {
    const target = lineRefs.current[lineIndex];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [lineIndex, transcript.length]);

  return (
    <div className="bg-background text-foreground">
      <div className="pointer-events-none fixed bottom-6 right-6 z-50">
        <Link
          href="/start?source=scroll-narrative"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-background"
        >
          See how your calls are actually handled →
        </Link>
      </div>

      <section
        ref={heroRef}
        className="relative min-h-[180vh] border-b border-border bg-slate-950 text-white md:min-h-[200vh]"
      >
        <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
            <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
          </div>

          <div className="relative flex w-full max-w-5xl flex-col items-center gap-10">
            <div className="relative flex h-[260px] w-full max-w-xs flex-col items-center gap-4 md:hidden">
              <motion.div
                className="h-44 w-44 rounded-[40%] bg-gradient-to-br from-sky-400/30 via-slate-900/60 to-indigo-400/20 shadow-[0_0_60px_rgba(56,189,248,0.3)]"
                style={{ scale: coreScaleMobile, opacity: coreOpacityMobile }}
              />
              <motion.div
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                style={{ y: callerYMobile, opacity: callerOpacityMobile }}
              >
                <div className="h-6 w-20 rounded-full bg-sky-400/30" />
              </motion.div>
              <motion.div
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                style={{ y: issueYMobile, opacity: issueOpacityMobile }}
              >
                <div className="h-6 w-24 rounded-full bg-indigo-400/30" />
              </motion.div>
              <motion.div
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                style={{ y: urgencyYMobile, opacity: urgencyOpacityMobile }}
              >
                <div className="h-6 w-16 rounded-full bg-rose-400/30" />
              </motion.div>
              <motion.div
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                style={{ y: outcomeYMobile, opacity: outcomeOpacityMobile }}
              >
                <div className="h-6 w-24 rounded-full bg-indigo-300/30" />
              </motion.div>
            </div>

            <div className="relative hidden h-[320px] w-[320px] items-center justify-center md:flex md:h-[420px] md:w-[420px]">
              <motion.div
                className="absolute h-full w-full rounded-[40%] bg-gradient-to-br from-sky-400/30 via-slate-900/60 to-indigo-400/20 shadow-[0_0_80px_rgba(56,189,248,0.35)]"
                style={{ scale: coreScale, opacity: coreOpacity }}
              />
              <motion.div
                className="absolute h-48 w-48 rounded-[36%] border border-white/10 bg-white/5 backdrop-blur"
                style={{ x: callerX, y: callerY, opacity: callerOpacity }}
              />
              <motion.div
                className="absolute h-40 w-56 rounded-[32%] border border-white/10 bg-gradient-to-br from-white/10 to-sky-400/10"
                style={{ x: issueX, y: issueY, opacity: issueOpacity }}
              />
              <motion.div
                className="absolute h-32 w-44 rounded-[30%] border border-white/10 bg-gradient-to-br from-rose-400/20 to-white/5"
                style={{ x: urgencyX, y: urgencyY, opacity: urgencyOpacity }}
              />
              <motion.div
                className="absolute h-36 w-60 rounded-[28%] border border-white/10 bg-gradient-to-br from-indigo-400/20 to-white/5"
                style={{ x: outcomeX, y: outcomeY, opacity: outcomeOpacity }}
              />
            </div>

            <div className="relative flex min-h-[48px] items-center justify-center text-center text-xs uppercase tracking-[0.2em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
              <motion.p className="absolute" style={{ opacity: copyIntroOpacity }}>
                Incoming system, before anything is answered.
              </motion.p>
              <motion.p className="absolute" style={{ opacity: copyCallerOpacity }}>
                Caller isolated.
              </motion.p>
              <motion.p className="absolute" style={{ opacity: copyIssueOpacity }}>
                Issue separated.
              </motion.p>
              <motion.p className="absolute" style={{ opacity: copyUrgencyOpacity }}>
                Urgency surfaced.
              </motion.p>
              <motion.p className="absolute" style={{ opacity: copyOutcomeOpacity }}>
                Outcome clarified.
              </motion.p>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Link
                href="/start"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90 sm:w-auto"
              >
                See how it works
              </Link>
              <Link
                href="/inbound-calls-handled"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Explore inbound handling
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={resolutionRef}
        className="relative min-h-[200vh] border-b border-border bg-slate-950 text-white"
      >
        <div className="sticky top-0 flex min-h-screen items-center px-6 py-16">
          <div className="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative grid gap-4 sm:grid-cols-2">
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                style={{ x: blockCallerX, y: blockCallerY, opacity: blockCallerOpacity }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Caller</p>
                <div className="mt-4 h-20 rounded-xl bg-gradient-to-br from-sky-400/20 to-white/5" />
              </motion.div>
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                style={{ x: blockIssueX, y: blockIssueY, opacity: blockIssueOpacity }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Issue</p>
                <div className="mt-4 h-20 rounded-xl bg-gradient-to-br from-indigo-400/20 to-white/5" />
              </motion.div>
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                style={{ x: blockUrgencyX, y: blockUrgencyY, opacity: blockUrgencyOpacity }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Urgency</p>
                <div className="mt-4 h-20 rounded-xl bg-gradient-to-br from-rose-400/20 to-white/5" />
              </motion.div>
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                style={{ x: blockOutcomeX, y: blockOutcomeY, opacity: blockOutcomeOpacity }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Outcome</p>
                <div className="mt-4 h-20 rounded-xl bg-gradient-to-br from-emerald-400/20 to-white/5" />
              </motion.div>
            </div>

            <motion.div style={{ opacity: resolutionCopyOpacity }}>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                How inbound calls are handled differently
              </h2>
              <div className="mt-6 space-y-5 text-base text-white/70">
                <p>
                  When an inbound call comes in, the system answers immediately, collects the
                  information that actually matters, and determines urgency based on the situation.
                </p>
                <ol className="space-y-2">
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
            </motion.div>
          </div>
        </div>
      </section>

      <section className="min-h-screen border-b border-border bg-background">
        <div className="container mx-auto flex min-h-screen items-center px-6 py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Interactive demo</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                See the call unfold as the system captures what matters.
              </h2>
              <p className="text-base text-muted-foreground">
                This is a simulated playback view of how an inbound call is summarized in real time.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-xl shadow-black/5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                    <div className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-sky-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Call playback</p>
                    <p className="text-xs text-muted-foreground">Simulated transcript view</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {`${Math.floor((lineIndex * 6) / 60)}`.padStart(2, "0")}:
                    {`${(lineIndex * 6) % 60}`.padStart(2, "0")}
                  </span>
                  <span>/</span>
                  <span>
                    {`${Math.floor((transcript.length * 6) / 60)}`.padStart(2, "0")}:
                    {`${(transcript.length * 6) % 60}`.padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
                  {(["plumbing", "hvac", "electrical"] as Industry[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIndustry(item)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        industry === item
                          ? "bg-slate-950 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">Auto-advancing</div>
              </div>

              <div className="mt-6 h-64 overflow-y-auto rounded-2xl border border-border bg-background p-4">
                <div className="space-y-3 text-sm text-foreground">
                  {transcript.map((line, index) => (
                    <div
                      key={`${line.speaker}-${index}`}
                      ref={(el) => {
                        lineRefs.current[index] = el;
                      }}
                      className={`rounded-xl border px-4 py-3 transition ${
                        index === lineIndex
                          ? "border-sky-400/60 bg-sky-500/10"
                          : "border-transparent bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-sky-400">
                        {line.speaker}
                      </p>
                      <p className="mt-2">{line.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        className="min-h-screen border-b border-border bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.35, once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto flex min-h-screen items-center px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Most service businesses don’t lose work because they’re bad. They lose it because
              important calls don’t get handled cleanly.
            </h2>
            <ul className="mt-8 grid gap-3 text-base text-muted-foreground sm:grid-cols-2">
              <li>Calls go unanswered or half-handled</li>
              <li>Details get missed</li>
              <li>Urgency gets misread</li>
              <li>Teams react instead of knowing</li>
            </ul>
            <p className="mt-6 text-base text-muted-foreground">
              The result isn’t one big failure. It’s a steady leak you don’t see until it adds up.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="min-h-screen border-b border-border"
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.35, once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto flex min-h-screen items-center px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              There’s a simpler way to handle incoming calls.
            </h2>
            <ul className="mt-8 space-y-3 text-base text-muted-foreground">
              <li>Calls are answered</li>
              <li>The situation is understood</li>
              <li>Urgency is determined</li>
              <li>The right people are notified</li>
              <li>You receive a clear summary of what happened</li>
            </ul>
            <p className="mt-6 text-base text-muted-foreground">
              No call juggling. No guesswork. No loose ends.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="min-h-screen border-b border-border bg-muted/20"
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.35, once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto flex min-h-screen items-center px-6 py-16">
          <div className="max-w-3xl space-y-5 text-base text-muted-foreground">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              How inbound calls are actually handled
            </h2>
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
        </div>
      </motion.section>

      <motion.section
        className="min-h-screen bg-sky-500 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.35, once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto flex min-h-screen items-center px-6 py-16">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Get started</p>
            <p className="mt-5 text-lg text-white/90 sm:text-xl">
              See how your calls are actually handled.
            </p>
            <div className="mt-8">
              <Link
                href="/start?source=scroll-narrative"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-white/90"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
