"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

type Industry = "plumbing" | "hvac" | "electrical";

const transcriptByIndustry: Record<
  Industry,
  Array<{ speaker: string; text: string }>
> = {
  plumbing: [
    { speaker: "Caller", text: "Hi, our water heater is leaking and we can't shut it off." },
    { speaker: "Afterhours", text: "This is [Company] — we handle your calls when the office is closed. I understand you have a water heater leak. Is water actively flowing right now?" },
    { speaker: "Caller", text: "Yes, it's dripping fast and pooling on the floor." },
    { speaker: "Afterhours", text: "I understand. Let me get your details and notify the on-call technician." },
    { speaker: "Afterhours", text: "What's the service address and best number to reach you?" },
    { speaker: "Caller", text: "1120 Ridge Ave, and call 555-0142." },
    { speaker: "Afterhours", text: "I'll notify the on-call technician now. They'll call you back when they can. I can't provide an arrival time, but they'll be in touch shortly." },
  ],
  hvac: [
    { speaker: "Caller", text: "Our furnace stopped and the house is dropping below 60." },
    { speaker: "Afterhours", text: "This is [Company] — we handle your calls when the office is closed. I understand you have no heat. Is anyone in the home elderly, an infant, or have medical conditions?" },
    { speaker: "Caller", text: "Yes, we have a newborn." },
    { speaker: "Afterhours", text: "I understand. Let me get your details and notify the on-call technician right away." },
    { speaker: "Afterhours", text: "What's the service address and best number to reach you?" },
    { speaker: "Caller", text: "4 Maple Court, phone is 555-0196." },
    { speaker: "Afterhours", text: "I'll notify the on-call technician now. They'll call you back when they can. If anything changes or gets worse, please call back immediately." },
  ],
  electrical: [
    { speaker: "Caller", text: "We lost power in half the house and it smells hot." },
    { speaker: "Afterhours", text: "This is [Company] — we handle your calls when the office is closed. I understand you have an electrical issue. Are you seeing any visible sparks or smoke?" },
    { speaker: "Caller", text: "No smoke, but the panel feels warm to the touch." },
    { speaker: "Afterhours", text: "I understand. Let me get your details and notify the on-call technician." },
    { speaker: "Afterhours", text: "What's the service address and best number to reach you?" },
    { speaker: "Caller", text: "78 Elm Street, 555-0173." },
    { speaker: "Afterhours", text: "I'll notify the on-call technician now. They'll call you back when they can. If anything changes or gets worse, please call back immediately." },
  ],
};

export default function HomeInteractiveDemo() {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const [industry, setIndustry] = useState<Industry>("plumbing");
  const [lineIndex, setLineIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  const transcript = transcriptByIndustry[industry];
  const progress = Math.min(100, ((lineIndex + 1) / transcript.length) * 100);

  useEffect(() => {
    setLineIndex(0);
    lineRefs.current = [];
  }, [industry]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % transcript.length);
    }, 2400);
    return () => clearInterval(id);
  }, [transcript.length, prefersReducedMotion]);

  useEffect(() => {
    const container = transcriptScrollRef.current;
    const target = lineRefs.current[lineIndex];
    if (!container || !target) return;
    if (container.scrollHeight <= container.clientHeight) return;

    const lineTop = target.offsetTop;
    const lineBottom = lineTop + target.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (lineTop < viewTop) {
      container.scrollTop = lineTop;
    } else if (lineBottom > viewBottom) {
      container.scrollTop = lineBottom - container.clientHeight;
    }
  }, [lineIndex, transcript.length]);

  return (
    <section className="border-b border-border bg-background py-16 sm:py-20 lg:py-24" data-scroll-section>
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Interactive demo
            </p>
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
              See the call unfold as the system captures what matters.
            </h2>
          </div>

          <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background" aria-hidden="true">
                  <div className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Call playback</p>
                  <p className="text-xs text-muted-foreground">Simulated transcript</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
                {String(Math.floor((lineIndex * 6) / 60)).padStart(2, "0")}:
                {String((lineIndex * 6) % 60).padStart(2, "0")} /{" "}
                {String(Math.floor((transcript.length * 6) / 60)).padStart(2, "0")}:
                {String((transcript.length * 6) % 60).padStart(2, "0")}
              </span>
            </div>

            <div className="mb-4 h-1.5 w-full rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Transcript progress">
              <div
                className={`h-1.5 rounded-full bg-primary ${prefersReducedMotion ? '' : 'transition-all duration-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-border bg-muted/40 p-1" role="group" aria-label="Select industry">
                {(["plumbing", "hvac", "electrical"] as Industry[]).map((key) => (
                  <Button
                    key={key}
                    type="button"
                    onClick={() => setIndustry(key)}
                    aria-pressed={industry === key}
                    variant={industry === key ? "primary" : "ghost"}
                    size="sm"
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                      industry === key
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {key}
                  </Button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{prefersReducedMotion ? 'Manual' : 'Auto-advancing'}</span>
            </div>

            <div
              ref={transcriptScrollRef}
              className="h-64 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-background p-3"
              role="log"
              aria-live="polite"
              aria-label={`Interactive transcript for ${industry} industry. Auto-advancing through conversation.`}
              aria-atomic="false"
            >
              <div className="space-y-2">
                {transcript.map((line, i) => (
                  <div
                    key={`${line.speaker}-${i}`}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                      i === lineIndex
                        ? "border-primary/60 bg-primary/10"
                        : "border-transparent bg-muted/40 text-muted-foreground"
                    }`}
                    aria-current={i === lineIndex ? "true" : undefined}
                  >
                    <p className="text-xs uppercase tracking-wider text-primary">
                      {line.speaker}
                    </p>
                    <p className="mt-1">{line.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
