"use client";

import { motion } from "framer-motion";
import CallFlowDemo from "@/components/CallFlowDemo";

export default function HomeHero() {
  return (
    <section className="relative min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <motion.div
          className="space-y-6 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Inbound calls handled the way they should be.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70 sm:text-xl">
            Answer every call, capture what matters, surface urgency, and deliver a clear summary—so
            nothing slips and your team always knows what happened.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 md:mt-24"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <CallFlowDemo />
        </motion.div>
      </div>
    </section>
  );
}
