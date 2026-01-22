'use client'

import { motion } from 'framer-motion'

export default function CallFlowDemo() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-semibold tracking-tight">
          What actually happens on a call
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          A real example of how inbound calls are handled when your team isn’t available.
        </p>
      </div>

      <div className="space-y-6">
        {[
          { speaker: 'Caller', text: 'Hi, I’ve got water leaking under my sink.' },
          { speaker: 'Afterhours', text: 'Is the leak active right now?' },
          { speaker: 'Caller', text: 'Yes, it’s still dripping.' },
          {
            speaker: 'Afterhours',
            text: 'Thanks. This is urgent — notifying your tech now.',
          },
        ].map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-xl border border-border bg-background p-5"
          >
            <p className="text-xs uppercase tracking-widest text-sky-400">
              {line.speaker}
            </p>
            <p className="mt-2 text-sm">{line.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
