"use client";

import { motion } from "framer-motion";
import CallNarrativeDetail from "@/components/visual/CallNarrativeDetail";
import CallNarrativePhone from "@/components/visual/CallNarrativePhone";

export default function CallNarrativeSection() {
  return (
    <motion.section
      className="border-b border-border bg-slate-950 py-20 md:py-28"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.25, once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex justify-center lg:justify-end">
          <CallNarrativePhone>
            <div className="flex h-full flex-col justify-center space-y-3 p-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Incoming
              </p>
              <p className="text-sm font-medium text-white/90">
                Service request
              </p>
              <p className="text-xs text-white/60">
                Leak · Urgent
              </p>
            </div>
          </CallNarrativePhone>
        </div>
        <div className="space-y-4">
          <CallNarrativeDetail label="Caller" value="Service request" tone="default" />
          <CallNarrativeDetail label="Issue" value="Water leak under sink" tone="default" />
          <CallNarrativeDetail label="Urgency" value="High — active drip" tone="urgent" />
          <CallNarrativeDetail label="Outcome" value="Tech notified, en route" tone="muted" />
        </div>
      </div>
    </motion.section>
  );
}
