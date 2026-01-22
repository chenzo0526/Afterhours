"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type CallFlowStep = {
  speaker: "caller" | "system";
  text: string;
  meta?: { urgency?: "low" | "medium" | "high" };
};

type CallFlowDemoProps = {
  steps: CallFlowStep[];
  className?: string;
};

export default function CallFlowDemo({ steps, className }: CallFlowDemoProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const shouldAnimate = !prefersReducedMotion;
  const shouldDelay = shouldAnimate && !isMobile;

  const stepItems = useMemo(
    () =>
      steps.map((step, index) => {
        const previous = steps[index - 1];
        const delay = shouldDelay && previous?.speaker === "caller" && step.speaker === "system"
          ? 0.15
          : 0;
        return { ...step, delay, index };
      }),
    [steps, shouldDelay],
  );

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {stepItems.map((step) => {
        const isCaller = step.speaker === "caller";
        const isHigh = step.meta?.urgency === "high";

        const content = (
          <div className={isCaller ? "flex justify-start" : "flex justify-end"}>
            {isCaller ? (
              <div className="max-w-xl rounded-2xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground shadow-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Caller
                </div>
                <p className="mt-2">{step.text}</p>
              </div>
            ) : (
              <div className="max-w-xl rounded-2xl border border-border bg-card/80 px-5 py-4 text-sm text-foreground shadow-sm">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span>System</span>
                  {step.meta?.urgency ? (
                    shouldAnimate && !isMobile && isHigh ? (
                      <motion.span
                        className="rounded-full border border-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                        initial={{
                          backgroundColor: "rgba(148, 163, 184, 0.2)",
                          color: "rgba(148, 163, 184, 0.9)",
                        }}
                        whileInView={{
                          backgroundColor: "rgba(248, 113, 113, 0.2)",
                          color: "rgba(248, 113, 113, 0.95)",
                        }}
                        viewport={{ amount: 0.4, once: true }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        Urgency: High
                      </motion.span>
                    ) : isHigh ? (
                      <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">
                        Urgency: High
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Urgency: {step.meta.urgency}
                      </span>
                    )
                  ) : null}
                </div>
                <p className="mt-3 text-muted-foreground">{step.text}</p>
              </div>
            )}
          </div>
        );

        if (!shouldAnimate) {
          return (
            <div key={`${step.speaker}-${step.index}`} className="opacity-100">
              {content}
            </div>
          );
        }

        return (
          <motion.div
            key={`${step.speaker}-${step.index}`}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.25, once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: step.delay }}
          >
            {/* Motion begins on intersection; restrained for operational clarity. */}
            {/* TODO(PASS-6): add richer system formatting and industry presets. */}
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}
