'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CallNarrativeDetail from "@/components/visual/CallNarrativeDetail";
import CallNarrativePhone from "@/components/visual/CallNarrativePhone";
import { Button } from "@/components/ui/button";

export default function CallNarrativeSection() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(phoneRef, { once: true, margin: '-100px' });

  return (
    <section className="border-b border-border bg-background py-20 md:py-28">
      <div className="container mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex justify-center lg:justify-end" ref={phoneRef}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <CallNarrativePhone>
              <div className="flex h-full flex-col justify-center space-y-4 p-4">
                {/* Incoming Call Notification */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ 
                    delay: 0.5, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  className="flex flex-col items-center space-y-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    Incoming
                  </p>
                  <p className="text-sm font-medium text-foreground/90">
                    Service request
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Leak · Urgent
                  </p>
                </motion.div>

                {/* Accept Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center pt-2"
                >
                  <motion.div
                    animate={{
                      scale: isInView ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Button 
                      variant="primary" 
                      className="rounded-full px-8 py-2 text-sm font-semibold"
                    >
                      Accept
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </CallNarrativePhone>
          </motion.div>
        </div>
        <div className="space-y-4">
          <CallNarrativeDetail label="Caller" value="Service request" tone="default" />
          <CallNarrativeDetail label="Issue" value="Water leak under sink" tone="default" />
          <CallNarrativeDetail label="Urgency" value="High — active drip" tone="urgent" />
          <CallNarrativeDetail label="Outcome" value="On-call notified, will call back" tone="muted" />
        </div>
      </div>
    </section>
  );
}
